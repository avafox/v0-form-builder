interface ResendConfig {
  apiKey: string
  fromEmail: string
  fromName?: string
}

interface EmailData {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  htmlContent: string
}

export class ResendEmailService {
  private config: ResendConfig

  constructor(config: ResendConfig) {
    this.config = config
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      console.log("[v0] === Resend Email Send Starting ===")
      console.log("[v0] From:", this.config.fromEmail)
      console.log("[v0] To:", emailData.to)
      console.log("[v0] Subject:", emailData.subject)
      console.log("[v0] HTML content length:", emailData.htmlContent.length)

      const fromAddress = this.config.fromName
        ? `${this.config.fromName} <${this.config.fromEmail}>`
        : this.config.fromEmail

      const requestBody = {
        from: fromAddress,
        to: emailData.to,
        ...(emailData.cc && emailData.cc.length > 0 ? { cc: emailData.cc } : {}),
        ...(emailData.bcc && emailData.bcc.length > 0 ? { bcc: emailData.bcc } : {}),
        subject: emailData.subject,
        html: emailData.htmlContent,
      }

      console.log("[v0] Sending request to Resend API...")

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] Response received, status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] === Resend API ERROR ===")
        console.error("[v0] Status:", response.status)
        console.error("[v0] Response:", errorText)

        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(`Resend API Error: ${errorJson.message || errorText}`)
        } catch (parseError) {
          throw new Error(`Resend API Error (${response.status}): ${errorText}`)
        }
      }

      const result = await response.json()
      console.log("[v0] === Email Sent Successfully via Resend ===")
      console.log("[v0] Email ID:", result.id)
      return true
    } catch (error) {
      console.error("[v0] === Resend Email Send Failed ===")
      console.error("[v0] Error:", error)
      throw error
    }
  }
}
