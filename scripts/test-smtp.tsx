import { SMTPEmailService } from "../lib/smtp-email"

async function testSMTP() {
  console.log("=== SMTP Connection Test ===\n")

  // Check environment variables
  const requiredVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"]
  const missing = requiredVars.filter((v) => !process.env[v])

  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing.join(", "))
    console.log("\nPlease set these environment variables:")
    console.log("  SMTP_HOST=smtp.office365.com")
    console.log("  SMTP_PORT=587")
    console.log("  SMTP_SECURE=false")
    console.log("  SMTP_USER=gpe-communications@yourcompany.com")
    console.log("  SMTP_PASSWORD=your-app-password")
    process.exit(1)
  }

  const smtpService = new SMTPEmailService({
    host: process.env.SMTP_HOST!,
    port: Number.parseInt(process.env.SMTP_PORT!),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASSWORD!,
    },
  })

  // Test connection
  console.log("Testing SMTP connection...")
  console.log(`Host: ${process.env.SMTP_HOST}`)
  console.log(`Port: ${process.env.SMTP_PORT}`)
  console.log(`User: ${process.env.SMTP_USER}`)
  console.log()

  const isConnected = await smtpService.verifyConnection()

  if (!isConnected) {
    console.error("❌ SMTP connection failed")
    console.log("\nTroubleshooting:")
    console.log("1. Verify SMTP credentials are correct")
    console.log("2. Check if MFA is enabled (use app password)")
    console.log("3. Verify SMTP AUTH is enabled on mailbox")
    console.log("4. Check firewall allows outbound SMTP")
    process.exit(1)
  }

  console.log("✅ SMTP connection successful\n")

  // Test sending email
  const testRecipient = process.env.TEST_EMAIL || process.env.SMTP_USER!

  console.log("Sending test email...")
  console.log(`From: ${process.env.SMTP_USER}`)
  console.log(`To: ${testRecipient}`)
  console.log()

  await smtpService.sendEmail(process.env.SMTP_USER!, {
    to: [testRecipient],
    subject: "SMTP Test Email - GPE Communications Tool",
    htmlContent: `
      <h1>SMTP Test Successful</h1>
      <p>This is a test email from the GPE Communications Tool.</p>
      <p><strong>SMTP is working correctly!</strong></p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Sent at: ${new Date().toISOString()}<br>
        From: ${process.env.SMTP_USER}<br>
        Host: ${process.env.SMTP_HOST}
      </p>
    `,
  })

  console.log("✅ Test email sent successfully")
  console.log("\n=== All Tests Passed ===")
}

testSMTP().catch((error) => {
  console.error("\n❌ Test failed:", error.message)
  process.exit(1)
})
