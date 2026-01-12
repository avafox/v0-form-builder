"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"

export default function SignInPage() {
  const [configStatus, setConfigStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/test-config")
      .then((res) => res.json())
      .then((data) => {
        setConfigStatus(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

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
          {loading ? (
            <div className="text-center py-4">Loading configuration...</div>
          ) : (
            <>
              <Button onClick={handleSignIn} className="w-full" size="lg" disabled={!configStatus?.hasNextAuthSecret}>
                Sign in with Microsoft
              </Button>

              {configStatus && !configStatus.hasNextAuthSecret && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  <strong>Configuration Error:</strong> NextAuth is not properly configured. Check Amplify environment
                  variables.
                </div>
              )}

              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground">Show configuration status</summary>
                <pre className="mt-2 p-2 bg-muted rounded overflow-auto">{JSON.stringify(configStatus, null, 2)}</pre>
              </details>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
