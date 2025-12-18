"use client"

import { useSearchParams } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function AccessDeniedPage() {
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason") || "You do not have permission to access this application."

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-purple-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">Access Denied</h1>

        <p className="text-gray-600 text-center mb-6">{reason}</p>

        <div className="space-y-3">
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full bg-gradient-to-r from-orange-500 via-purple-500 to-blue-600 text-white hover:opacity-90"
          >
            Sign Out
          </Button>

          <p className="text-sm text-gray-500 text-center">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
