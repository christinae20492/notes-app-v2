"use client";

import { AuthProvider } from "@/app/contexts/auth";
import React from "react";

export default function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
