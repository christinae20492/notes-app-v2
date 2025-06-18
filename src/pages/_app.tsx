import { SessionProvider } from "next-auth/react"; 
import type { AppProps } from "next/app"; 

function NotesApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default NotesApp;