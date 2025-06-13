import { successToast, failToast } from "./toast";
import { idGen, getCurrentDateTime } from "./rangen";
import { Folder, Note } from "./types";
import {
  getNotes,
  saveNotes,
  getTrash,
  saveTrash,
  getFolders,
  saveFolders,
} from "./localStorage";

const NOTES_KEY = "notes";
const TRASH_KEY = "trash notes";


//Getters

export const loadNotes = (): any[] => {
  try {
    const jsonValue = localStorage.getItem(NOTES_KEY);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error(`Failed to load notes: ${error}`);
    return [];
  }
};

export const loadTrash = (): any[] => {
  try {
    const jsonValue = localStorage.getItem(TRASH_KEY);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error(`Failed to load trash: ${error}`);
    return [];
  }
};

const getNotesArray = (folderId?: string): Note[] => {
  if (folderId) {
    const folders = getFolders();
    const folder = folders.find((f) => f.id === folderId);
    return folder ? folder.notes : [];
  }
  return getNotes();
};

const saveNotesArray = (notes: Note[], folderId?: string): void => {
  if (folderId) {
    const folders = getFolders();
    const updatedFolders = folders.map((folder) =>
      folder.id === folderId ? { ...folder, notes } : folder
    );
    saveFolders(updatedFolders);
  } else {
    saveNotes(notes);
  }
};

//Note functions

export const saveNote = (
  title: string,
  body: string,
  color: string,
  category: string,
  setNotes: React.Dispatch<React.SetStateAction<any[]>>,
  setNewNote: React.Dispatch<React.SetStateAction<string>>,
): void => {
  try {
    const existingNotes = getNotes();

    if (!title.trim() && !body.trim()) {
      failToast("Cannot save an empty note without a title or body.");
      return;
    }

    if (!title.trim()) {
      let untitledNumber = 1;
      let newTitle = `Untitled note ${untitledNumber}`;

      while (existingNotes.some((note) => note.title === newTitle)) {
        untitledNumber += 1;
        newTitle = `Untitled note ${untitledNumber}`;
      }

      title = newTitle;
    }

    const newNote = {
      id: idGen(),
      title,
      body,
      color,
      category,
      tag: "none",
      dateCreated: getCurrentDateTime(),
    };

    const newNotes = [...existingNotes, newNote];
    setNotes(newNotes);
    localStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
    setNewNote("");
    successToast("Note saved successfully!");
  } catch (error) {
    failToast(`Failed to save note: ${error}`);
  }
};

export const deleteNote = (
  id: string,
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  folderId?: string
): void => {
  try {
    const notes = getNotesArray(folderId);
    const noteToDelete = notes.find((note) => note.id === id);

    if (!noteToDelete) {
      failToast("Note not found.");
      return;
    }

    const remainingNotes = notes.filter((note) => note.id !== id);
    noteToDelete.dateDeleted = new Date().toISOString();
    saveNotesArray(remainingNotes, folderId);
    const trashNotes = getTrash();
    saveTrash([...trashNotes, noteToDelete]);

    setNotes(remainingNotes);
    successToast("Note deleted successfully!");
  } catch (error) {
    failToast(`Failed to delete note: ${error}`);
  }
};

export const permanentlyDeleteNote = (
  id: string,
): void => {
  try {
    const trashNotes = loadTrash();
    const updatedTrashNotes = trashNotes.filter((note) => note.id !== id);
    localStorage.setItem(TRASH_KEY, JSON.stringify(updatedTrashNotes));
    saveTrash(updatedTrashNotes);

    successToast("Note permanently deleted.");
  } catch (error) {
    failToast(`Failed to permanently delete note: ${error}`);
  }
};

export const restoreNote = (
  id: string,
  setTrashNotes: React.Dispatch<React.SetStateAction<any[]>>,
): void => {
  try {
    const trashNotes = loadTrash();
    const noteToRestore = trashNotes.find((note) => note.id === id);

    if (!noteToRestore) {
      failToast("Note not found in Trash.");
      return;
    }

    const updatedTrashNotes = trashNotes.filter((note) => note.id !== id);
    const existingNotes = getNotes();
    const updatedNotes = [...existingNotes, noteToRestore];
    localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    localStorage.setItem(TRASH_KEY, JSON.stringify(updatedTrashNotes));

    saveNotes(updatedNotes);
    setTrashNotes(updatedTrashNotes);

    successToast("Note restored successfully.");
  } catch (error) {
    failToast(`Failed to restore note: ${error}`);
  }
};

export const editNote = (
  id: string,
  title: string,
  body: string,
  folderId?: string,
): void => {
  try {
    const existingNotes = getNotesArray(folderId);
    const newNotes = existingNotes.map((note) =>
      note.id === id ? { ...note, title, body } : note
    );
    localStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
    successToast("Note edited successfully!");
  } catch (error) {
    failToast(`Failed to edit note: ${error}`);
  }
};

