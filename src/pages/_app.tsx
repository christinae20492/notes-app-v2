import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { ToastContainer, toast } from "react-toastify";

function NotesApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ToastContainer />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default NotesApp;
