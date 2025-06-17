
import { KeyboardEvent, useEffect, useState } from "react";
import {
  loadNotes,
  moveMultipleNotesToTrash,
  togglePinNotes,
} from "@/app/utils/noteutility";
import {
  addNotesToFolder,
  deleteFolder,
  loadFolders,
  removeNotesFromFolder,
  renameFolder,
} from "@/app/utils/folderutil";
import Layout from "@/app/components/ui/layout";
import { NoteModal } from "@/app/components/notemodal";
import { MultiSelectCounter } from "@/app/components/ui/selectcounter";
import NoteItem from "@/app/components/notelogic";
import { useRouter } from "next/router";
import { Folder, Note } from "../app/utils/types";
import { faTrashCan, faMinus, faThumbtack, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { failToast } from "@/app/utils/toast";
import SessionProviderWrapper from "@/app/components/session";

export default function ViewFolder() {
  const router = useRouter();
  const { folderId } = router.query;

  const [folder, setFolder] = useState<Folder | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [mainNotes, setMainNotes] = useState<Note[]>([]);
   const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [noteModalVisible, setNoteModalVisible] = useState(false);

  const [searchBar, setSearchBar] = useState(false);

  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [openSorter, setOpenSorter] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [folderTitle, setFolderTitle] = useState<string>("");

  const pinnedNotes = notes.filter((note: Note) => note.tag === "important");
  const normalNotes = notes.filter((note: Note) => note.tag !== "important");

  const fetchData = async () => {
    const loadedFolders = await loadFolders();
    const foldersArray = Array.isArray(loadedFolders) ? loadedFolders : [];
    setFolders(foldersArray);
    return foldersArray;
  };

  const fetchFolderNotes = async () => {
    const folders = await loadFolders();
    const currentFolder = folders.find(
      (folder) => folder.id === folderId
    );
    setNotes(currentFolder?.notes || []);
  };

  const fetchNotes = async () => {
    const loadedNotes = await loadNotes();
    const notesArray = Array.isArray(loadedNotes) ? loadedNotes : [];
    setMainNotes(notesArray);
    return mainNotes;
  };
const fetchAndFindFolder = async () => {
      const loadedFolders = await fetchData();
      const foundFolder = loadedFolders.find((f) => f.id === folderId);
      console.log(folderId)
      console.log(loadedFolders)
      console.log(foundFolder)

      if (!foundFolder) {
        router.push("/");
        failToast("Folder not found.");
      } else {
        setFolder(foundFolder);
        setFolderTitle(foundFolder.title || "");
        setNotes(foundFolder.notes || []);
      }
    };


  useEffect(() => {
    fetchAndFindFolder();
  }, [folderId, router]);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (!isMultiSelect) {
      setSelectedNotes([]);
    }
  }, [isMultiSelect]);

  const handleSelectAllNotes = (notesArray: Note[]) => {
    if (selectedNotes.length === notesArray.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(notesArray.map((note: Note) => note.id));
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!folder) return null;''
    if (window.confirm("Are you sure you want to delete this folder?")) {
      await deleteFolder(id, setFolders, setNotes);
      setNotes((prevNotes) => [...prevNotes, ...folder.notes]);
      router.push("/");
    }
  };

  const handleSaveNote = (updatedContent: any) => {
    const updatedNote = { ...currentNote, content: updatedContent };
    console.log("Updated note:", updatedNote);
    setModalOpen(false);
  };

  const handleAddNotes = async () => {
    if (!folder) return null;
    await addNotesToFolder(selectedNotes, folder.id, setNotes, setFolders);
    setNoteModalVisible(false);
    setSelectedNotes([]);
    fetchFolderNotes();
  };

  const handleRenameFolder = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && typeof folderId === "string") {
      renameFolder(folderId, folderTitle, setFolders, setIsEditingTitle);
    }
  };

  const handleRenameFolderKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && typeof folderId === "string") {
      renameFolder(folderId, folderTitle, setFolders, setIsEditingTitle);
    }
  };
  
  const handleRenameFolderBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (typeof folderId === "string") {
      renameFolder(folderId, folderTitle, setFolders, setIsEditingTitle);
    }
  };
  

  const handleMoveToTrash = () => {
    if (!folder) return null;
    const folderNotes = folder.notes.filter(
      (note: Note) => !selectedNotes.includes(note.id)
    );

    moveMultipleNotesToTrash(selectedNotes, setNotes, folder.id );

    setFolder({ ...folder, notes: folderNotes });
    setSelectedNotes([]);
    fetchFolderNotes();
  };

  const handleTogglePinNotes = () => {
    if (!folder) return null;
    togglePinNotes(selectedNotes, setNotes, folder.id);
    setSelectedNotes([]);
    setIsMultiSelect(false);
  };

  const handleRemoveNotes = async () => {
    if (!folder) return null;
    await removeNotesFromFolder(
      selectedNotes,
      folder.id,
      setNotes,
      setFolders
    );
    setSelectedNotes([]);
    fetchFolderNotes();
    router.push("/");
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

  const mainNoteClick = (note: Note) => {
    setSelectedNotes((prev) => {
      return prev.includes(note.id)
        ? prev.filter((id) => id !== note.id)
        : [...prev, note.id];
    });
  };

  if (!folder) {
    return <div>Loading...</div>;
  }

  return (
    <SessionProviderWrapper>
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
        <div className="bg-white top-28 left-24 h-12 w-[calc(100%-6rem)] fixed p-3 text-center shadow-md">
          <h1
            className="text-2xl font-header shadow-sm"
            onDoubleClick={() => setIsEditingTitle(true)}
          >
            {isEditingTitle ? (
              <input
                className="text-center rounded-md outline-darkgrey"
                type="text"
                value={folderTitle}
                onChange={(e) => setFolderTitle(e.target.value)}
                onKeyDown={handleRenameFolderKey}
                onBlur={handleRenameFolderBlur}
                autoFocus
              />
            ) : (
              folderTitle
            )}
          </h1>
        </div>

        <div className="bg-white top-40 left-24 h-22 w-[calc(100%-6rem)] fixed p-3 shadow-md">
          <button
            className="button bg-red"
            onClick={() => handleDeleteFolder(folder.id)}
          >
            Delete Folder
          </button>
          <button
            className="button bg-pastelblue"
            onClick={() => setNoteModalVisible(true)}
          >
            Add Notes
          </button>
        </div>

        <div className="mt-32 max-h-1/2 w-3/4 p-4 justify-around">
          {pinnedNotes.length === 0 ? (
            <div className="hidden">
              <p>null</p>
            </div>
          ) : (
            <div className="note-container">
              {pinnedNotes.map((note: Note) => (
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

        <div className="w-5/6 max-h-5/6 p-5 justify-around">
          {notes.length === 0 ? (
            <p className="text-lg text-gray-500 text-center font-body">
              Aww, this folder's empty.
            </p>
          ) : (
            <div className="note-container">
              {normalNotes.map((note: Note) => (
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

        {noteModalVisible && (
          <div className="modal-backdrop">
            <div className="modal-main bg-white h-3/4 w-5/6">
              <button
                className="button w-16 bg-red"
                onClick={() => setNoteModalVisible(false)}
              >
                x
              </button>
              <div className="outline-2 outline-red max-h-1/2 p-8 justify-around overflow-y-scroll">
                <div className="note-container">
                  {mainNotes.map((note: Note) => (
                    <NoteItem
                      key={note.id}
                      note={note}
                      isSelected={selectedNotes.includes(note.id)}
                      isPinned={false}
                      isMultiSelect={isMultiSelect}
                      onClick={mainNoteClick}
                    />
                  ))}
                </div>
              </div>
              <button className="button" onClick={handleAddNotes}>
                Add To Folder
              </button>
            </div>
          </div>
        )}

        {isMultiSelect && (
          <div className="bg-white rounded-xl min-w-5/6 min-h-6 float-right absolute bottom-4 right-6 ring-2 drop-shadow-md p-2">
            <button className="mx-3 scale-150" onClick={handleMoveToTrash}>
            <FontAwesomeIcon icon={faTrashCan} />
            </button>
            <button className="mx-3 scale-150" onClick={handleRemoveNotes}>
            <FontAwesomeIcon icon={faMinus} />
            </button>
            <button className="mx-3 scale-150" onClick={handleTogglePinNotes}>
            <FontAwesomeIcon icon={faThumbtack} />
            </button>
            <button
              className={`mx-3 scale-150 ${
                selectedNotes.length === notes.length ? "text-blue-500" : ""
              }`}
              onClick={() => handleSelectAllNotes(folder.notes)}
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
          isInFolder={true}
          isInTrash={false}
          folderId={typeof folderId === "string" ? folderId : undefined}
        />
      </Layout>
    </SessionProviderWrapper>
  );
}
