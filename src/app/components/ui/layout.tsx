"use client"

import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpShortWide,
  faCircleCheck,
  faMagnifyingGlass,
  faPlus,
  faRotate,
  faTrashCan,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "@/app/tailwind.css"

interface LayoutProps {
  children: React.ReactNode;
  setIsMultiSelect: (value: boolean) => void;
  isMultiSelect: boolean;
  setSearchBar: (value: boolean) => void;
  searchBar: boolean;
  setOpenSorter: (visible: boolean) => void;
  setShowSettings: (visible: boolean) => void;
  setRefresh: (value: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  setIsMultiSelect,
  isMultiSelect,
  setSearchBar,
  searchBar,
  setOpenSorter,
  setShowSettings,
  setRefresh,
}) => {
  return (
    <div className="flex flex-col h-screen w-screen">
      <header className="bg-gray-100 h-16 flex items-center justify-between p-5 shadow-sm">
        <Link href="/">
          <h1 className="font-header text-steelgrey text-3xl">Notes App</h1>
        </Link>
      </header>

      <div className="flex-grow overflow-y-auto overflow-x-hidden justify-center">
        <aside className="bg-gray-200 w-24 flex flex-col items-center pt-3 fixed top-16 left-0 h-full shadow-md">
          <Link
            href="/createnote"
            className="block p-3 scale-150 text-center my-7"
          >
            <FontAwesomeIcon icon={faPlus} />
            <br />
            <span className="font-body text-xs text-darkgrey">New</span>
          </Link>

          <div
            className="block p-3 scale-150 text-center my-7 cursor-pointer"
            onClick={() => {
              setIsMultiSelect(!isMultiSelect);
            }}
          >
            <FontAwesomeIcon icon={faCircleCheck} />
            <br />
            <span className="font-body text-xs text-darkgrey">
              {isMultiSelect ? "Deselect" : "Select"}
            </span>
          </div>

          <div
            className="block p-3 scale-150 text-center my-7 cursor-pointer"
            onClick={() => {
              setSearchBar(!searchBar);
            }}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <br />
            <span className="font-body text-xs text-darkgrey">Search</span>
          </div>

          <Link
            href="/trash"
            className="block p-3 scale-150 text-center my-7"
          >
            <FontAwesomeIcon icon={faTrashCan} />
            <br />
            <span className="font-body text-xs text-darkgrey">Trash</span>
          </Link>
        </aside>

        <div className="bg-gray-100 fixed top-20 left-24 h-14 w-[calc(100%-6rem)] flex items-end flex-row-reverse px-5 shadow-md">
          <div
            className="p-5 scale-125 text-darksteelgrey cursor-pointer hover:animate-ping"
            onClick={() => {
              setOpenSorter(true);
            }}
          >
            <FontAwesomeIcon icon={faArrowUpShortWide} />
          </div>

          <div
            className="p-5 scale-125 text-darksteelgrey cursor-pointer hover:animate-spin"
            onClick={() => {
              setShowSettings(true);
            }}
          >
            <FontAwesomeIcon icon={faRotate} />
          </div>

          <div
            className="p-5 scale-125 text-darksteelgrey cursor-pointer hover:animate-bounce"
            onClick={() => {
              setRefresh(true);
            }}
          >
            <FontAwesomeIcon icon={faUserGear} />
          </div>
        </div>

        <main className="mt-14 ml-20 p-4 w-full text-lg bg-vague">
          <ToastContainer />
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
