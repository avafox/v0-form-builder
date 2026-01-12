import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options"

export async function getAuthSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getAuthSession()

  if (!session?.user?.email) {
    return { authenticated: false, reason: "no_session" }
  }

  if (!session.user.email.toLowerCase().endsWith("@sky.uk")) {
    return { authenticated: false, reason: "invalid_domain" }
  }

  return { authenticated: true, session }
}
