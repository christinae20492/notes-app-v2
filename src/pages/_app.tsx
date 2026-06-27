import { AuthProvider } from "@/app/contexts/auth";
import type { AppProps } from "next/app";
import React from "react";
import { ToastContainer } from "react-toastify";

function NotesApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ToastContainer />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default NotesApp;
