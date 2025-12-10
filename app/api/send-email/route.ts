import { type NextRequest, NextResponse } from "next/server"
import { AWSSESEmailService } from "@/lib/aws-ses-email"

export async function POST(request: NextRequest) {
  try {
    const { fromEmail, to, cc, subject, htmlContent } = await request.json()

    const sesService = new AWSSESEmailService({
      region: process.env.SES_REGION || "eu-west-2",
      accessKeyId: process.env.SES_ACCESS_KEY_ID!,
      secretAccessKey: process.env.SES_SECRET_ACCESS_KEY!,
      fromEmail: process.env.SES_FROM_EMAIL!,
      fromName: process.env.SES_FROM_NAME,
    })

    await sesService.sendEmail(fromEmail, {
      to,
      cc,
      subject,
      htmlContent,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email sending failed:", error)
    return NextResponse.json(
      { error: "Failed to send email", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
