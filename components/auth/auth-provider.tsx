"use client"

import type React from "react"
import { SessionProvider, useSession, signOut as nextAuthSignOut } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user || null,
    loading: status === "loading",
    signOut: async () => {
      await nextAuthSignOut({ callbackUrl: "/auth/signin" })
    },
  }
}
