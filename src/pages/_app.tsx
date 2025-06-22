import { getServerSideProps } from "@/app/middleware";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import type { AppProps } from "next/app";
import router from "next/router";
import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

function NotesApp({ Component, pageProps: { session, status, ...pageProps } }) {

  return (
    <SessionProvider session={session}>
      <ToastContainer />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default NotesApp;
