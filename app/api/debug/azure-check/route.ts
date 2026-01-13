import { NextResponse } from "next/server"
import { runtimeConfig } from "@/lib/runtime-config"

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

  const runtimeConfigVars = {
    NEXTAUTH_SECRET: !!runtimeConfig.NEXTAUTH_SECRET,
    NEXTAUTH_SECRET_LENGTH: runtimeConfig.NEXTAUTH_SECRET?.length || 0,
    NEXTAUTH_URL: runtimeConfig.NEXTAUTH_URL || "NOT SET",
    MICROSOFT_CLIENT_ID: !!runtimeConfig.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: !!runtimeConfig.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_TENANT_ID: !!runtimeConfig.MICROSOFT_TENANT_ID,
  }

  const diagnosis = {
    envVars,
    runtimeConfigVars,
    allEnvKeys: Object.keys(process.env).filter(
      (key) => key.includes("NEXTAUTH") || key.includes("MICROSOFT") || key.includes("AZURE"),
    ),
    canAuthenticateViaEnv: !!(
      process.env.NEXTAUTH_SECRET &&
      process.env.MICROSOFT_CLIENT_ID &&
      process.env.MICROSOFT_CLIENT_SECRET &&
      process.env.MICROSOFT_TENANT_ID
    ),
    canAuthenticateViaRuntimeConfig: !!(
      runtimeConfig.NEXTAUTH_SECRET &&
      runtimeConfig.MICROSOFT_CLIENT_ID &&
      runtimeConfig.MICROSOFT_CLIENT_SECRET &&
      runtimeConfig.MICROSOFT_TENANT_ID
    ),
    recommendations: [] as string[],
  }

  if (!runtimeConfig.NEXTAUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
    diagnosis.recommendations.push("Add NEXTAUTH_SECRET to Amplify environment variables")
  }
  if (!runtimeConfig.NEXTAUTH_URL && !process.env.NEXTAUTH_URL) {
    diagnosis.recommendations.push("Add NEXTAUTH_URL to Amplify environment variables")
  }
  if (!runtimeConfig.MICROSOFT_CLIENT_ID && !process.env.MICROSOFT_CLIENT_ID) {
    diagnosis.recommendations.push("Add MICROSOFT_CLIENT_ID to Amplify environment variables")
  }
  if (!runtimeConfig.MICROSOFT_CLIENT_SECRET && !process.env.MICROSOFT_CLIENT_SECRET) {
    diagnosis.recommendations.push("Add MICROSOFT_CLIENT_SECRET to Amplify environment variables")
  }
  if (!runtimeConfig.MICROSOFT_TENANT_ID && !process.env.MICROSOFT_TENANT_ID) {
    diagnosis.recommendations.push("Add MICROSOFT_TENANT_ID to Amplify environment variables")
  }

  return NextResponse.json(diagnosis, { status: 200 })
}
