# SMTP Email Configuration (Alternative to Graph API)

## Overview

If your organization doesn't support Microsoft Graph `Mail.Send` permission, you can use SMTP instead. This guide shows how to configure SMTP email sending for the GPE Communications Tool.

---

## Why SMTP Instead of Graph API?

**Reasons to use SMTP:**
- ✅ Organization blocks Graph API `Mail.Send` permission
- ✅ More traditional, widely supported protocol
- ✅ Works with any email provider (Office 365, Gmail, etc.)
- ✅ No Azure AD app permissions needed for email
- ✅ Simpler permission model

**Trade-offs:**
- ⚠️ Requires SMTP credentials (username/password)
- ⚠️ Less modern than Graph API
- ⚠️ May require app passwords if MFA enabled

---

## Step 1: Get SMTP Credentials for Shared Mailbox

### Option A: Office 365 Shared Mailbox

\`\`\`
1. Create shared mailbox (if not already created):
   - Microsoft 365 Admin Center
   - Teams & groups → Shared mailboxes
   - Create: gpe-communications@yourcompany.com

2. Enable SMTP AUTH for the mailbox:
   - Exchange Admin Center
   - Recipients → Mailboxes
   - Select: gpe-communications@yourcompany.com
   - Mailbox features → Email connectivity
   - Enable: Authenticated SMTP

3. Create app password (if MFA enabled):
   - Go to: myaccount.microsoft.com
   - Security → Additional security verification
   - Create app password for "GPE Communications Tool"
   - Save the generated password
\`\`\`

### Option B: Dedicated Service Account

\`\`\`
1. Create a service account:
   - Azure AD → Users → New user
   - Username: gpe-comms-service@yourcompany.com
   - Assign license (Exchange Online Plan 1 minimum)

2. Grant "Send As" permission to shared mailbox:
   PowerShell:
   Add-RecipientPermission -Identity "gpe-communications@yourcompany.com" `
     -Trustee "gpe-comms-service@yourcompany.com" `
     -AccessRights SendAs

3. Create app password for service account
\`\`\`

---

## Step 2: Configure Environment Variables

Add these to your AWS Amplify environment variables:

\`\`\`bash
# Email Method Selection
EMAIL_METHOD=smtp

# SMTP Configuration
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=gpe-communications@yourcompany.com
SMTP_PASSWORD=your-app-password-here

# Alternative: Use service account
# SMTP_USER=gpe-comms-service@yourcompany.com
# SMTP_PASSWORD=service-account-app-password
\`\`\`

### SMTP Settings for Common Providers

#### Office 365 / Outlook.com
\`\`\`
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
\`\`\`

#### Gmail (if needed for testing)
\`\`\`
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
\`\`\`

#### Exchange On-Premises
\`\`\`
SMTP_HOST=mail.yourcompany.com
SMTP_PORT=587
SMTP_SECURE=false
\`\`\`

---

## Step 3: Update Azure AD Permissions

Since you're using SMTP, you can **remove** the Graph API email permissions:

### Permissions to Remove
- ❌ `Mail.Send` (Application) - No longer needed
- ❌ `Mail.Send.Shared` (Application) - No longer needed

### Permissions to Keep
- ✅ `User.Read` (Delegated) - For user profile
- ✅ `GroupMember.Read.All` (Delegated) - For access control

**This significantly reduces your app's permissions footprint!**

---

## Step 4: Test SMTP Connection

### Test Script

Create a test file to verify SMTP works:

\`\`\`typescript
// scripts/test-smtp.ts
import { SMTPEmailService } from "../lib/smtp-email"

async function testSMTP() {
  const smtpService = new SMTPEmailService({
    host: process.env.SMTP_HOST || "smtp.office365.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASSWORD!,
    },
  })

  // Test connection
  console.log("Testing SMTP connection...")
  const isConnected = await smtpService.verifyConnection()

  if (!isConnected) {
    console.error("❌ SMTP connection failed")
    process.exit(1)
  }

  console.log("✅ SMTP connection successful")

  // Test sending email
  console.log("Sending test email...")
  await smtpService.sendEmail("gpe-communications@yourcompany.com", {
    to: ["your-test-email@yourcompany.com"],
    subject: "SMTP Test Email",
    htmlContent: "<h1>Test</h1><p>SMTP is working!</p>",
  })

  console.log("✅ Test email sent successfully")
}

testSMTP().catch(console.error)
\`\`\`

### Run Test

\`\`\`bash
# Set environment variables
export SMTP_HOST=smtp.office365.com
export SMTP_PORT=587
export SMTP_SECURE=false
export SMTP_USER=gpe-communications@yourcompany.com
export SMTP_PASSWORD=your-app-password

# Run test
npx tsx scripts/test-smtp.ts
\`\`\`

---

## Step 5: Deploy to AWS Amplify

### Add Environment Variables

\`\`\`
1. AWS Amplify Console
2. Your app → Environment variables
3. Add:
   - EMAIL_METHOD = smtp
   - SMTP_HOST = smtp.office365.com
   - SMTP_PORT = 587
   - SMTP_SECURE = false
   - SMTP_USER = gpe-communications@yourcompany.com
   - SMTP_PASSWORD = [your-app-password]
4. Save and redeploy
\`\`\`

---

## Troubleshooting

### Error: "Authentication failed"

**Cause:** Wrong username/password or MFA blocking

**Fix:**
\`\`\`
1. Verify SMTP_USER is correct email address
2. If MFA enabled, create app password:
   - myaccount.microsoft.com → Security
   - Additional security verification
   - Create app password
3. Use app password instead of regular password
\`\`\`

### Error: "Connection timeout"

**Cause:** Wrong SMTP host or port, or firewall blocking

**Fix:**
\`\`\`
1. Verify SMTP_HOST is correct:
   - Office 365: smtp.office365.com
   - Exchange: mail.yourcompany.com
2. Verify SMTP_PORT:
   - TLS: 587 (recommended)
   - SSL: 465
3. Check if corporate firewall blocks outbound SMTP
4. Contact IT to allow SMTP traffic
\`\`\`

### Error: "Mailbox unavailable"

**Cause:** Shared mailbox doesn't have SMTP AUTH enabled

**Fix:**
\`\`\`
1. Exchange Admin Center
2. Recipients → Mailboxes
3. Select shared mailbox
4. Mailbox features → Email connectivity
5. Enable: Authenticated SMTP
6. Wait 15-30 minutes for changes to propagate
\`\`\`

### Error: "Relay access denied"

**Cause:** Trying to send from address different than authenticated user

**Fix:**
\`\`\`
Option 1: Use service account with "Send As" permission
Option 2: Ensure fromEmail matches SMTP_USER
Option 3: Configure Exchange to allow relay
\`\`\`

---

## Security Best Practices

### 1. Use App Passwords (Not Regular Passwords)

\`\`\`
✅ Create dedicated app password for this application
❌ Don't use your regular account password
❌ Don't share passwords across applications
\`\`\`

### 2. Rotate Credentials Regularly

\`\`\`
- Change SMTP password every 6-12 months
- Update AWS Amplify environment variables
- Test after rotation
\`\`\`

### 3. Use Service Account (Recommended)

\`\`\`
✅ Create dedicated service account for app
✅ Grant only "Send As" permission needed
✅ No interactive login required
✅ Easier to audit and revoke
\`\`\`

### 4. Monitor Email Sending

\`\`\`
- Log all email sends with user who triggered
- Set up alerts for unusual sending patterns
- Review sent items in shared mailbox regularly
\`\`\`

---

## Comparison: SMTP vs Graph API

| Feature | SMTP | Graph API |
|---------|------|-----------|
| **Permissions Required** | None (uses credentials) | Mail.Send (Application) |
| **Authentication** | Username/password | OAuth 2.0 client credentials |
| **Setup Complexity** | Low | Medium |
| **Modern/Recommended** | No (legacy) | Yes |
| **Works if Graph blocked** | ✅ Yes | ❌ No |
| **Requires app password** | ✅ Yes (if MFA) | ❌ No |
| **Audit trail** | Exchange logs | Graph API logs |

---

## Migration from Graph to SMTP

If you're switching from Graph API to SMTP:

### 1. Add SMTP Environment Variables

\`\`\`bash
EMAIL_METHOD=smtp
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=gpe-communications@yourcompany.com
SMTP_PASSWORD=your-app-password
\`\`\`

### 2. Keep Existing Variables (for access control)

\`\`\`bash
# Keep these for authentication and access control
MICROSOFT_CLIENT_ID=...
MICROSOFT_TENANT_ID=...
MICROSOFT_CLIENT_SECRET=...
\`\`\`

### 3. Test in Development

\`\`\`bash
# Test locally first
npm run dev
# Send test email through UI
\`\`\`

### 4. Deploy to Production

\`\`\`bash
# Update Amplify environment variables
# Redeploy application
# Test email sending in production
\`\`\`

### 5. Remove Graph Email Permissions (Optional)

\`\`\`
1. Azure Portal → App registrations
2. Your app → API permissions
3. Remove: Mail.Send or Mail.Send.Shared
4. Keep: User.Read, GroupMember.Read.All
\`\`\`

---

## Support

**Common Issues:**
- SMTP authentication failures → Check app password
- Connection timeouts → Verify firewall rules
- Relay denied → Check "Send As" permissions

**Need Help?**
- Contact your IT team for SMTP credentials
- Check Exchange Admin Center for mailbox settings
- Review Exchange Online SMTP documentation

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Recommended Method:** SMTP (if Graph API blocked)
