import React, { useState, useEffect } from "react";
import Layout from "@/app/components/ui/layout";
import { MultiSelectCounter } from "@/app/components/ui/selectcounter";
import { Note } from "@/app/utils/types";
import { failToast, warnToast } from "@/app/utils/toast";
import { NoteModal } from "@/app/components/notemodal";
import NoteItem from "@/app/components/notelogic";
import { useRouter } from "next/router";
import {
  faRectangleList,
  faTrashCan,
  faArrowRotateRight,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SessionProviderWrapper from "@/app/components/session";
import {
  deleteNote,
  deleteSelectedNotes,
  getTrashNotes,
  restoreNoteFromTrash,
  restoreSelectedNotes,
} from "@/app/utils/notesapi";
import { signIn, useSession } from "next-auth/react";
import loading from "@/app/components/ui/loading";
import { getServerSideProps } from "@/app/middleware";

export default function TrashPage() {
  const [trashNotes, setTrashNotes] = useState<Note[]>([]);
  const router = useRouter();

  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isloading, setLoading] = useState(false);
  const { data: session, status } = useSession();

    useEffect(() => {
    getServerSideProps;
    if (status === "loading") return;

    if (status === "unauthenticated") {
      signIn()
    }
  }, [status, router]);


  useEffect(() => {
    removeExpiredNotes();
    fetchData();
    warnToast(
      "Notes that've been trashed 7 days ago will automatically be permanently deleted."
    );
  }, []);

  useEffect(() => {
    if (!isMultiSelect) {
      setSelectedNotes([]);
    }
  }, [isMultiSelect]);

  useEffect(() => {
    if (refresh) {
      getTrashNotes(session, status)
        .then((data) => setTrashNotes(Array.isArray(data) ? data : []))
        .catch((error) =>
          console.error("Error refreshing folder notes:", error)
        )
        .finally(() => setRefresh(false));
    }
  }, [refresh]);

  const fetchData = async () => {
    setLoading(true);
    getTrashNotes(session, status).then((data) =>
      setTrashNotes(Array.isArray(data) ? data : [])
    );
    setLoading(false);
  };

  const handleSelectAllNotes = (notesArray: Note[]) => {
    if (selectedNotes.length === notesArray.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(notesArray.map((note) => note.id));
    }
  };

  const handleRestore = async (id: string) => {
    if (selectedNote) {
      await restoreNoteFromTrash(selectedNote.id, session, status);
      getTrashNotes(session, status).then((data) =>
        setTrashNotes(Array.isArray(data) ? data : [])
      );
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedNote) return null;
    await deleteNote(selectedNote.id, session, status);
    getTrashNotes(session, status).then((data) =>
      setTrashNotes(Array.isArray(data) ? data : [])
    );
  };

  const handleDeleteSelectedNotes = async () => {
    if (selectedNotes.length === 0) {
      alert("Please select notes to delete.");
      return;
    }
    setLoading(true);
    await deleteSelectedNotes(selectedNotes, session, status, true);
    setSelectedNotes([]);
    setIsMultiSelect(false);
    getTrashNotes(session, status).then((data) =>
      setTrashNotes(Array.isArray(data) ? data : [])
    );
    setLoading(false);
  };

  const handleRestoreSelectedNotes = async () => {
    await restoreSelectedNotes(selectedNotes);
    setSelectedNotes([]);
    router.push("/");
  };

  const handleNoteClick = (note: Note) => {
    if (isMultiSelect) {
      setSelectedNotes((prev) => {
        return prev.includes(note.id)
          ? prev.filter((id) => id !== note.id)
          : [...prev, note.id];
      });
    } else {
      setCurrentNote(note);
      setModalOpen(true);
    }
  };

const removeExpiredNotes = async (): Promise<void> => {
  try {

    const currentTrashNotes = await getTrashNotes(session, status);

    if (!currentTrashNotes || currentTrashNotes.length === 0) {
      return;
    }

    const notesToWarnAbout: Note[] = [];
    const idsToPermanentlyDelete: string[] = [];
    const now = Date.now();

    currentTrashNotes.forEach((note) => {
      if (!note.dateDeleted) {
        console.warn(`Note "${note.title}" (ID: ${note.id}) is in trash but has no dateDeleted. Skipping expiration check.`);
        return;
      }

      const dateDeleted = new Date(note.dateDeleted).getTime();
      if (isNaN(dateDeleted)) {
        console.warn(`Note "${note.title}" (ID: ${note.id}) has an invalid dateDeleted: ${note.dateDeleted}. Skipping expiration check.`);
        return;
      }

      const ageInDays = (now - dateDeleted) / (1000 * 60 * 60 * 24);

      if (ageInDays >= 6 && ageInDays < 7) {
        notesToWarnAbout.push(note);
      } else if (ageInDays >= 7) {
        idsToPermanentlyDelete.push(note.id);
      }
    });

    if (idsToPermanentlyDelete.length > 0) {
      const success = await deleteSelectedNotes(idsToPermanentlyDelete, session, status, false);

      if (success) {
      } else {
        failToast("Failed to permanently delete some expired notes.");
      }
    }
  } catch (error: any) {
    console.error("Error in removeExpiredNotes:", error);
    failToast(`Failed to check and remove expired notes: ${error.message || "Unknown error"}`);
  }
};

if (isloading) {
  return <div>{loading()}</div>
}

  return (
    <SessionProviderWrapper>
      {isMultiSelect && <MultiSelectCounter selectedNotes={selectedNotes} />}
      <Layout
        setIsMultiSelect={setIsMultiSelect}
        isMultiSelect={isMultiSelect}
        setRefresh={setRefresh}
      >
        <div className="max-h-1/2 p-8">
          {trashNotes.length === 0 ? (
            <p className="text-lg text-gray-500 text-center font-body">
              The trash was just taken out.
            </p>
          ) : (
            <div className="note-container">
              {trashNotes.map((note) => (
                <div key={note.id} className="">
                  <NoteItem
                    key={note.id}
                    note={note}
                    isSelected={selectedNotes.includes(note.id)}
                    isPinned={false}
                    isMultiSelect={isMultiSelect}
                    onClick={handleNoteClick}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {isMultiSelect && (
          <div className="bg-white rounded-xl min-w-5/6 min-h-6 float-right absolute bottom-4 right-6 ring-2 drop-shadow-md p-2">
            <button
              className="mx-3 scale-150"
              onClick={handleDeleteSelectedNotes}
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
            <button
              className="mx-3 scale-150"
              onClick={handleRestoreSelectedNotes}
            >
              <FontAwesomeIcon icon={faArrowRotateRight} />
            </button>
            <button
              className={`mx-3 scale-150 ${
                selectedNotes.length === trashNotes.length
                  ? "text-blue-500"
                  : ""
              }`}
              onClick={() => handleSelectAllNotes(trashNotes)}
            >
              <FontAwesomeIcon icon={faCircleCheck} />
            </button>
          </div>
        )}

          <NoteModal
            isOpen={isModalOpen}
            note={currentNote}
            onClose={() => setModalOpen(false)}
            isInFolder={false}
            isInTrash={true}
            folderId={undefined}
          />

      </Layout>
    </SessionProviderWrapper>
  );
}
