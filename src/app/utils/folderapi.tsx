import { useSession } from "next-auth/react";
import { Folder, Note } from "./types";
import { failToast, successToast, warnToast } from "./toast";
import router from "next/router";


export const getAllFolders = async (session: any, status: string): Promise<Folder[] | undefined> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to view your folders.");
    return;
  }

  try {
    const response = await fetch("/api/folder");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch folders.");
    }

    const data: Folder[] = await response.json();
    successToast("Folders loaded successfully!");
    return data;
  } catch (err: any) {
    console.error("Error fetching folders:", err);
    failToast(err.message || "Error loading folders.");
    return undefined;
  }
};

export const getFolderNotes = async (id: string, session: any, status: string): Promise<Note[] | undefined> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to view your notes.");
    return;
  }

  try {
    const response = await fetch(`/api/note/getfoldernotes/${id}`);

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

export const createNewFolder = async (
  title: string,
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

  if (!title.trim()) {
    warnToast("Title cannot be empty.");
    return false;
  }

  const folderData = {
    title
  };

  try {
    const response = await fetch("/api/folder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(folderData),
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      successToast(result.message || "Folder created successfully!");
      return true;
    } else {
      failToast(result.message || "Failed to create folder. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Client-side error creating folder:", error);
    failToast("An unexpected error occurred. Please try again.");
    return false;
  }
};

export const deleteFolder = async (id: string, session: any, status: string): Promise<boolean> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to delete folders.");
    return false;
  }

  if (!id) {
    warnToast("Folder ID is required for deletion.");
    return false;
  }


  try {
    const response = await fetch(`/api/folder/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        successToast(result.message || "Folder deleted successfully!");
      } else {
        successToast("Folder deleted successfully!");
      }
      return true;
    } else {
      const errorResult = await response.json();
      failToast(errorResult.message || "Failed to delete folder. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Client-side error deleting folder:", error);
    failToast("An unexpected error occurred. Please try again.");
    return false;
  }
};

export const updateFolderTitle = async (
  folderId: string,
  newTitle: string,
  session: any,
  status: string
): Promise<boolean> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to update folders.");
    return false;
  }

  if (!folderId) {
    warnToast("Folder ID is required for update.");
    return false;
  }

  if (!newTitle || !newTitle.trim()) {
    warnToast("Folder title cannot be empty.");
    return false;
  }

  try {
    const response = await fetch(`/api/folder/${folderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: newTitle }),
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      successToast(result.message || "Folder title updated successfully!");
      return true
    } else {
      failToast(result.message || "Failed to update folder title. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Client-side error updating folder title:", error);
    failToast("An unexpected error occurred. Please try again.");
    return false;
};
}

export const moveNoteToFolder = async (
  noteId: string,
  targetFolderId: string | null,
  session: any,
  status: string
): Promise<boolean> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to move notes.");
    return false;
  }

  if (!noteId) {
    warnToast("Note ID is required to move.");
    return false;
  }

  if (typeof targetFolderId !== 'string' && targetFolderId !== null) {
      warnToast("Target folder ID must be a string or null.");
      return false;
  }

  try {
    const response = await fetch(`/api/noteutil/addtofolder/${noteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folderId: targetFolderId }),
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      const message = targetFolderId === null
        ? "Note removed from folder successfully!"
        : "Note moved to folder successfully!";
      successToast(result.message || message);
      return true;
    } else {
      failToast(result.message || "Failed to move note. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Client-side error moving note:", error);
    failToast("An unexpected error occurred. Please try again.");
    return false;
  }
};

export const removeFromFolder = async (
  noteId: string,
  targetFolderId: string,
  session: any,
  status: string
): Promise<boolean> => {
  if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to move notes.");
    return false;
  }

  if (!noteId) {
    warnToast("Note ID is required to move.");
    return false;
  }

  if (typeof targetFolderId !== 'string' && targetFolderId !== null) {
      warnToast("Target folder ID must be a string or null.");
      return false;
  }

  try {
    const response = await fetch(`/api/noteutil/removefromfol/${noteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folderId: targetFolderId }),
      credentials: 'include',
    });

    const result = await response.json();

    if (response.ok) {
      const message = targetFolderId === null
        ? "Note removed from folder successfully!"
        : "Note moved to folder successfully!";
      successToast(result.message || message);
      return true;
    } else {
      failToast(result.message || "Failed to move note. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Client-side error moving note:", error);
    failToast("An unexpected error occurred. Please try again.");
    return false;
  }
};

export const addMultiToFolder = async (selectedNoteIds: string[], folder: string, session, status) => {

    if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to move notes.");
    return false;
  }

  if (selectedNoteIds.length === 0) {
    alert("Please select at least one note to move.");
    return;
  }

  try {
    const response = await fetch('/api/noteutil/multiadd', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteIds: selectedNoteIds, folderId: folder }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(result.message);
    } else {
      console.error(result.message || "Failed to move selected notes.");
    }
  } catch (error) {
    console.error("Client-side error moving multiple notes:", error);
  }
};

export const moveMultiFromFolder = async (selectedNoteIds: string[], folder: string, session, status) => {

    if (status === "loading") {
    warnToast("Authentication status is still loading. Please wait.");
    return false;
  }

  if (status === "unauthenticated") {
    failToast("Please sign in to move notes.");
    return false;
  }

  try {
    const response = await fetch('/api/noteutil/multimove', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteIds: selectedNoteIds, folderId: folder }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(result.message);
    } else {
      console.error(result.message || "Failed to move selected notes.");
    }
  } catch (error) {
    console.error("Client-side error moving multiple notes:", error);
  }
};