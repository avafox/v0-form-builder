import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const envCheck = {
    timestamp: new Date().toISOString(),
    nextauth: {
      hasSecret: !!process.env.NEXTAUTH_SECRET,
      secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      hasUrl: !!process.env.NEXTAUTH_URL,
      url: process.env.NEXTAUTH_URL,
    },
    microsoft: {
      hasClientId: !!process.env.MICROSOFT_CLIENT_ID,
      clientId: process.env.MICROSOFT_CLIENT_ID?.substring(0, 8) + "...",
      hasClientSecret: !!process.env.MICROSOFT_CLIENT_SECRET,
      hasTenantId: !!process.env.MICROSOFT_TENANT_ID,
    },
    ses: {
      hasAccessKey: !!process.env.SES_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.SES_SECRET_ACCESS_KEY,
      region: process.env.SES_REGION,
      fromEmail: process.env.SES_FROM_EMAIL,
    },
  }

  return NextResponse.json(envCheck, { status: 200 })
}
