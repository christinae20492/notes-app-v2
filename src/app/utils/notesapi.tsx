import { useSession } from "next-auth/react";
import { Note } from "./types";
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