import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const envCheck = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    hasNEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    hasMICROSOFT_CLIENT_ID: !!process.env.MICROSOFT_CLIENT_ID,
    hasMICROSOFT_CLIENT_SECRET: !!process.env.MICROSOFT_CLIENT_SECRET,
    hasMICROSOFT_TENANT_ID: !!process.env.MICROSOFT_TENANT_ID,
    nodeEnv: process.env.NODE_ENV,
  }

  console.log("[v0] Environment check:", envCheck)

  return NextResponse.json(envCheck)
}
