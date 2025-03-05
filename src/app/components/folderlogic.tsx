import React from "react";
import Router, { useRouter } from "next/router";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface FolderItemProps {
  folder: {
    id: string;
    title: string;
  };
  isSelected: boolean;
  isMultiSelect: boolean;
  onSelect: (folderId: string) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  isSelected,
  isMultiSelect,
  onSelect,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (isMultiSelect) {
      onSelect(folder.id);
    } else {
      router.push(`/${encodeURIComponent(folder.id)}`);
    }
  };

  return (
    <div
      key={folder.id}
      className={`folder-item ${isSelected ? "selected-folder" : ""}`}
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={faFolderOpen} className="scale-150 text-darksteelgrey"/>
      <br />
      <span className="folder-title">{folder.title}</span>
    </div>
  );
};

export default FolderItem;
