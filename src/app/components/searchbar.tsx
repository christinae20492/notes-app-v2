import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { searchNotes } from "@/app/utils/notesapi";
import { Note } from "@/app/utils/types";

interface SearchBarProps {
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  isHomePage?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ setNotes, isHomePage }) => {
  const [query, setQuery] = useState("");
  const { data: session, status } = useSession();
  const [folderSearchMessage, setFolderSearchMessage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setNotes([]);
      setFolderSearchMessage(null);
      return;
    }

    if (status === "loading" || status === "unauthenticated") {
        console.warn("Authentication status: ", status);
        return;
    }

    try {
      const searchResults = await searchNotes(query, session, status);

      if (searchResults) {
        setNotes(searchResults.notes);
        if (isHomePage && searchResults.foundInFolders) {
          setFolderSearchMessage("We've found results in your folders...");
        } else {
          setFolderSearchMessage(null);
        }
      } else {
        setNotes([]);
        setFolderSearchMessage(null);
      }
    } catch (error) {
      console.error("Error during search:", error);
      setNotes([]);
      setFolderSearchMessage(null);
    }
  };

  return (
    <div className="mx-auto my-0 block text-center">
      <form onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Looking for something?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="p-2 w-4/5 md:w-2/5"
        />
        <button type="submit" className="button rounded-none">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </form>
      {isHomePage && folderSearchMessage && (
        <span className="text-sm text-gray-600 mt-1 block">
          {folderSearchMessage}
        </span>
      )}
    </div>
  );
};