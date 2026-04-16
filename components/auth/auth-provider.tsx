"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signupRequest, loginRequest, getMeRequest, type AuthUser } from "@/lib/api-auth";
import { saveSession, getToken, clearSession } from "@/lib/session";

type SignupInput = {
  name: string;
  email: string;
  password: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getToken();

        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const me = await getMeRequest(token);
        setUser(me);
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      login: async (email: string, password: string) => {
        const response = await loginRequest({ email, password });
        saveSession(response.token, response.user);
        setUser(response.user);
      },
      signup: async (data: SignupInput) => {
        await signupRequest(data);
      },
      logout: () => {
        clearSession();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}