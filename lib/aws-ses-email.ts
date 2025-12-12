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
      console.log("[v0] === AWS SES Email Send Starting ===")
      console.log("[v0] Region:", this.config.region)
      console.log("[v0] From:", this.config.fromEmail)
      console.log("[v0] To:", emailData.to)
      console.log("[v0] Subject:", emailData.subject)
      console.log("[v0] Access Key ID (first 8 chars):", this.config.accessKeyId.substring(0, 8))

      const service = "ses"
      const host = `email.${this.config.region}.amazonaws.com`

      const endpoint = `https://${host}/v2/email/outbound-emails`
      const method = "POST"

      // Create ISO8601 timestamp
      const now = new Date()
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "")
      const dateStamp = amzDate.substring(0, 8)

      console.log("[v0] Timestamp:", amzDate)
      console.log("[v0] Date stamp:", dateStamp)
      console.log("[v0] Endpoint:", endpoint)

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
            },
          },
        },
        Destination: {
          ToAddresses: emailData.to,
          ...(emailData.cc && emailData.cc.length > 0 ? { CcAddresses: emailData.cc } : {}),
        },
        FromEmailAddress: sourceEmail,
      })

      console.log("[v0] Request body prepared, length:", requestBody.length)

      // Create canonical request
      const payloadHash = this.bufferToHex(await this.sha256(requestBody))
      console.log("[v0] Payload hash:", payloadHash)

      const canonicalUri = "/v2/email/outbound-emails"
      const canonicalQueryString = ""
      const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`
      const signedHeaders = "content-type;host;x-amz-date"
      const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`

      // Create string to sign
      const algorithm = "AWS4-HMAC-SHA256"
      const credentialScope = `${dateStamp}/${this.config.region}/${service}/aws4_request`
      const canonicalRequestHash = this.bufferToHex(await this.sha256(canonicalRequest))
      const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`

      console.log("[v0] Credential scope:", credentialScope)

      // Calculate signature
      const signingKey = await this.getSignatureKey(this.config.secretAccessKey, dateStamp, this.config.region, service)
      const signature = this.bufferToHex(await this.hmac(signingKey, stringToSign))

      console.log("[v0] Signature calculated, length:", signature.length)

      // Build authorization header
      const authorizationHeader = `${algorithm} Credential=${this.config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

      console.log("[v0] Authorization header prepared")
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

      console.log("[v0] Response received, status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] === SES API ERROR ===")
        console.error("[v0] Status:", response.status)
        console.error("[v0] Status Text:", response.statusText)
        console.error("[v0] Response:", errorText)
        console.error("[v0] Endpoint:", endpoint)
        console.error("[v0] Region:", this.config.region)

        // Try to parse AWS error details
        try {
          const errorJson = JSON.parse(errorText)
          console.error("[v0] AWS Error Type:", errorJson.__type || errorJson.Type)
          console.error("[v0] AWS Error Code:", errorJson.Code)
          console.error("[v0] AWS Error Message:", errorJson.Message || errorJson.message)

          throw new Error(`SES API Error: ${errorJson.Message || errorJson.message || errorText}`)
        } catch (parseError) {
          // Error response wasn't JSON
          throw new Error(`SES API Error (${response.status}): ${errorText}`)
        }
      }

      const result = await response.json()
      console.log("[v0] === Email Sent Successfully ===")
      console.log("[v0] Result:", JSON.stringify(result))
      return true
    } catch (error) {
      console.error("[v0] === SES Email Send Failed ===")
      console.error("[v0] Error:", error)
      if (error instanceof Error) {
        console.error("[v0] Error name:", error.name)
        console.error("[v0] Error message:", error.message)
        console.error("[v0] Error stack:", error.stack)
      }
      throw error
    }
  }
}
