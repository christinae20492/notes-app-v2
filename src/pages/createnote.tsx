"use client";

import { useState } from "react";
import Router, { useRouter } from "next/router";
import { saveNote } from "@/app/utils/noteutility";
import Layout from "@/app/components/ui/layout";
import { warnToast } from "@/app/utils/toast";
import { Note } from "@/app/utils/types";
import SessionProviderWrapper from "@/app/components/session";
import { createNewNote } from "@/app/utils/notesapi";
import { useSession } from "next-auth/react";

export default function CreateNote() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [color, setColor] = useState("");
  const [newNote, setNewNote] = useState("");
  const [category, setCategory] = useState("Personal");
  const [bodyHeight, setBodyHeight] = useState(40);
  const router = useRouter();
  const [isInvalid, setIsInvalid] = useState(false);

  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [openSorter, setOpenSorter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [searchBar, setSearchBar] = useState(false);
      const { data: session, status } = useSession();

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title && !body) {
      setIsInvalid(true);
      warnToast("Please provide either the title or body");
      return;
    }

    createNewNote(title, body, color, category, session, status);
    //router.push("/");
  };

  return (
    <SessionProviderWrapper>
      <Layout
        setIsMultiSelect={setIsMultiSelect}
        isMultiSelect={isMultiSelect}
        setOpenSorter={setOpenSorter}
        setShowSettings={setShowSettings}
        setRefresh={setRefresh}
        searchBar={searchBar}
        setSearchBar={setSearchBar}
      >
        <div className="flex flex-col flex-none w-full h-2/3 p-4 items-center justify-center ml-18">
          <form className="w-3/4" onSubmit={handleSaveNote}>
            <input
              name="title"
              placeholder="Title"
              className={`input ${
                isInvalid ? "border-2 border-red bg-pink text-black" : ""
              }`}
              onChange={(e) => setTitle(e.target.value)}
            ></input>
            <input
              list="category"
              name="category"
              placeholder="Define a category"
              className="input"
            />
            <datalist id="category">
              <option value={"Personal"}></option>
              <option value={"School"}></option>
              <option value={"Grocery"}></option>
            </datalist>
            <input
              type="color"
              name="color"
              placeholder="Select the note's color"
              onChange={(e) => setColor(e.target.value)}
            ></input>
            <textarea
              name="body"
              placeholder="Body"
              className={`input ${
                isInvalid ? "border-2 border-red bg-pink text-black" : ""
              }`}
              onChange={(e) => setBody(e.target.value)}
            ></textarea>
            <input type="submit" className="submit-button"></input>
          </form>
        </div>
      </Layout>
    </SessionProviderWrapper>
  );
}
