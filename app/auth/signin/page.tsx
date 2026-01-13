"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  const handleSignIn = () => {
    signIn("azure-ad", { callbackUrl: "/communications" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-purple-500 to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">GPE Communications Hub</CardTitle>
          <CardDescription>Sign in with your Sky UK account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSignIn} className="w-full" size="lg">
            Sign in with Microsoft
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Authorized for @sky.uk and @3dflyingmonsters.co.uk domains
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
