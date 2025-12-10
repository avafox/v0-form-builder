// This implementation works in Amplify's SSR environment without Node.js fs module

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

  private async sha256(message: string): Promise<ArrayBuffer> {
    const msgBuffer = new TextEncoder().encode(message)
    return await crypto.subtle.digest("SHA-256", msgBuffer)
  }

  private bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  private async hmac(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    const msgBuffer = new TextEncoder().encode(message)
    return await crypto.subtle.sign("HMAC", cryptoKey, msgBuffer)
  }

  private async getSignatureKey(
    key: string,
    dateStamp: string,
    regionName: string,
    serviceName: string,
  ): Promise<ArrayBuffer> {
    const kDate = await this.hmac(new TextEncoder().encode("AWS4" + key), dateStamp)
    const kRegion = await this.hmac(kDate, regionName)
    const kService = await this.hmac(kRegion, serviceName)
    const kSigning = await this.hmac(kService, "aws4_request")
    return kSigning
  }

  async sendEmail(fromEmail: string, emailData: EmailData): Promise<boolean> {
    try {
      console.log("[v0] Preparing to send email via AWS SES (fetch-based)")
      console.log("[v0] Region:", this.config.region)
      console.log("[v0] From:", this.config.fromEmail)
      console.log("[v0] To:", emailData.to)

      const service = "ses"
      const host = `email.${this.config.region}.amazonaws.com`
      const endpoint = `https://${host}/`
      const method = "POST"

      // Create ISO8601 timestamp
      const now = new Date()
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "")
      const dateStamp = amzDate.substring(0, 8)

      // Build the email body (SES API v2 format)
      const sourceEmail = this.config.fromName
        ? `${this.config.fromName} <${this.config.fromEmail}>`
        : this.config.fromEmail

      const requestBody = JSON.stringify({
        Content: {
          Simple: {
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
        },
        Destination: {
          ToAddresses: emailData.to,
          CcAddresses: emailData.cc || [],
        },
        FromEmailAddress: sourceEmail,
      })

      // Create canonical request
      const payloadHash = this.bufferToHex(await this.sha256(requestBody))

      const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`
      const signedHeaders = "content-type;host;x-amz-date"
      const canonicalRequest = `${method}\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`

      // Create string to sign
      const algorithm = "AWS4-HMAC-SHA256"
      const credentialScope = `${dateStamp}/${this.config.region}/${service}/aws4_request`
      const canonicalRequestHash = this.bufferToHex(await this.sha256(canonicalRequest))
      const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`

      // Calculate signature
      const signingKey = await this.getSignatureKey(this.config.secretAccessKey, dateStamp, this.config.region, service)
      const signature = this.bufferToHex(await this.hmac(signingKey, stringToSign))

      // Build authorization header
      const authorizationHeader = `${algorithm} Credential=${this.config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

      console.log("[v0] Sending request to SES API v2...")

      // Make the request
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Host: host,
          "X-Amz-Date": amzDate,
          Authorization: authorizationHeader,
        },
        body: requestBody,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] SES API error response:", errorText)
        throw new Error(`SES API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log("[v0] Email sent successfully via AWS SES:", result)
      return true
    } catch (error) {
      console.error("[v0] Failed to send email via AWS SES:", error)
      if (error instanceof Error) {
        console.error("[v0] Error name:", error.name)
        console.error("[v0] Error message:", error.message)
      }
      throw error
    }
  }
}
