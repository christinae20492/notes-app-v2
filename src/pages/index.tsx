"use client";

import Head from "next/head";
import React, { useState, useEffect } from "react";
import { SortPicker } from "@/app/components/sorter";
import { NoteModal } from "@/app/components/notemodal";
import Layout from "@/app/components/ui/layout";
import { MultiSelectCounter } from "@/app/components/ui/selectcounter";
import { SearchBar } from "@/app/components/searchbar";
import FolderItem from "@/app/components/folderlogic";
import NoteItem from "@/app/components/notelogic";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faShuffle,
  faThumbtack,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { Folder, Note } from "../app/utils/types";
import { failToast, processing, successToast, warnToast } from "@/app/utils/toast";
import SessionProviderWrapper from "@/app/components/session";
import {
  getAllNotes,
  pinMultiNotes,
  trashSelectedNotes,
  unpinMultiNotes,
  updateNote,
} from "@/app/utils/notesapi";
import { signIn, useSession } from "next-auth/react";
import { getServerSideProps } from "@/app/middleware";
import {
  addMultiToFolder,
  createNewFolder,
  getAllFolders,
} from "@/app/utils/folderapi";

export default function Index() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolder, setNewFolder] = useState("");
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [textInputVisible, setTextInputVisible] = useState(false);
  const [searchBar, setSearchBar] = useState(false);
  const [openSorter, setOpenSorter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const [refresh, setRefresh] = useState(false);
  const [isloading, setLoading] = useState(true);

  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [inputText, setInputText] = useState("New folder");
  const router = useRouter();

  const pinnedNotes = notes?.filter((note) => note.tag === "important") || [];
  const regularNotes = notes?.filter((note) => note.tag !== "important") || [];

  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const { data: session, status } = useSession();

  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

    useEffect(() => {
    getServerSideProps;
    if (status === "loading") return;

    if (status === "unauthenticated") {
      signIn()
    }
  }, [status, router]);


  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  useEffect(() => {
    if (!isMultiSelect) {
      setSelectedNotes([]);
    }
  }, [isMultiSelect]);

  const fetchData = async () => {
    setLoading(true);
    const loadedNotes = await getAllNotes(session, status);
    const loadedFolders = await getAllFolders(session, status);
    if (loadedNotes && loadedFolders) {
      setNotes(Array.isArray(loadedNotes) ? loadedNotes : []);
      setFolders(Array.isArray(loadedFolders) ? loadedFolders : []);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (refresh) {
      fetchData();
      setRefresh(false);
    }
  }, [refresh]);

  const handleSaveNote = async (updatedContent: any) => {
    if (!currentNote) return null;
    await updateNote(currentNote.id, updatedContent, session, status);
    setModalOpen(false);
  };

  const handleAddNotes = () => {
    const getFolderIdFromNotes = (
      ids: string[],
      allFolders: Folder[]
    ): string | undefined => {
      const folderIdSet = new Set(allFolders.map((folder) => folder.id));

      for (let i = 0; i < ids.length; i++) {
        const currentId = ids[i];
        if (folderIdSet.has(currentId)) {
          return currentId;
        }
      }
    };

    let folder = getFolderIdFromNotes(selectedNotes, folders);

    if (!folder) {
      failToast("No folder selected.");
      return;
    }

    addMultiToFolder(selectedNotes, folder, session, status);

    setIsMultiSelect(false);
    setSelectedNotes([]);
    router.push(`/${folder}`);
  };

  const handleSelectAllNotes = (notesArray: Note[]) => {
    if (selectedNotes.length === notesArray.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(notesArray.map((note: Note) => note.id));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNewFolder(inputText, session, status);
    setTextInputVisible(false);
    getAllFolders(session, status).then((data) =>
      setFolders(Array.isArray(data) ? data : [])
    );;
  };

  const handleSelectFolder = (folderId: string) => {
    if (!folderId) return;
    setSelectedNotes((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleMultiPin = async (session: any, status: any) => {
    if (isMultiSelect) {
      const fullSelectedNoteObjects: Note[] = notes.filter((note) =>
        selectedNotes.includes(note.id)
      );
      const allAreNone = fullSelectedNoteObjects.every(
        (note) => note.tag === "none"
      );
      const allAreImportant = fullSelectedNoteObjects.every(
        (note) => note.tag === "important"
      );
      if (allAreNone) {
        processing("Processing...")
        await pinMultiNotes(selectedNotes, session, status);
        successToast("Selected notes pinned!");
      } else if (allAreImportant) {
        processing("Processing...")
        await unpinMultiNotes(selectedNotes, session, status);
        successToast("Selected notes unpinned!");
      } else {
        warnToast(
          "Cannot multi-pin/unpin: Selection contains a mix of pinned, unpinned, or other tagged notes."
        );
        return;
      }

      setSelectedNotes([]);
      setIsMultiSelect(false);
      await getAllNotes(session, status);
    }
  };

  const handleNoteClick = (note: Note) => {
    if (isMultiSelect) {
      setSelectedNotes((prev) => {
        return prev.includes(note.id)
          ? prev.filter((id) => id !== note.id)
          : [...prev, note.id];
      });
    } else {
      setCurrentNote(note);
      setModalOpen(true);
    }
  };

  return (
    <SessionProviderWrapper>
      <Layout
        isMultiSelect={isMultiSelect}
        setIsMultiSelect={setIsMultiSelect}
        setRefresh={setRefresh}
        searchBar={searchBar}
        setSearchBar={setSearchBar}
      >
        {isMultiSelect && <MultiSelectCounter selectedNotes={selectedNotes} />}

        {searchBar && <SearchBar setNotes={setNotes} isHomePage={true} />}

        <div className="bg-lightgrey p-8 rounded-lg shadow-lg w-lg text-center">
          {folders.length === 0 ? (
            <p className="text-lg text-gray-500 text-center">
              You don't have any folders...yet!
            </p>
          ) : (
            <div className="note-container">
              {folders.map((folder) => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  isSelected={selectedNotes.includes(folder.id)}
                  isMultiSelect={isMultiSelect}
                  onSelect={handleSelectFolder}
                />
              ))}
            </div>
          )}
          <button
            className="submit-button"
            onClick={() => setTextInputVisible(!textInputVisible)}
          >
            Add New Folder
          </button>
          {textInputVisible && (
            <form>
              <input
                type="text"
                className="p-1 rounded-l-md"
                placeholder="Name your folder"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></input>
              <input
                type="submit"
                className="bg-steelgrey p-2 text-sm text-white rounded-r-md"
                onClick={handleFormSubmit}
              ></input>
            </form>
          )}
        </div>

        <div className="max-h-1/2 p-4 justify-around">
          {pinnedNotes.length === 0 ? (
            <div className="hidden">
              <p>null</p>
            </div>
          ) : (
            <div className="note-container">
              {pinnedNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={selectedNotes.includes(note.id)}
                  isPinned={true}
                  isMultiSelect={isMultiSelect}
                  onClick={handleNoteClick}
                />
              ))}
            </div>
          )}
        </div>

        <div className="max-h-3/4 justify-around">
          {notes.length === 0 ? (
            <p className="text-lg text-gray-500 text-center font-body">
              No notes available. Add a note to get started!
            </p>
          ) : (
            <div className="note-container">
              {regularNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={selectedNotes.includes(note.id)}
                  isPinned={false}
                  isMultiSelect={isMultiSelect}
                  onClick={handleNoteClick}
                />
              ))}
            </div>
          )}
        </div>

        {isMultiSelect && (
          <div className="bg-white rounded-xl min-w-5/6 min-h-6 float-right absolute bottom-4 right-6 ring-2 drop-shadow-md p-2">
            <button
              className="mx-3 scale-150"
              onClick={() => trashSelectedNotes(selectedNotes, session, status)}
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
            <button className="mx-3 scale-150" onClick={handleAddNotes}>
              <FontAwesomeIcon icon={faShuffle} />
            </button>
            <button
              className="mx-3 scale-150"
              onClick={() => handleMultiPin(session, status)}
            >
              <FontAwesomeIcon icon={faThumbtack} />
            </button>
            <button
              className={`mx-3 scale-150 ${
                selectedNotes.length === notes.length ? "text-blue-500" : ""
              }`}
              onClick={() => handleSelectAllNotes(notes)}
            >
              <FontAwesomeIcon icon={faCircleCheck} />
            </button>
          </div>
        )}

        <NoteModal
          isOpen={isModalOpen}
          note={currentNote}
          onClose={() => setModalOpen(false)}
          onSaveNote={handleSaveNote}
          isInFolder={false}
          isInTrash={false}
          folderId={undefined}
        />
      </Layout>
    </SessionProviderWrapper>
  );
}
