"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Note } from "../utils/types";
import {
  copyNote,
  deleteNote,
  getAllNotes,
  getTrashNotes,
  restoreNoteFromTrash,
  sendNoteToTrash,
  updateNote,
} from "../utils/notesapi";
import { useSession } from "next-auth/react";
import { getFolderNotes, removeFromFolder } from "../utils/folderapi";

interface NoteModalProps {
  isOpen: boolean;
  note: any;
  onClose: () => void;
  onSaveNote?: (updatedContent: string) => void;
  isInFolder: boolean;
  isInTrash: boolean;
  folderId?: string;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  note,
  onClose,
  onSaveNote,
  isInFolder,
  isInTrash,
  folderId,
}) => {
  const [updatedNote, setUpdatedNote] = useState(note);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (note) {
      setUpdatedNote(note.body);
    }
  }, [note]);

  const handleDeleteNote = async () => {
    if (!isInTrash) {
      await sendNoteToTrash(note.id, session, status);
    } else {
      if (
        !window.confirm(
          `Are you sure you want to permanently delete this note?`
        )
      ) {
        return;
      }
      setLoading(true);
      await deleteNote(note.id, session, status);
      setLoading(false);
    }

    onClose();
    await getTrashNotes(session, status);
  };

  const handleRestoreNote = async () => {
    if (!isInTrash) return;
    setLoading(true);
    await restoreNoteFromTrash(note.id, session, status);
    setLoading(false);
    router.push("/");
  };

  const handleCopyNote = async () => {
    await copyNote(note, session, status);
    onClose();
    getAllNotes(session, status);
  };

  const handleMoveNote = async () => {
    if (!folderId) {
      console.error("Invalid folder id.");
      return;
    }

    await removeFromFolder(note.id, folderId, session, status);
    onClose();
    router.push("/");
  };

  const handleSaveNote = async () => {
    await updateNote(note.id, { body: updatedNote }, session, status);
    onClose();
    if (isInFolder && folderId) {
      getFolderNotes(folderId, session, status);
    } else {
      getAllNotes(session, status);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop z-20">
      <div className="modal-main bg-lightgrey">
        <h2 className="text-xl font-semibold mb-4 text-center">{note.title}</h2>
        <textarea
          value={updatedNote}
          onChange={(e) => setUpdatedNote(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded md:h-96 h-96"
        />
        <div className="md:flex justify-stretch place-content-center mt-4">
          {isInTrash ? (
            <button className="button bg-blue" onClick={handleRestoreNote}>
              Restore
            </button>
          ) : (
            <button className="button bg-blue" onClick={handleCopyNote}>
              Copy
            </button>
          )}

          <button
            className="button bg-crimsonRed-700"
            onClick={handleDeleteNote}
          >
            Delete
          </button>

          <button className="button" onClick={onClose}>
            Close
          </button>

          {!isInTrash && onSaveNote && (
            <button className="submit-button md:w-20 lg:w-32 lg:h-10 w-full" onClick={handleSaveNote}>
              Save Note
            </button>
          )}

          {isInFolder && (
            <button className="button bg-cerulean" onClick={handleMoveNote}>
              Remove from Folder
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
