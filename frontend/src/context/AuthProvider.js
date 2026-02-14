// context/AuthContext.js
"use client";
import { createContext, useContext, useMemo } from "react";
import { useAuthentication } from "@/hooks";
import { api } from "@/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { user, isLoading, logout } = useAuthentication();
  const baseUrl = process.env.NEXT_PUBLIC_URL;
  const metadata = useMemo(() => {
    return { name: "Code Grader", author: "The Devs", baseUrl: baseUrl };
  }, [baseUrl]);

  const contextValue = useMemo(
    () => ({
      api,
      user,
      isLoading,
      logout,
      ...metadata,
    }),
    [user, isLoading, logout, metadata],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useMetadata = () => useContext(AuthContext);
