import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleList } from "@fortawesome/free-solid-svg-icons";

interface NoteItemProps {
  note: {
    id: string;
    title: string;
    color: string;
    category: string;
  };
  isSelected: boolean;
  isPinned: boolean;
  isMultiSelect: boolean;
  onClick: (note: any) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  isSelected,
  isPinned,
  onClick,
}) => {
  return (
    <div
      key={note.id}
      className={`note-item ${
        isPinned ? "font-semibold bg-lightgrey w-3/4" : ""
      } ${isSelected ? "selected-note" : ""}`}
      onClick={() => onClick(note)}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <div>
      <FontAwesomeIcon icon={faRectangleList} />
      </div>
      <div
        className={`absolute rounded-lg ${
          isPinned ? "w-2 h-8 outline-1 outline-black" : "w-5 h-14"
        }`}
        style={{ backgroundColor: note.color }}
      ></div>
      <div>{note.title}</div>
      {!isPinned && <div className="text-mintGreen-900">{note.category}</div>}
    </div>
  );
};

export default NoteItem;
