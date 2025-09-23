// Microsoft Graph API integration for sending emails
interface GraphAuthConfig {
  clientId: string
  tenantId: string
  clientSecret: string
}

interface EmailData {
  to: string[]
  cc?: string[]
  subject: string
  htmlContent: string
}

export class MicrosoftGraphService {
  private config: GraphAuthConfig
  private accessToken: string | null = null

  constructor(config: GraphAuthConfig) {
    this.config = config
  }

  // Get access token using client credentials flow
  async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken

    const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    })

    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(`Authentication failed: ${data.error_description}`)
      }

      this.accessToken = data.access_token
      return this.accessToken
    } catch (error) {
      console.error("Failed to get access token:", error)
      throw error
    }
  }

  // Send email using Microsoft Graph API
  async sendEmail(fromEmail: string, emailData: EmailData): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken()

      const emailPayload = {
        message: {
          subject: emailData.subject,
          body: {
            contentType: "HTML",
            content: emailData.htmlContent,
          },
          toRecipients: emailData.to.map((email) => ({
            emailAddress: { address: email },
          })),
          ccRecipients:
            emailData.cc?.map((email) => ({
              emailAddress: { address: email },
            })) || [],
        },
      }

      const response = await fetch(`https://graph.microsoft.com/v1.0/users/${fromEmail}/sendMail`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Failed to send email: ${error.error?.message}`)
      }

      return true
    } catch (error) {
      console.error("Failed to send email:", error)
      throw error
    }
  }
}
