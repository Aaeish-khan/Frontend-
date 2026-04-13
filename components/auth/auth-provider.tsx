"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { getSessionUser, loginUser, logoutUser, signupUser, type LocalUser } from "@/lib/local-auth"

type SignupInput = {
  name: string
  email: string
  password: string
}

type AuthContextType = {
  user: LocalUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupInput) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(getSessionUser())
    setLoading(false)
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      login: async (email: string, password: string) => {
        const loggedIn = loginUser(email, password)
        setUser(loggedIn)
      },
      signup: async (data: SignupInput) => {
        const created = signupUser(data)
        setUser(created)
      },
      logout: () => {
        logoutUser()
        setUser(null)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
