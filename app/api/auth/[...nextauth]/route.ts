import NextAuth from "next-auth"
import { authOptions } from "./auth-options"

const handler = NextAuth(authOptions)

export async function GET(req: Request) {
  try {
    return await handler(req)
  } catch (error) {
    console.error("[v0] NextAuth GET error:", error)
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

export async function POST(req: Request) {
  try {
    return await handler(req)
  } catch (error) {
    console.error("[v0] NextAuth POST error:", error)
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
