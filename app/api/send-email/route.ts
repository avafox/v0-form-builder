import { type NextRequest, NextResponse } from "next/server"
import { AWSSESEmailService } from "@/lib/aws-ses-email"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Received email send request")

    const { fromEmail, to, cc, subject, htmlContent } = await request.json()

    console.log("[v0] Email details:", { fromEmail, to: to?.length, subject })
    console.log("[v0] Environment check - SES_REGION:", process.env.SES_REGION)
    console.log("[v0] Environment check - SES_ACCESS_KEY_ID exists:", !!process.env.SES_ACCESS_KEY_ID)
    console.log("[v0] Environment check - SES_SECRET_ACCESS_KEY exists:", !!process.env.SES_SECRET_ACCESS_KEY)
    console.log("[v0] Environment check - SES_FROM_EMAIL:", process.env.SES_FROM_EMAIL)

    if (!process.env.SES_ACCESS_KEY_ID || !process.env.SES_SECRET_ACCESS_KEY) {
      throw new Error(
        "AWS SES credentials are not configured. Please check SES_ACCESS_KEY_ID and SES_SECRET_ACCESS_KEY environment variables.",
      )
    }

    if (!process.env.SES_FROM_EMAIL) {
      throw new Error("SES_FROM_EMAIL environment variable is not configured.")
    }

    const sesService = new AWSSESEmailService({
      region: process.env.SES_REGION || "eu-west-2",
      accessKeyId: process.env.SES_ACCESS_KEY_ID,
      secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
      fromEmail: process.env.SES_FROM_EMAIL,
      fromName: process.env.SES_FROM_NAME,
    })

    console.log("[v0] SES service created, sending email...")
    await sesService.sendEmail(fromEmail, {
      to,
      cc,
      subject,
      htmlContent,
    })

    console.log("[v0] Email sent successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Email sending failed:", error)
    return NextResponse.json(
      {
        error: "Failed to send email",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
