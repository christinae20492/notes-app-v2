import { loadNotes } from "./noteutility";
import { Note, Folder } from "./types";
import { getFolders, saveFolders, getNotes, saveNotes } from "./localStorage";
import { successToast, failToast } from "./toast";
import { idGen, getCurrentDateTime } from "./rangen";

export const loadFolders = (): Folder[] => getFolders();


export const createFolder = (
  folderName: string,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
  setNewFolder: React.Dispatch<React.SetStateAction<string>>,
  setTextInputVisible: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  try {
    const existingFolders = getFolders();
    const newFolder: Folder = {
      title: folderName,
      id: "F" + idGen(),
      dateCreated: getCurrentDateTime(),
      notes: [],
    };

    const updatedFolders = [...existingFolders, newFolder];
    saveFolders(updatedFolders);
    setFolders(updatedFolders);
    setNewFolder("");
    setTextInputVisible(false);

    successToast("New folder created!");
  } catch (error) {
    failToast(`Folder creation failed: ${error}`);
  }
};

export const moveNoteToFolder = (
  noteId: string,
  folderId: string,
  setNotes: (arg0: any) => void,
  setFolders: (arg0: any) => void,
) => {
  try {
    const existingNotes = loadNotes();
    const existingFolders = loadFolders();

    const note = existingNotes.find((n: { id: any }) => n.id === noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    const updatedNotes = existingNotes.filter(
      (n: { id: any }) => n.id !== noteId
    );
    const updatedFolders = existingFolders.map(
      (folder: { id: string; title: string, dateCreated: string, notes: Note[] }) => {
        if (folder.id === folderId) {
          return { ...folder, notes: [...folder.notes, note] };
        }
        return folder;
      }
    );

    setNotes(updatedNotes);
    setFolders(updatedFolders);

    saveNotes(updatedNotes);
    saveFolders(updatedFolders);

    successToast("Note moved to folder successfully!");
  } catch (error) {
    failToast(`Failed to move note to folder: ${error}`);
    console.log(error);
  }
};

export const removeNoteFromFolder = (
  noteId: string,
  folderId: string,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>
): void => {
  try {
    const folders = loadFolders();
    const mainNotes = loadNotes();

    let noteToRemove: Note | null = null;
    const updatedFolders = folders.map((folder) => {
      if (folder.id === folderId) {
        const updatedNotes = folder.notes.filter((note: Note) => {
          if (note.id === noteId) {
            noteToRemove = note;
            return false;
          }
          return true;
        });
        return { ...folder, notes: updatedNotes };
      }
      return folder;
    });

    if (noteToRemove) {
      const updatedMainNotes = [...mainNotes, noteToRemove];
      saveFolders(updatedFolders);
      saveNotes(updatedMainNotes);
      setFolders(updatedFolders);
      setNotes(updatedMainNotes);

      successToast("Note moved back to main notes successfully!");
    } else {
      failToast("Note not found in the specified folder.");
    }
  } catch (error) {
    console.error("Failed to remove note from folder:", error);
    failToast("Failed to remove note from folder.");
  }
};

export const addNotesToFolder = (
  noteIds: string[],
  folderId: string,
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>
): void => {
  try {
    const notes = getNotes();
    const folders = getFolders();

    const selectedNotes = notes.filter((note) => noteIds.includes(note.id));
    const remainingNotes = notes.filter((note) => !noteIds.includes(note.id));

    const updatedFolders = folders.map((folder) =>
      folder.id === folderId
        ? { ...folder, notes: [...folder.notes, ...selectedNotes] }
        : folder
    );

    saveNotes(remainingNotes);
    saveFolders(updatedFolders);

    setNotes(remainingNotes);
    setFolders(updatedFolders);
    successToast("Notes added to folder");
  } catch (error) {
    failToast(`Failed to add notes to folder: ${error}`);
  }
};

export const removeNotesFromFolder = (
  noteIds: string[],
  folderId: string,
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
): void => {
  try {
    const notes = getNotes();
    const folders = getFolders();

    const updatedFolders = folders.map((folder) => {
      if (folder.id === folderId) {
        const notesToRemove = folder.notes.filter((note) =>
          noteIds.includes(note.id)
        );
        const remainingFolderNotes = folder.notes.filter(
          (note) => !noteIds.includes(note.id)
        );

        const updatedNotes = [...notes, ...notesToRemove];
        saveNotes(updatedNotes);
        setNotes(updatedNotes);

        return { ...folder, notes: remainingFolderNotes };
      }
      return folder;
    });

    saveFolders(updatedFolders);
    setFolders(updatedFolders);
    successToast("Notes removed from folder");
  } catch (error) {
    failToast(`Failed to remove notes from folder: ${error}`);
    console.error("Error in removeNotesFromFolder:", error);
  }
};

export const deleteFolder = (
  folderId: string,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
): void => {
  try {
    const folders = getFolders();
    const notes = getNotes();

    const folderToDelete = folders.find((folder) => folder.id === folderId);
    if (!folderToDelete) throw new Error("Folder not found");

    const updatedFolders = folders.filter((folder) => folder.id !== folderId);
    const updatedNotes = [...notes, ...folderToDelete.notes];

    saveFolders(updatedFolders);
    saveNotes(updatedNotes);

    setFolders(updatedFolders);
    setNotes(updatedNotes);
    successToast("Folder deleted successfully!");
  } catch (error) {
    failToast(`Failed to delete folder: ${error}`);
  }
};

export const renameFolder = (
  folderId: string,
  newTitle: string,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
  setIsEditingTitle: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  try {
    const folders = getFolders();
    const updatedFolders = folders.map((folder) =>
      folder.id === folderId ? { ...folder, title: newTitle } : folder
    );

    saveFolders(updatedFolders);
    setFolders(updatedFolders);
    setIsEditingTitle(false);
    successToast("Folder renamed successfully!");
  } catch (error) {
    failToast(`Failed to rename folder: ${error}`);
  }
};
