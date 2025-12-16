"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

export function UserMenu() {
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <div className="flex gap-2">
        <Link href="/auth/signin">
          <Button variant="outline" size="sm" className="bg-white/20 text-white border-white/30">
            Sign In
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-white">
        <User className="h-4 w-4" />
        <span className="text-sm">{user.email}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={signOut}
        className="bg-white/20 text-white border-white/30 hover:bg-white/30"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  )
}