export const sortNotes = (notes: Note[], sortBy: keyof Note): Note[] => {
  const compareFunctions: Record<keyof Note, (a: Note, b: Note) => number> = {
    title: (a, b) => a.title.localeCompare(b.title),
    dateCreated: (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
    category: (a, b) => a.category.localeCompare(b.category),
    id: () => 0,
    body: () => 0,
    color: () => 0,
    tag: () => 0,
    dateDeleted: () => 0,
  };

  return [...notes].sort(compareFunctions[sortBy] || (() => 0));
};


export const copyNote = (
  id: string,
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  folderId?: string
): void => {
  const existingNotes = getNotesArray(folderId);
  const noteToCopy = existingNotes.find((note) => note.id === id);

  if (!noteToCopy) {
    failToast("Note not found.");
    return;
  }

  const copiedNote = {
    ...noteToCopy,
    id: idGen(),
    title: `${noteToCopy.title} Copy`,
    body: `${noteToCopy.body}`,
    color: `${noteToCopy.color}`,
    category: `${noteToCopy.category}`,
    dateCreated: getCurrentDateTime(),
  };

  if (folderId) {
    const updatedNotes = [...existingNotes, copiedNote];
    saveNotesArray(updatedNotes);
  } else {
    const updatedNotes = [...getNotes(), copiedNote];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  }

  successToast("Note copied successfully!");
};

export const togglePinNotes = (
  ids: string[],
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  folderId?: string
): void => {
  try {
    const notes = getNotesArray(folderId);
    const updatedNotes = notes.map((note) =>
      ids.includes(note.id)
        ? { ...note, tag: note.tag === "important" ? "none" : "important" }
        : note
    );

    saveNotesArray(updatedNotes, folderId);
    setNotes(updatedNotes);
    successToast("Notes updated successfully!");
  } catch (error) {
    failToast(`Failed to update notes: ${error}`);
  }
};

export const searchNotes = (query: string, folderId?: string): Note[] => {
  const notes = getNotesArray(folderId);

  if (!query.trim()) {
    return notes;
  }

  const normalizedQuery = query.toLowerCase();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(normalizedQuery) ||
      note.body.toLowerCase().includes(normalizedQuery)
  );
};

//Multi note proccesses

export const moveMultipleNotesToTrash = (
  ids: string[],
    setNotes: React.Dispatch<React.SetStateAction<any[]>>,
  folderId?: string,
): void => {
  try {
    const existingNotes = getNotesArray(folderId);
    const trashNotes = loadTrash();
    const notesToTrash = existingNotes.filter((note) => ids.includes(note.id));
    notesToTrash.map((item) => {
      item.dateDeleted = new Date().toISOString();
    });
    const newNotes = existingNotes.filter((note) => !ids.includes(note.id));

    localStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
    saveNotesArray(newNotes, folderId);
    setNotes(newNotes);

    const updatedTrashedNotes = [...trashNotes, ...notesToTrash];
    localStorage.setItem(TRASH_KEY, JSON.stringify(updatedTrashedNotes));
    console.log("trashNotes:", trashNotes);

    successToast("Notes moved to trash successfully!");
  } catch (error) {
    failToast(`Failed to move notes to trash: ${error}`);
  }
};

export const deleteMultipleNotes = (
  ids: string[],
  setTrashNotes: React.Dispatch<React.SetStateAction<any[]>>,
): void => {
  try {
    const trashNotes = loadTrash();
    const updatedTrashNotes = trashNotes.filter(
      (note) => !ids.includes(note.id)
    );
    localStorage.setItem(TRASH_KEY, JSON.stringify(updatedTrashNotes));
    setTrashNotes(updatedTrashNotes);

    successToast("Notes permanently deleted.");
  } catch (error) {
    failToast(`Failed to permanently delete note: ${error}`);
  }
};

export const restoreMultipleNotes = (
  ids: string[],
  setTrashNotes: React.Dispatch<React.SetStateAction<any[]>>,
  setNotes: React.Dispatch<React.SetStateAction<any[]>>,
): void => {
  try {
    const trashNotes = loadTrash();
    const notesToRestore = trashNotes.filter((note) => ids.includes(note.id));

    if (!notesToRestore) {
      failToast("Notes not found in Trash.");
      return;
    }

    const updatedTrashNotes = trashNotes.filter(
      (note) => !ids.includes(note.id)
    );
    const existingNotes = getNotes();
    const updatedNotes = [...existingNotes, ...notesToRestore];

    localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    localStorage.setItem(TRASH_KEY, JSON.stringify(updatedTrashNotes));

    setNotes(updatedNotes);
    setTrashNotes(updatedTrashNotes);

    successToast("Note restored successfully.");
  } catch (error) {
    failToast(`Failed to restore note: ${error}`);
  }
};
