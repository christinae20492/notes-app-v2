"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faHouse,
  faMagnifyingGlass,
  faPlus,
  faRotate,
  faTrashCan,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import "@/app/tailwind.css";
import { useAuth } from "@/app/contexts/auth";
import { useRouter } from "next/router";

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
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

    return (
      <div className="flex flex-col h-screen w-screen bg-vague"> 
        <header className="bg-white md:h-16 h-8 flex items-center justify-between p-5 shadow-sm fixed top-0 left-0 w-full z-20">
          <Link href="/">
            <h1 className="font-header text-steelgrey md:text-3xl text-xl">VaultNotes</h1>
          </Link>
        </header>

        <div className="flex flex-grow relative mt-8 md:mt-16">
          <aside
            className="bg-white md:w-24 w-0 flex-col items-center pt-3 fixed top-8 md:top-16 left-0 h-[calc(100vh-theme(height.8))] md:h-[calc(100vh-theme(height.16))] shadow-md md:flex hidden z-20"
          >
            <Link href="/createnote" className="menu-icon">
              <FontAwesomeIcon icon={faPlus} />
              <br />
              <span className="font-body text-xs text-darkgrey">New</span>
            </Link>

            <div
              className="menu-icon cursor-pointer"
              onClick={() => {
                setIsMultiSelect?.(!isMultiSelect);
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
                setSearchBar?.(!searchBar);
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

          <div className="bg-white fixed top-8 md:top-16 left-0 md:left-24 h-14 w-full md:w-[calc(100%-6rem)] flex items-end flex-row-reverse px-5 shadow-md z-10">
             {/*
            <div
              className="p-5 scale-125 text-darksteelgrey cursor-pointer hover:animate-ping"
              onClick={() => {
                setOpenSorter(true);
              }}
            >
              <FontAwesomeIcon icon={faArrowUpShortWide} />
            </div>
            </div>
            */} 

            <Link href={"/acc"}>
              <div className="p-5 scale-125 text-darksteelgrey cursor-pointer hover:animate-spin">
                <FontAwesomeIcon icon={faUserGear} />
              </div>
            </Link>

            <div
              className="p-5 scale-125 text-darksteelgrey cursor-pointer hover:animate-spin"
              onClick={() => {
                setRefresh?.(true);
              }}
            >
              <FontAwesomeIcon icon={faRotate} />
            </div>
          </div>

          <main className="mt-14 md:ml-16 md:p-4 w-full text-lg bg-vague mr-1 -ml-3">
            {children}
          </main>

          <nav className="bg-gray-200 w-full flex flex-row justify-evenly fixed -bottom-4 left-0 h-20 shadow-md md:hidden visible">
            <Link href="/createnote" className="mobile-icon cursor-pointer">
              <FontAwesomeIcon icon={faPlus} />
              <br />
              <span className="font-body text-xs text-darkgrey">New</span>
            </Link>

            <div
              className="mobile-icon cursor-pointer"
              onClick={() => {
                setIsMultiSelect?.(!isMultiSelect);
              }}
            >
              <FontAwesomeIcon icon={faCircleCheck} />
              <br />
              <span className="font-body text-xs text-darkgrey">
                {isMultiSelect ? "Deselect" : "Select"}
              </span>
            </div>

            <Link href="/" className="mobile-icon cursor-pointer">
              <FontAwesomeIcon icon={faHouse} />
              <br />
              <span className="font-body text-xs text-darkgrey">Home</span>
            </Link>

            <div
              className="mobile-icon cursor-pointer"
              onClick={() => {
                setSearchBar?.(!searchBar);
              }}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <br />
              <span className="font-body text-xs text-darkgrey">
                {searchBar ? "Close" : "Search"}
              </span>
            </div>

            <Link href="/trash" className="mobile-icon cursor-pointer">
              <FontAwesomeIcon icon={faTrashCan} />
              <br />
              <span className="font-body text-xs text-darkgrey">Trash</span>
            </Link>
          </nav>
        </div>
      </div>
    );
};


export default Layout;
