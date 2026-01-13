import { NextResponse } from "next/server"

export async function GET() {
  const envVars = {
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_SECRET_LENGTH: process.env.NEXTAUTH_SECRET?.length || 0,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
    MICROSOFT_CLIENT_ID: !!process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: !!process.env.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_TENANT_ID: !!process.env.MICROSOFT_TENANT_ID,
    NODE_ENV: process.env.NODE_ENV,
  }

  const diagnosis = {
    envVars,
    allEnvKeys: Object.keys(process.env).filter(
      (key) => key.includes("NEXTAUTH") || key.includes("MICROSOFT") || key.includes("AZURE"),
    ),
    canAuthenticate: !!(
      process.env.NEXTAUTH_SECRET &&
      process.env.MICROSOFT_CLIENT_ID &&
      process.env.MICROSOFT_CLIENT_SECRET &&
      process.env.MICROSOFT_TENANT_ID
    ),
    recommendations: [] as string[],
  }

  if (!process.env.NEXTAUTH_SECRET) {
    diagnosis.recommendations.push("Add NEXTAUTH_SECRET to Amplify environment variables")
  }
  if (!process.env.NEXTAUTH_URL) {
    diagnosis.recommendations.push("Add NEXTAUTH_URL to Amplify environment variables")
  }
  if (!process.env.MICROSOFT_CLIENT_ID) {
    diagnosis.recommendations.push("Add MICROSOFT_CLIENT_ID to Amplify environment variables")
  }
  if (!process.env.MICROSOFT_CLIENT_SECRET) {
    diagnosis.recommendations.push("Add MICROSOFT_CLIENT_SECRET to Amplify environment variables")
  }
  if (!process.env.MICROSOFT_TENANT_ID) {
    diagnosis.recommendations.push("Add MICROSOFT_TENANT_ID to Amplify environment variables")
  }

  return NextResponse.json(diagnosis, { status: 200 })
}
