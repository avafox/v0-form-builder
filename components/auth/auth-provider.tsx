"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User | null>({
    id: "1",
    email: "demo@example.com",
    name: "Demo User",
  })
  const [loading] = useState(false)

  const signOut = async () => {
    // Mock sign out
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
