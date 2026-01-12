import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const config = {
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasMicrosoftClientId: !!process.env.MICROSOFT_CLIENT_ID,
    hasMicrosoftClientSecret: !!process.env.MICROSOFT_CLIENT_SECRET,
    hasMicrosoftTenantId: !!process.env.MICROSOFT_TENANT_ID,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
  }

  return NextResponse.json(config)
}
