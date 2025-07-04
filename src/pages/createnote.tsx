"use client";

import { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
import Layout from "@/app/components/ui/layout";
import { warnToast } from "@/app/utils/toast";
import { Note } from "@/app/utils/types";
import SessionProviderWrapper from "@/app/components/session";
import { createNewNote } from "@/app/utils/notesapi";
import { signIn, useSession } from "next-auth/react";
import { getServerSideProps } from "@/app/middleware";
import Head from "next/head";

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

    useEffect(() => {
    getServerSideProps;
    if (status === "loading") return;

    if (status === "unauthenticated") {
      signIn()
    }
  }, [status, router]);


  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title && !body) {
      setIsInvalid(true);
      warnToast("Please provide either the title or body");
      return;
    }

    await createNewNote(title, body, color, category, session, status);
    router.push("/");
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
        <Head>
        <title>VaultNotes - Create a Note</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
        <div className="flex flex-col flex-none w-full h-2/3 p-4 items-center text-center lg:ml-18 md:-ml-10">
          <form className="md:w-3/4 w-full" onSubmit={handleSaveNote}>
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
              onChange={(e)=>setCategory(e.target.value)}
            />
            <datalist id="category">
              <option value="Personal"></option>
              <option value="School"></option>
              <option value="Grocery"></option>
              <option value="Work"></option>
              <option value="Projects"></option>
              <option value="Ideas"></option>
              <option value="Meetings"></option>
              <option value="Finances"></option>
              <option value="Health"></option>
              <option value="Fitness"></option>
              <option value="Travel"></option>
              <option value="Recipes"></option>
              <option value="Reading"></option>
              <option value="Movies"></option>
              <option value="Music"></option>
              <option value="Hobbies"></option>
              <option value="Shopping"></option>
              <option value="To-Do"></option>
              <option value="Goals"></option>
              <option value="Wishlist"></option>
              <option value="Home"></option>
              <option value="Auto"></option>
              <option value="Contacts"></option>
              <option value="Events"></option>
              <option value="Passwords"></option>
              <option value="Research"></option>
              <option value="Development"></option>
              <option value="Learning"></option>
              <option value="Marketing"></option>
              <option value="Sales"></option>
              <option value="Clients"></option>
              <option value="Vendors"></option>
              <option value="Training"></option>
              <option value="Reminders"></option>
              <option value="Journal"></option>
              <option value="Quotes"></option>
              <option value="Emergency"></option>
              <option value="Software"></option>
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
