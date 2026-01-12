import { redirect } from "next/navigation"
import { CommunicationsTemplate } from "@/components/communications-template"
import { requireAuth } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function CommunicationsPage() {
  const authResult = await requireAuth()

  if (!authResult.authenticated) {
    if (authResult.reason === "no_session") {
      redirect("/auth/signin?callbackUrl=/communications")
    } else if (authResult.reason === "invalid_domain") {
      redirect("/auth/error?error=AccessDenied")
    }
  }

  const session = authResult.session!

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-purple-500 to-blue-600">
      <header className="relative overflow-hidden bg-gradient-to-r from-orange-400 via-purple-500 to-blue-600 px-6 py-12">
        <div className="relative z-10 text-center">
          <h1 className="text-balance text-4xl font-bold text-white md:text-6xl">GPE Comms</h1>
          <p className="text-balance mt-4 text-lg text-white/90 md:text-xl">
            Create Professional Email-Ready Communications
          </p>
          <p className="mt-2 text-sm text-white/80">Signed in as: {session.user.email}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-white/95 p-8 shadow-xl">
          <CommunicationsTemplate />
        </div>
      </main>
    </div>
  )
}
