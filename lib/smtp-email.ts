import nodemailer from "nodemailer"

interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailData {
  to: string[]
  cc?: string[]
  subject: string
  htmlContent: string
}

export class SMTPEmailService {
  private transporter: nodemailer.Transporter

  constructor(config: SMTPConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    })
  }

  async sendEmail(fromEmail: string, emailData: EmailData): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: fromEmail,
        to: emailData.to.join(", "),
        cc: emailData.cc?.join(", "),
        subject: emailData.subject,
        html: emailData.htmlContent,
      })

      console.log("[v0] Email sent successfully:", info.messageId)
      return true
    } catch (error) {
      console.error("[v0] Failed to send email via SMTP:", error)
      throw error
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log("[v0] SMTP connection verified")
      return true
    } catch (error) {
      console.error("[v0] SMTP connection failed:", error)
      return false
    }
  }
}

// Factory function to create email service based on configuration
export function createEmailService() {
  const emailMethod = process.env.EMAIL_METHOD || "smtp"

  if (emailMethod === "smtp") {
    return new SMTPEmailService({
      host: process.env.SMTP_HOST || "smtp.office365.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASSWORD!,
      },
    })
  }

  // Fallback to Graph API if configured
  throw new Error("Email method not configured. Set EMAIL_METHOD environment variable.")
}
