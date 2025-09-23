import { type NextRequest, NextResponse } from "next/server"
import { MicrosoftGraphService } from "@/lib/microsoft-graph"

export async function POST(request: NextRequest) {
  try {
    const { fromEmail, to, cc, subject, htmlContent } = await request.json()

    // Initialize Microsoft Graph service with environment variables
    const graphService = new MicrosoftGraphService({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      tenantId: process.env.MICROSOFT_TENANT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    })

    // Send the email
    await graphService.sendEmail(fromEmail, {
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
