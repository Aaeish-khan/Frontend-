"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signupRequest, loginRequest, getMeRequest, type AuthUser } from "@/lib/api-auth";
import { saveSession, getToken, getStoredUser, clearSession } from "@/lib/session";

const DEMO_USER: AuthUser = {
  id: "demo",
  name: "Demo User",
  email: "demo@intermate.app",
};

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
  demoLogin: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = (nextUser: AuthUser | null) => {
    const token = getToken();

    if (token && nextUser) {
      saveSession(token, nextUser);
    }

    if (token && !nextUser) {
      clearSession();
    }

    setUserState(nextUser);
  };

  const refreshUser = async () => {
    const token = getToken();

    if (!token) {
      clearSession();
      setUser(null);
      return;
    }

    if (token === "demo-token") {
      const stored = getStoredUser();
      setUser(stored);
      return;
    }

    const me = await getMeRequest(token);
    saveSession(token, me);
    setUser(me);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshUser();
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
      demoLogin: () => {
        saveSession("demo-token", DEMO_USER);
        setUser(DEMO_USER);
      },
      refreshUser,
      setUser,
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
