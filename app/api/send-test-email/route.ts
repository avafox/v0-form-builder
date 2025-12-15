import { type NextRequest, NextResponse } from "next/server"
import { AWSSESEmailService } from "@/lib/aws-ses-email"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const toEmail = searchParams.get("to") || "ava.foxwell@sky.uk"

    console.log("[v0] Sending simple test email to:", toEmail)

    const sesService = new AWSSESEmailService({
      region: process.env.SES_REGION || "eu-west-2",
      accessKeyId: process.env.SES_ACCESS_KEY_ID!,
      secretAccessKey: process.env.SES_SECRET_ACCESS_KEY!,
      fromEmail: process.env.SES_FROM_EMAIL!,
      fromName: process.env.SES_FROM_NAME,
    })

    const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Email</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
    <h1 style="color: #333;">Test Email from SES</h1>
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      This is a simple test email sent directly from AWS SES.
    </p>
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      If you receive this email, it means AWS SES is working correctly and can deliver HTML content.
    </p>
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      Sent at: ${new Date().toISOString()}
    </p>
  </div>
</body>
</html>
    `.trim()

    await sesService.sendEmail(process.env.SES_FROM_EMAIL!, {
      to: [toEmail],
      subject: "Test Email - AWS SES Integration",
      htmlContent: testHtml,
    })

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${toEmail}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Test email failed:", error)
    return NextResponse.json(
      {
        error: "Failed to send test email",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
