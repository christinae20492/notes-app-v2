import { useSession } from "next-auth/react";
import { EditNote, Note } from "./types";
import { failToast, successToast, warnToast } from "./toast";
import router from "next/router";


export const getAllNotes = async (session: any, status: string): Promise<Note[] | undefined> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to view your notes.");
    return;
  }

  try {
    const response = await fetch("/api/note");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch notes.");
    }

    const data: Note[] = await response.json();
    successToast("Notes loaded successfully!");
    return data;
  } catch (err: any) {
    console.error("Error fetching notes:", err);
    failToast(err.message || "Error loading notes.");
    return undefined;
  }
};

export const getTrashNotes = async (session: any, status: string): Promise<Note[] | undefined> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to view your notes.");
    return;
  }

  try {
    const response = await fetch("/api/note/gettrash");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch notes.");
    }

    const data: Note[] = await response.json();
    successToast("Notes loaded successfully!");
    return data;
  } catch (err: any) {
    console.error("Error fetching notes:", err);
    failToast(err.message || "Error loading notes.");
    return undefined;
  }
};

export const createNewNote = async (
  title: string,
  body: string,
  color: string,
  category: string,
  session: any,
  status: string
): Promise<boolean> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to create notes.");
    return false;
  }

  if (!title.trim() || !body.trim()) {
    warnToast("Title and body cannot be empty.");
    return false;
  }

  const noteData = {
    title,
    body,
    color,
    category,
    tag: "none",
  };

  try {
    const response = await fetch("/api/note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      successToast(result.message || "Note created successfully!");
      return true;
    } else {
      failToast(result.message || "Failed to create note. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Client-side error creating note:", error);
    failToast("An unexpected error occurred. Please try again.");
    return false;
  }
};

export const updateNote = async (
  noteId: string,
  updateData: EditNote,
  session: any,
  status: string
): Promise<boolean> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to update notes.");
    return false;
  }

  if (!noteId) {
    warnToast("Note ID is required for update.");
    return false;
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    warnToast("No update data provided for the note.");
    return false;
  }

  try {
    const response = await fetch(`/api/note/${noteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) { 
      successToast(result.message || "Note updated successfully!");
      return true; 
    } else {
      failToast(result.message || "Failed to update note. Please try again.");
      return false; 
    }
  } catch (error) {
    console.error("Client-side error updating note:", error);
    failToast("An unexpected error occurred while updating note.");
    return false;
  }
};

export const copyNote = async (
  note: Note,
  session: any,
  status: string
): Promise<boolean> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to create notes.");
    return false;
  }

  const noteData = {
    title: note.title + " copy",
    body: note.body,
    color: note.color,
    category: note.category,
    tag: note.tag,
  };

  try {
    const response = await fetch("/api/note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      successToast(result.message || "Note copied successfully!");
      return true;
    } else {
      failToast(result.message || "Failed to copy note. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Client-side error copy note:", error);
    failToast("An unexpected error occurred. Please try again.");
    return false;
  }
};

export const deleteNote = async (id: string, session: any, status: string): Promise<boolean> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to delete note.");
    return false;
  }

  if (!id) {
    warnToast("Note ID is required for deletion.");
    return false;
  }

  try {
    const response = await fetch(`/api/note/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        successToast(result.message || "Note deleted successfully!");
      } else {
        successToast("Note deleted successfully!");
      }
      return true;
    } else {
      const errorResult = await response.json();
      failToast(errorResult.message || "Failed to delete note. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Client-side error deleting note:", error);
    failToast("An unexpected error occurred. Please try again.");
    return false;
  }
};

export const sendNoteToTrash = async (noteId: string, session: any, status: string): Promise<boolean> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to move notes to trash.");
    return false;
  }

  if (!noteId) {
    warnToast("Note ID is required to move to trash.");
    return false;
  }

  try {
    const response = await fetch(`/api/note/trash/${noteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      successToast(result.message || "Note moved to trash successfully!");
      return true;
    } else {
      failToast(result.message || "Failed to move note to trash. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Client-side error moving note to trash:", error);
    failToast("An unexpected error occurred. Please try again.");
    return false;
  }
};

export const restoreNoteFromTrash = async (noteId: string, session: any, status: string): Promise<boolean> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to move notes to trash.");
    return false;
  }

  if (!noteId) {
    warnToast("Note ID is required to move to trash.");
    return false;
  }

  try {
    const response = await fetch(`/api/note/restore/${noteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      successToast(result.message || "Note restored successfully!");
      return true;
    } else {
      failToast(result.message || "Failed to restore note. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Client-side error restoring note:", error);
    failToast("An unexpected error occurred. Please try again.");
    return false;
  }
};

export const deleteSelectedNotes = async (selectedNoteIds: string[], session, status) => {

    if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to delete notes.");
    return false;
  }

  if (selectedNoteIds.length === 0) {
    alert("Please select at least one note to trash.");
    return;
  }

  if (!window.confirm(`Are you sure you want to delete ${selectedNoteIds.length} note(s)?`)) {
    return;
  }

  try {
    const response = await fetch('/api/noteutil/multidelete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteIds: selectedNoteIds }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(result.message);
    } else {
      console.error(result.message || "Failed to delete selected notes.");
    }
  } catch (error) {
    console.error("Client-side error delete multiple notes:", error);
  }
};

export const trashSelectedNotes = async (selectedNoteIds: string[], session, status) => {

    if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to move notes.");
    return false;
  }

  if (selectedNoteIds.length === 0) {
    alert("Please select at least one note to trash.");
    return;
  }

  if (!window.confirm(`Are you sure you want to move ${selectedNoteIds.length} note(s) to trash?`)) {
    return;
  }

  try {
    const response = await fetch('/api/noteutil/multitrash', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteIds: selectedNoteIds }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(result.message);
    } else {
      console.error(result.message || "Failed to trash selected notes.");
    }
  } catch (error) {
    console.error("Client-side error trashing multiple notes:", error);
  }
};

export const restoreSelectedNotes = async (selectedNoteIds: string[]) => {

  if (selectedNoteIds.length === 0) {
    alert("Please select at least one note to restore.");
    return;
  }

  try {
    const response = await fetch('/api/noteutil/multirestore', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteIds: selectedNoteIds }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(result.message);
    } else {
      console.error(result.message || "Failed to restore selected notes.");
    }
  } catch (error) {
    console.error("Client-side error restoring multiple notes:", error);
  }
};