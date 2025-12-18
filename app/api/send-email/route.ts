import { type NextRequest, NextResponse } from "next/server"
import { AWSSESEmailService } from "@/lib/aws-ses-email"
import { ResendEmailService } from "@/lib/resend-email"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Received email send request")

    const { fromEmail, to, cc, bcc, subject, htmlContent, provider } = await request.json()

    console.log("[v0] Email details:", { fromEmail, to: to?.length, subject, provider: provider || "ses" })
    console.log("[v0] HTML content received - Length:", htmlContent?.length || 0)
    console.log("[v0] HTML content preview (first 500 chars):", htmlContent?.substring(0, 500))

    const emailProvider = provider || process.env.EMAIL_PROVIDER || "ses"

    if (emailProvider === "resend") {
      // Use Resend
      console.log("[v0] Using Resend email service")
      console.log("[v0] Environment check - RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)
      console.log("[v0] Environment check - RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL)

      if (!process.env.RESEND_API_KEY) {
        throw new Error("Resend API key is not configured. Please check RESEND_API_KEY environment variable.")
      }

      if (!process.env.RESEND_FROM_EMAIL) {
        throw new Error("RESEND_FROM_EMAIL environment variable is not configured.")
      }

      const resendService = new ResendEmailService({
        apiKey: process.env.RESEND_API_KEY,
        fromEmail: process.env.RESEND_FROM_EMAIL,
        fromName: process.env.RESEND_FROM_NAME || "GPE Communications Team",
      })

      console.log("[v0] Resend service created, sending email...")
      await resendService.sendEmail({
        to,
        cc,
        bcc,
        subject,
        htmlContent,
      })

      console.log("[v0] Email sent successfully via Resend")
      return NextResponse.json({ success: true, provider: "resend" })
    } else {
      // Use AWS SES
      console.log("[v0] Using AWS SES email service")
      console.log("[v0] Environment check - SES_REGION:", process.env.SES_REGION)
      console.log("[v0] Environment check - SES_ACCESS_KEY_ID exists:", !!process.env.SES_ACCESS_KEY_ID)
      console.log("[v0] Environment check - SES_SECRET_ACCESS_KEY exists:", !!process.env.SES_SECRET_ACCESS_KEY)
      console.log("[v0] Environment check - SES_FROM_EMAIL:", process.env.SES_FROM_EMAIL)

      if (process.env.SES_ACCESS_KEY_ID) {
        console.log("[v0] SES_ACCESS_KEY_ID (first 8 chars):", process.env.SES_ACCESS_KEY_ID.substring(0, 8))
      }

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

      console.log("[v0] Email sent successfully via SES")
      return NextResponse.json({ success: true, provider: "ses" })
    }
  } catch (error) {
    console.error("[v0] Email sending failed:", error)
    if (error instanceof Error) {
      console.error("[v0] Error name:", error.name)
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
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
