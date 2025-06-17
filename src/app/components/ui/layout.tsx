"use client";

import React, { useEffect } from "react";
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
import "@/app/tailwind.css";
import { useSession, signIn } from "next-auth/react";

interface LayoutProps {
  children: React.ReactNode;
  setIsMultiSelect?: (value: boolean) => void;
  isMultiSelect?: boolean;
  setSearchBar?: (value: boolean) => void;
  searchBar?: boolean;
  setOpenSorter?: (visible: boolean) => void;
  setShowSettings?: (visible: boolean) => void;
  setRefresh?: (value: boolean) => void;
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
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn();
    }
  }, [status]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    return (
      <div className="flex flex-col h-screen w-screen">
        <header className="bg-gray-100 h-16 flex items-center justify-between p-5 shadow-sm">
          <Link href="/">
            <h1 className="font-header text-steelgrey text-3xl">Notes App</h1>
          </Link>
        </header>

        <div className="flex-grow overflow-y-auto overflow-x-hidden justify-center">
          <aside className="bg-gray-200 w-24 flex flex-col items-center pt-3 fixed top-16 left-0 h-full shadow-md">
            <Link href="/createnote" className="menu-icon">
              <FontAwesomeIcon icon={faPlus} />
              <br />
              <span className="font-body text-xs text-darkgrey">New</span>
            </Link>

            <div
              className="menu-icon cursor-pointer"
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
              className="menu-icon cursor-pointer"
              onClick={() => {
                setSearchBar(!searchBar);
              }}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <br />
              <span className="font-body text-xs text-darkgrey">
                {searchBar ? "Close" : "Search"}
              </span>
            </div>

            <Link href="/trash" className="menu-icon">
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

            <Link href={"/acc"}>
              <div className="p-5 scale-125 text-darksteelgrey cursor-pointer hover:animate-spin">
                <FontAwesomeIcon icon={faUserGear} />
              </div>
            </Link>

            <div
              className="p-5 scale-125 text-darksteelgrey cursor-pointer hover:animate-bounce"
              onClick={() => {
                setRefresh(true);
              }}
            >
              <FontAwesomeIcon icon={faRotate} />
            </div>
          </div>

          <main className="mt-14 ml-20 p-4 w-full text-lg bg-vague">
            <ToastContainer />
            {children}
          </main>
        </div>
      </div>
    );
  }
  return null;
};

export default Layout;
