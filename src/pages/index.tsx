"use client"

import Head from "next/head";
import React, { useState, useEffect } from "react";
import {
  loadNotes,
  moveMultipleNotesToTrash,
  togglePinNotes,
} from "@/app/utils/noteutility";
import {
  createFolder,
  loadFolders,
  addNotesToFolder,
} from "@/app/utils/folderutil";

import { SortPicker } from "@/app/components/sorter";
import { NoteModal } from "@/app/components/notemodal";
import Layout from "@/app/components/ui/layout";
import { MultiSelectCounter } from "@/app/components/ui/selectcounter";
import { SearchBar } from "@/app/components/searchbar";
import FolderItem from "@/app/components/folderlogic";
import NoteItem from "@/app/components/notelogic";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faShuffle, faThumbtack, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Folder, Note } from "../app/utils/types";
import { failToast } from "@/app/utils/toast";

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
  const [loading, setLoading] = useState(true);

  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [inputText, setInputText] = useState("New folder");
  const router = useRouter();

  const pinnedNotes = notes?.filter((note) => note.tag === "important") || [];
  const regularNotes = notes?.filter((note) => note.tag !== "important") || [];

  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isMultiSelect) {
      setSelectedNotes([]);
    }
  }, [isMultiSelect]);

  const fetchData = async () => {
    setLoading(true);
    const loadedNotes = await loadNotes();
    const loadedFolders = await loadFolders();
    setNotes(Array.isArray(loadedNotes) ? loadedNotes : []);
    setFolders(Array.isArray(loadedFolders) ? loadedFolders : []);
    setLoading(false);
  };

  const handleSaveNote = (updatedContent: any) => {
    const updatedNote = { ...currentNote, content: updatedContent };
    console.log("Updated note:", updatedNote);
    setModalOpen(false);
  };

  const handleAddNotes = () => {
    const getFolderIdFromNotes = (ids: string[]) => {
      for (let i = 0; i < ids.length; i++) {
        if (ids[i].startsWith("F")) {
          return ids[i];
        }
      }
    };

    let folder = getFolderIdFromNotes(selectedNotes);

     if (!folder) {
      failToast("No folder selected.")
      return;
    }

    addNotesToFolder(selectedNotes, folder, setNotes, setFolders);

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
    createFolder(inputText, setFolders, setNewFolder, setTextInputVisible);
  };

  const handleSelectFolder = (folderId: string) => {
    if (!folderId) return;
    setSelectedNotes((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
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
    <>
      {isMultiSelect && <MultiSelectCounter selectedNotes={selectedNotes} />}

      <Layout
        setIsMultiSelect={setIsMultiSelect}
        isMultiSelect={isMultiSelect}
        setSearchBar={setSearchBar}
        searchBar={searchBar}
        setOpenSorter={setOpenSorter}
        setShowSettings={setShowSettings}
        setRefresh={setRefresh}
      >
        {searchBar && <SearchBar setNotes={setNotes} />}

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

        <SortPicker
          isOpen={openSorter}
          setIsModalVisible={setOpenSorter}
          notes={notes}
          setNotes={setNotes}
        />

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
              onClick={() =>
                moveMultipleNotesToTrash(selectedNotes, setNotes)
              }
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
            <button className="mx-3 scale-150" onClick={handleAddNotes}>
            <FontAwesomeIcon icon={faShuffle} />
            </button>
            <button
              className="mx-3 scale-150"
              onClick={() => togglePinNotes(selectedNotes, setNotes, undefined)}
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
  setNotes={setNotes}
  setFolders={setFolders}
          isInFolder={false}
          isInTrash={false}
          folderId={undefined}
        />
      </Layout>
    </>
  );
}
