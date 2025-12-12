import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] SES Diagnostic Tool Running")

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environmentVariables: {
        SES_REGION: process.env.SES_REGION || "MISSING",
        SES_ACCESS_KEY_ID: process.env.SES_ACCESS_KEY_ID
          ? `${process.env.SES_ACCESS_KEY_ID.substring(0, 8)}...`
          : "MISSING",
        SES_SECRET_ACCESS_KEY: process.env.SES_SECRET_ACCESS_KEY ? "***PRESENT***" : "MISSING",
        SES_FROM_EMAIL: process.env.SES_FROM_EMAIL || "MISSING",
        SES_FROM_NAME: process.env.SES_FROM_NAME || "MISSING",
      },
      checks: [] as string[],
      errors: [] as string[],
    }

    // Check 1: Environment variables present
    if (!process.env.SES_ACCESS_KEY_ID) {
      diagnostics.errors.push("SES_ACCESS_KEY_ID is missing")
    } else {
      diagnostics.checks.push("SES_ACCESS_KEY_ID is present")
    }

    if (!process.env.SES_SECRET_ACCESS_KEY) {
      diagnostics.errors.push("SES_SECRET_ACCESS_KEY is missing")
    } else {
      diagnostics.checks.push("SES_SECRET_ACCESS_KEY is present")
    }

    if (!process.env.SES_FROM_EMAIL) {
      diagnostics.errors.push("SES_FROM_EMAIL is missing")
    } else {
      diagnostics.checks.push(`SES_FROM_EMAIL is set to: ${process.env.SES_FROM_EMAIL}`)
    }

    // Check 2: Test AWS SES connection
    if (process.env.SES_ACCESS_KEY_ID && process.env.SES_SECRET_ACCESS_KEY) {
      try {
        const region = process.env.SES_REGION || "eu-west-2"
        const endpoint = `https://email.${region}.amazonaws.com/`

        diagnostics.checks.push(`Testing connection to: ${endpoint}`)

        // Try a simple AWS request to verify credentials
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-amz-json-1.0",
            "X-Amz-Target": "SimpleEmailService.GetAccount",
          },
        })

        diagnostics.checks.push(`AWS SES endpoint responded with status: ${response.status}`)

        if (response.status === 403) {
          diagnostics.errors.push("AWS returned 403 Forbidden - check IAM permissions for ses:SendEmail")
        } else if (response.status === 400) {
          diagnostics.checks.push("Endpoint is reachable (400 = missing auth, which is expected)")
        }

        const responseText = await response.text()
        diagnostics.checks.push(`Response: ${responseText.substring(0, 200)}`)
      } catch (error) {
        diagnostics.errors.push(`Connection test failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    return NextResponse.json(diagnostics, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Diagnostic failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
