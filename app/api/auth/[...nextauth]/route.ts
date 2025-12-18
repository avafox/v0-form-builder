import NextAuth from "next-auth"
import { authOptions } from "./auth-options"

const handler = async (req: Request, context: any) => {
  try {
    console.log("[v0] NextAuth API route called")
    console.log("[v0] Environment variables check:")
    console.log("[v0] - MICROSOFT_CLIENT_ID exists:", !!process.env.MICROSOFT_CLIENT_ID)
    console.log("[v0] - MICROSOFT_CLIENT_SECRET exists:", !!process.env.MICROSOFT_CLIENT_SECRET)
    console.log("[v0] - MICROSOFT_TENANT_ID exists:", !!process.env.MICROSOFT_TENANT_ID)
    console.log("[v0] - NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET)
    console.log("[v0] - NEXTAUTH_URL:", process.env.NEXTAUTH_URL)

    const nextAuthHandler = NextAuth(authOptions)
    return await nextAuthHandler(req, context)
  } catch (error) {
    console.error("[v0] NextAuth error:", error)
    return new Response(
      JSON.stringify({
        error: "Authentication error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

export { handler as GET, handler as POST }
