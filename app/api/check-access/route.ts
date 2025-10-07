import { type NextRequest, NextResponse } from "next/server"
import { getUserGroups } from "@/lib/microsoft-graph"
import { checkUserAccess } from "@/lib/access-control"
import { kv } from "@vercel/kv"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, accessToken } = body

    if (!email) {
      return NextResponse.json({ hasAccess: false, error: "Email required" }, { status: 400 })
    }

    const cacheKey = `user:groups:${email}`

    // Check cache first
    let userGroups = await kv.get<string[]>(cacheKey)
    let fromCache = true

    if (!userGroups) {
      // Fetch groups using delegated token if provided, otherwise use app credentials
      userGroups = await getUserGroups(email, accessToken)

      // Cache for 15 minutes
      await kv.set(cacheKey, userGroups, { ex: 900 })
      fromCache = false
    }

    const hasAccess = checkUserAccess(userGroups)

    return NextResponse.json({
      hasAccess,
      groups: userGroups,
      cached: fromCache,
    })
  } catch (error) {
    console.error("[v0] Access check error:", error)
    return NextResponse.json({ hasAccess: false, error: "Failed to check access" }, { status: 500 })
  }
}
