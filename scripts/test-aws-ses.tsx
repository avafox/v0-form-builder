import { AWSSESEmailService } from "../lib/aws-ses-email"

async function testAWSSES() {
  console.log("=== AWS SES Connection Test ===\n")

  // Check environment variables
  const requiredVars = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SES_FROM_EMAIL"]
  const missing = requiredVars.filter((v) => !process.env[v])

  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing.join(", "))
    console.log("\nPlease set these environment variables:")
    console.log("  AWS_REGION=eu-west-2")
    console.log("  AWS_ACCESS_KEY_ID=AKIA...")
    console.log("  AWS_SECRET_ACCESS_KEY=your-secret-key")
    console.log("  AWS_SES_FROM_EMAIL=ava.foxwell@sky.uk")
    console.log("  AWS_SES_FROM_NAME=GPE Communications Team (optional)")
    process.exit(1)
  }

  const sesService = new AWSSESEmailService({
    region: process.env.AWS_REGION!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    fromEmail: process.env.AWS_SES_FROM_EMAIL!,
    fromName: process.env.AWS_SES_FROM_NAME,
  })

  // Test connection
  console.log("Testing AWS SES connection...")
  console.log(`Region: ${process.env.AWS_REGION}`)
  console.log(`From Email: ${process.env.AWS_SES_FROM_EMAIL}`)
  console.log()

  const isConnected = await sesService.verifyConnection()

  if (!isConnected) {
    console.error("❌ AWS SES connection failed")
    console.log("\nTroubleshooting:")
    console.log("1. Verify AWS credentials are correct")
    console.log("2. Check IAM user has SES permissions")
    console.log("3. Verify email address is verified in SES")
    console.log("4. Check if account is out of sandbox mode")
    console.log("5. Verify region is correct")
    process.exit(1)
  }

  console.log("✅ AWS SES connection successful\n")

  // Test sending email
  const testRecipient = process.env.TEST_EMAIL || process.env.AWS_SES_FROM_EMAIL!

  console.log("Sending test email...")
  console.log(`From: ${process.env.AWS_SES_FROM_EMAIL}`)
  console.log(`To: ${testRecipient}`)
  console.log()

  await sesService.sendEmail(process.env.AWS_SES_FROM_EMAIL!, {
    to: [testRecipient],
    subject: "AWS SES Test Email - GPE Communications Tool",
    htmlContent: `
      <h1>AWS SES Test Successful</h1>
      <p>This is a test email from the GPE Communications Tool using AWS SES.</p>
      <p><strong>AWS SES is working correctly!</strong></p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Sent at: ${new Date().toISOString()}<br>
        From: ${process.env.AWS_SES_FROM_EMAIL}<br>
        Region: ${process.env.AWS_REGION}
      </p>
    `,
  })

  console.log("✅ Test email sent successfully")
  console.log("\n=== All Tests Passed ===")
}

testAWSSES().catch((error) => {
  console.error("\n❌ Test failed:", error.message)
  console.log("\nCommon issues:")
  console.log("- Email not verified in SES (check SES console)")
  console.log("- Account still in sandbox mode (request production access)")
  console.log("- Invalid AWS credentials")
  console.log("- Insufficient IAM permissions")
  process.exit(1)
})
