"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../../../utils/supabase";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthSession {
  user: AuthUser;
}

interface AuthContextType {
  session: AuthSession | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "loading",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  function buildSession(supabaseUser: any): AuthSession {
    return {
      user: {
        id: supabaseUser.id,
        email: supabaseUser.email ?? "",
        username: supabaseUser.user_metadata?.username ?? "",
      },
    };
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.user) {
        setSession(buildSession(s.user));
        setStatus("authenticated");
      } else {
        setSession(null);
        setStatus("unauthenticated");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user) {
        setSession(buildSession(s.user));
        setStatus("authenticated");
      } else {
        setSession(null);
        setStatus("unauthenticated");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session, status }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
