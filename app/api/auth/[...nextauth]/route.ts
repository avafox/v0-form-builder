import NextAuth from "next-auth"
import { authOptions } from "./auth-options"

let handler
try {
  console.log("[v0] Initializing NextAuth with runtime env check")
  console.log("[v0] NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET)
  console.log("[v0] NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
  console.log("[v0] MICROSOFT_CLIENT_ID exists:", !!process.env.MICROSOFT_CLIENT_ID)

  handler = NextAuth(authOptions)
  console.log("[v0] NextAuth initialized successfully")
} catch (error) {
  console.error("[v0] NextAuth initialization error:", error)
  throw error
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export { handler as GET, handler as POST }
