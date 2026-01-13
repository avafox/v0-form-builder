import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function canNextAuthFunction(): boolean {
  // NextAuth can work if we have the secret OR can generate a fallback
  const hasSecret = !!process.env.NEXTAUTH_SECRET
  const hasMicrosoftCreds =
    !!process.env.MICROSOFT_CLIENT_ID && !!process.env.MICROSOFT_CLIENT_SECRET && !!process.env.MICROSOFT_TENANT_ID

  return hasSecret || hasMicrosoftCreds
}

export async function GET() {
  const config = {
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    usingFallbackSecret: !process.env.NEXTAUTH_SECRET && canNextAuthFunction(),
    canAuthenticate: canNextAuthFunction(),
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasMicrosoftClientId: !!process.env.MICROSOFT_CLIENT_ID,
    hasMicrosoftClientSecret: !!process.env.MICROSOFT_CLIENT_SECRET,
    hasMicrosoftTenantId: !!process.env.MICROSOFT_TENANT_ID,
    nextAuthUrl: process.env.NEXTAUTH_URL || "https://main.d2baofxalff7ki.amplifyapp.com",
    nodeEnv: process.env.NODE_ENV,
  }

  return NextResponse.json(config)
}
