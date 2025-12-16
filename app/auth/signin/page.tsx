"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-purple-500 to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Image src="/sky-logo.png" alt="Sky Logo" width={120} height={60} className="h-16 w-auto mx-auto mb-4" />
          <CardTitle className="text-2xl">Welcome to GPE Communications Hub</CardTitle>
          <CardDescription>Sign in with your Sky account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => signIn("azure-ad", { callbackUrl: "/communications" })}
            className="w-full bg-gradient-to-r from-orange-500 via-purple-500 to-blue-600 text-white hover:opacity-90"
            size="lg"
          >
            Sign in with Microsoft
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
