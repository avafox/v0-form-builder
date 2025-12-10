import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"

interface SESConfig {
  region: string
  accessKeyId: string
  secretAccessKey: string
  fromEmail: string
  fromName?: string
}

interface EmailData {
  to: string[]
  cc?: string[]
  subject: string
  htmlContent: string
}

export class AWSSESEmailService {
  private config: SESConfig

  constructor(config: SESConfig) {
    this.config = config
  }

  async sendEmail(fromEmail: string, emailData: EmailData): Promise<boolean> {
    try {
      console.log("[v0] Preparing to send email via AWS SES")
      console.log("[v0] Region:", this.config.region)
      console.log("[v0] From:", this.config.fromEmail)
      console.log("[v0] To:", emailData.to)
      console.log("[v0] Access Key ID (first 10 chars):", this.config.accessKeyId.substring(0, 10))

      const sesClient = new SESClient({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
      })

      const sourceEmail = this.config.fromName
        ? `${this.config.fromName} <${this.config.fromEmail}>`
        : this.config.fromEmail

      const command = new SendEmailCommand({
        Source: sourceEmail,
        Destination: {
          ToAddresses: emailData.to,
          CcAddresses: emailData.cc || [],
        },
        Message: {
          Subject: {
            Data: emailData.subject,
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: emailData.htmlContent,
              Charset: "UTF-8",
            },
            Text: {
              Data: emailData.htmlContent.replace(/<[^>]*>/g, ""),
              Charset: "UTF-8",
            },
          },
        },
      })

      console.log("[v0] Sending email command to AWS SES...")
      const response = await sesClient.send(command)
      console.log("[v0] Email sent successfully via AWS SES:", response.MessageId)
      return true
    } catch (error) {
      console.error("[v0] Failed to send email via AWS SES:", error)
      if (error instanceof Error) {
        console.error("[v0] Error name:", error.name)
        console.error("[v0] Error message:", error.message)
        console.error("[v0] Error stack:", error.stack)
      }
      throw error
    }
  }
}
