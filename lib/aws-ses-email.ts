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
  private sesClient: SESClient
  private fromEmail: string
  private fromName?: string

  constructor(config: SESConfig) {
    this.sesClient = new SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
    this.fromEmail = config.fromEmail
    this.fromName = config.fromName
  }

  async sendEmail(fromEmail: string, emailData: EmailData): Promise<boolean> {
    try {
      // Use the configured from email or the one passed in
      const sourceEmail = this.fromName ? `${this.fromName} <${this.fromEmail}>` : this.fromEmail

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
              // Strip HTML tags for plain text version
              Data: emailData.htmlContent.replace(/<[^>]*>/g, ""),
              Charset: "UTF-8",
            },
          },
        },
      })

      const response = await this.sesClient.send(command)
      console.log("[v0] Email sent successfully via AWS SES:", response.MessageId)
      return true
    } catch (error) {
      console.error("[v0] Failed to send email via AWS SES:", error)
      throw error
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      // AWS SES doesn't have a direct "verify" command, but we can check if we can access the service
      // by attempting to get account sending statistics
      const { SESClient, GetAccountSendingEnabledCommand } = await import("@aws-sdk/client-ses")
      const command = new GetAccountSendingEnabledCommand({})
      await this.sesClient.send(command)
      console.log("[v0] AWS SES connection verified")
      return true
    } catch (error) {
      console.error("[v0] AWS SES connection failed:", error)
      return false
    }
  }
}
