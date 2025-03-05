"use client"

import { useState, useEffect } from "react";
import { removeNoteFromFolder } from "@/app/utils/folderutil";
import {
  copyNote,
  deleteNote,
  permanentlyDeleteNote,
  restoreNote,
} from "@/app/utils/noteutility";
import { useRouter } from "next/router";
import { Note } from "../utils/types";

interface NoteModalProps {
  isOpen: boolean;
  note: any;
  onClose: () => void;
  onSaveNote?: (updatedContent: string) => void;
  setNotes?: React.Dispatch<React.SetStateAction<any[]>>;
  setFolders?: React.Dispatch<React.SetStateAction<any[]>>;
  setTrashNotes?: React.Dispatch<React.SetStateAction<any[]>>;
  isInFolder: boolean;
  isInTrash: boolean;
  folderId?: string;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  note,
  onClose,
  onSaveNote,
  setNotes,
  setFolders,
  setTrashNotes,
  isInFolder,
  isInTrash,
  folderId,
}) => {
  const [updatedNote, setUpdatedNote] = useState(note);
  const router = useRouter();

  useEffect(() => {
    if (note) {
      setUpdatedNote(note.body);
    }
  }, [note]);

  const handleDeleteNote = () => {
    if (note?.id && setNotes ) {
      if (isInFolder) {
        deleteNote(note.id, setNotes, folderId);
      } else if (isInTrash) {
        permanentlyDeleteNote(note.id);
      } else {
        deleteNote(note.id, setNotes);
      }
      onClose();
    }
  };

  const handleRestoreNote = () => {
    if (!setTrashNotes) return null;
    restoreNote(note.id, setTrashNotes);
    router.push("/");
  };

  const handleCopyNote = () => {
    if (!setNotes) return null;
    if (isInFolder) {
      copyNote(note.id, setNotes, folderId);
      onClose();
    } else {
      copyNote(note.id, setNotes);
      onClose();
    }
  };

  const handleMoveNote = () => {

    if (!setFolders || !setNotes) return null;

    if (!folderId) {
      console.error("Invalid folder id.");
      return;
    }

    removeNoteFromFolder(note.id, folderId, setFolders, setNotes);
    router.push('/')
    onClose();
  };

if (!isOpen) return null;
  if (!onSaveNote) return null;

  return (
    <div className="modal-backdrop z-20">
      <div className="modal-main bg-lightgrey h-1/2 w-1/2 z-40">
        <h2 className="text-xl font-semibold mb-4 text-center">{note.title}</h2>
        <textarea
          value={updatedNote}
          onChange={(e) => setUpdatedNote(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded h-3/4"
        />
        <div className="flex justify-end mt-4">
          {isInTrash ? (
            <button className="button bg-blue" onClick={handleRestoreNote}>
              Restore
            </button>
          ) : (
            <button className="button bg-blue" onClick={handleCopyNote}>
              Copy
            </button>
          )}

          <button className="button bg-red" onClick={handleDeleteNote}>
            Delete
          </button>

          <button className="button" onClick={onClose}>
            Close
          </button>

          {isInTrash ? (
            <div></div>
          ) : (
            <button
              className="submit-button"
              onClick={() => onSaveNote(updatedNote)}
            >
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
