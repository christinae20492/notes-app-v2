import { getServerSideProps } from "@/app/middleware";
import { Session } from "next-auth";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import type { AppProps } from "next/app";
import router from "next/router";
import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

interface CustomAppProps extends AppProps {
  pageProps: AppProps['pageProps'] & {
    session: Session | null;
    status?: string;
  };
}


function NotesApp({ Component, pageProps }: CustomAppProps) {
  const { session, status, ...restPageProps } = pageProps;

  return (
    <SessionProvider session={session}>
      <ToastContainer />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default NotesApp;
