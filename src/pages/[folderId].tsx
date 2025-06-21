import { KeyboardEvent, useEffect, useState } from "react";
import {
  loadNotes,
  moveMultipleNotesToTrash,
  togglePinNotes,
} from "@/app/utils/noteutility";
import {
  addNotesToFolder,
  loadFolders,
  removeNotesFromFolder,
  renameFolder,
} from "@/app/utils/folderutil";
import Layout from "@/app/components/ui/layout";
import { NoteModal } from "@/app/components/notemodal";
import { MultiSelectCounter } from "@/app/components/ui/selectcounter";
import NoteItem from "@/app/components/notelogic";
import { useRouter } from "next/router";
import { Folder, Note } from "../app/utils/types";
import {
  faTrashCan,
  faMinus,
  faThumbtack,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { failToast } from "@/app/utils/toast";
import SessionProviderWrapper from "@/app/components/session";
import {
  addMultiToFolder,
  deleteFolder,
  getAllFolders,
  getFolderNotes,
  moveMultiFromFolder,
} from "@/app/utils/folderapi";
import React from "react";
import { useSession } from "next-auth/react";
import { getAllNotes, trashSelectedNotes, updateNote } from "@/app/utils/notesapi";
import loading from "@/app/components/ui/loading";

export default function ViewFolder() {
  const router = useRouter();
  const { folderId } = router.query;

  const [folder, setFolder] = useState<Folder | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [mainNotes, setMainNotes] = useState<Note[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [noteModalVisible, setNoteModalVisible] = useState(false);

  const [searchBar, setSearchBar] = useState(false);

  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [openSorter, setOpenSorter] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [folderTitle, setFolderTitle] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  const findAndFetchFolder = async () => {
    if (status === "loading" || !folderId) {
      return;
    }

    const loadedFolders = await getAllFolders(session, status);
    const foldersArray = Array.isArray(loadedFolders) ? loadedFolders : [];
    setFolders(foldersArray);
    const foundFolder = foldersArray.find((f) => f.id === folderId);

    if (!foundFolder) {
      router.push("/");
      failToast("Folder not found.");
    } else {
      setFolder(foundFolder);
      setFolderTitle(foundFolder.title || "");

      const filteredNotes = await getFolderNotes(
        foundFolder.id,
        session,
        status
      );
      setNotes(Array.isArray(filteredNotes) ? filteredNotes : []);
    }
  };

  const fetchNotes = async () => {
    const loadedNotes = await getAllNotes(session, status);
    const notesArray = Array.isArray(loadedNotes) ? loadedNotes : [];
    setMainNotes(notesArray);
    return mainNotes;
  };

  useEffect(() => {
    findAndFetchFolder();
  }, [folderId, router]);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (refresh) {
      getFolderNotes(folder.id, session, status)
        .then((data) => setNotes(Array.isArray(data) ? data : []))
        .catch((error) =>
          console.error("Error refreshing folder notes:", error)
        )
        .finally(() => setRefresh(false));
    }
  }, [refresh]);

  useEffect(() => {
    if (!isMultiSelect) {
      setSelectedNotes([]);
    }
  }, [isMultiSelect]);

  const pinnedNotes = notes.filter((note: Note) => note.tag === "important");
  const normalNotes = notes.filter((note: Note) => note.tag !== "important");

  const handleSelectAllNotes = (notesArray: Note[]) => {
    if (selectedNotes.length === notesArray.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(notesArray.map((note: Note) => note.id));
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!folder) return null;
    ("");
    if (window.confirm("Are you sure you want to delete this folder?")) {
      setLoading(true);
      if (notes.length > 0) {
        setSelectedNotes(notes.map((note: Note) => note.id));
        await moveMultiFromFolder(selectedNotes, folder.id, session, status);
        setSelectedNotes([]);
      }
      await deleteFolder(id, session, status);
      setLoading(false);
      router.push("/");
    }
  };

  const handleSaveNote = async (updatedContent: any) => {
    await updateNote(currentNote?.id, updatedContent, session, status)
    setModalOpen(false);
  };

  const handleAddNotes = async () => {
    if (!folder) return null;
    await addMultiToFolder(selectedNotes, folder.id, session, status);
    setNoteModalVisible(false);
    setSelectedNotes([]);
    getFolderNotes(folder.id, session, status);
  };

  const handleRenameFolder = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && typeof folderId === "string") {
      renameFolder(folderId, folderTitle, setFolders, setIsEditingTitle);
    }
  };

  const handleRenameFolderKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && typeof folderId === "string") {
      renameFolder(folderId, folderTitle, setFolders, setIsEditingTitle);
    }
  };

  const handleRenameFolderBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (typeof folderId === "string") {
      renameFolder(folderId, folderTitle, setFolders, setIsEditingTitle);
    }
  };

  const handleMoveToTrash = () => {
    if (!folder) return null;

    trashSelectedNotes(selectedNotes, session, status);

    setSelectedNotes([]);
    getFolderNotes(folder.id, session, status)
    .then((data) => setNotes(Array.isArray(data) ? data : []))
  };

  const handleTogglePinNotes = () => {
    if (!folder) return null;
    togglePinNotes(selectedNotes, setNotes, folder.id);
    setSelectedNotes([]);
    setIsMultiSelect(false);
  };

  const handleRemoveNotes = async () => {
    if (!folder) return null;
    await moveMultiFromFolder(selectedNotes, folder.id, session, status);
    setSelectedNotes([]);
    getFolderNotes(folder.id, session, status)
    .then((data) => setNotes(Array.isArray(data) ? data : []))
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

  const mainNoteClick = (note: Note) => {
    setSelectedNotes((prev) => {
      return prev.includes(note.id)
        ? prev.filter((id) => id !== note.id)
        : [...prev, note.id];
    });
  };

  if (!folder || loading) {
    return <div>{loading}</div>;
  }

  return (
    <SessionProviderWrapper>
      {isMultiSelect && <MultiSelectCounter selectedNotes={selectedNotes} />}
      <Layout
        setIsMultiSelect={setIsMultiSelect}
        isMultiSelect={isMultiSelect}
        setSearchBar={setSearchBar}
        searchBar={searchBar}
        setRefresh={setRefresh}
      >
        <div className="bg-white top-28 left-24 h-12 w-[calc(100%-6rem)] fixed p-3 text-center shadow-md">
          <h1
            className="text-2xl font-header shadow-sm"
            onDoubleClick={() => setIsEditingTitle(true)}
          >
            {isEditingTitle ? (
              <input
                className="text-center rounded-md outline-darkgrey"
                type="text"
                value={folderTitle}
                onChange={(e) => setFolderTitle(e.target.value)}
                onKeyDown={handleRenameFolderKey}
                onBlur={handleRenameFolderBlur}
                autoFocus
              />
            ) : (
              folderTitle
            )}
          </h1>
        </div>

        <div className="bg-white top-40 left-24 h-22 w-[calc(100%-6rem)] fixed p-3 shadow-md">
          <button
            className="button bg-red"
            onClick={() => handleDeleteFolder(folder.id)}
          >
            Delete Folder
          </button>
          <button
            className="button bg-pastelblue"
            onClick={() => setNoteModalVisible(true)}
          >
            Add Notes
          </button>
        </div>

        <div className="mt-32 max-h-1/2 w-3/4 p-4 justify-around">
          {pinnedNotes.length === 0 ? (
            <div className="hidden">
              <p>null</p>
            </div>
          ) : (
            <div className="note-container">
              {pinnedNotes.map((note: Note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={selectedNotes.includes(note.id)}
                  isPinned={true}
                  isMultiSelect={isMultiSelect}
                  onClick={handleNoteClick}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-5/6 max-h-5/6 p-5 justify-around">
          {notes.length === 0 ? (
            <p className="text-lg text-gray-500 text-center font-body">
              Aww, this folder's empty.
            </p>
          ) : (
            <div className="note-container">
              {normalNotes.map((note: Note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={selectedNotes.includes(note.id)}
                  isPinned={false}
                  isMultiSelect={isMultiSelect}
                  onClick={handleNoteClick}
                />
              ))}
            </div>
          )}
        </div>

        {noteModalVisible && (
          <div className="modal-backdrop">
            <div className="modal-main bg-white h-3/4 w-5/6">
              <button
                className="button w-16 bg-red"
                onClick={() => setNoteModalVisible(false)}
              >
                x
              </button>
              <div className="outline-2 outline-red max-h-1/2 p-8 justify-around overflow-y-scroll">
                <div className="note-container">
                  {mainNotes.map((note: Note) => (
                    <NoteItem
                      key={note.id}
                      note={note}
                      isSelected={selectedNotes.includes(note.id)}
                      isPinned={false}
                      isMultiSelect={isMultiSelect}
                      onClick={mainNoteClick}
                    />
                  ))}
                </div>
              </div>
              <button className="button" onClick={handleAddNotes}>
                Add To Folder
              </button>
            </div>
          </div>
        )}

        {isMultiSelect && (
          <div className="bg-white rounded-xl min-w-5/6 min-h-6 float-right absolute bottom-4 right-6 ring-2 drop-shadow-md p-2">
            <button className="mx-3 scale-150" onClick={handleMoveToTrash}>
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
            <button className="mx-3 scale-150" onClick={handleRemoveNotes}>
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <button className="mx-3 scale-150" onClick={handleTogglePinNotes}>
              <FontAwesomeIcon icon={faThumbtack} />
            </button>
            <button
              className={`mx-3 scale-150 ${
                selectedNotes.length === notes.length ? "text-blue-500" : ""
              }`}
              onClick={() => handleSelectAllNotes(folder.notes)}
            >
              <FontAwesomeIcon icon={faCircleCheck} />
            </button>
          </div>
        )}

        <NoteModal
          isOpen={isModalOpen}
          note={currentNote}
          onClose={() => setModalOpen(false)}
          onSaveNote={handleSaveNote}
          isInFolder={true}
          isInTrash={false}
          folderId={typeof folderId === "string" ? folderId : undefined}
        />
      </Layout>
    </SessionProviderWrapper>
  );
}
