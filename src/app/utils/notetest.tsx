import { idGen, getCurrentDateTime } from "./rangen";
import { Note } from "./types";
import { successToast, failToast } from "./toast";
import { App } from "aws-sdk/clients/amplify";

const API_NAME = "notesappv25cd4998f-dev";

export const loadNotes = async (): Promise<Note[]> => {
    try {
      const notes = await API.get(API_NAME, "/notes", {});
      return notes;
    } catch (error) {
      console.error("Failed to load notes:", error);
      return [];
    }
  };
  

  export const saveNote = async (
    title: string,
    body: string,
    color: string,
    category: string,
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
    setNewNote: React.Dispatch<React.SetStateAction<string>>,
  ): Promise<void> => {
    if (!title.trim() && !body.trim()) {
      failToast("Cannot save an empty note.");
      return;
    }
  
    try {
      const newNote: Note = {
        id: idGen(),
        title: title.trim() || "Untitled Note",
        body,
        color,
        category,
        tag: "none",
        dateCreated: getCurrentDateTime(),
        dateDeleted: ""
      };
  
      await API.post(API_NAME, "/notes", { body: newNote });
      setNotes((prev) => [...prev, newNote]);
      setNewNote("");
      successToast("Note saved successfully!");
    } catch (error) {
      failToast(`Failed to save note: ${error}`);
    }
  };