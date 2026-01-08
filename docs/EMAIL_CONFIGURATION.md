# Email Configuration Guide

This document explains how to configure email sending for the GPE Communications Tool.

---

## Current Setup: AWS SES with contact.sky Domain

**Why contact.sky?**

Sky UK restricts `@sky.uk` emails to on-premise servers only. The `@contact.sky` domain is specifically designed to allow third-party services (like AWS SES) to send emails on behalf of Sky.

### Email Flow

```
Form Builder App (Amplify)
    → AWS SES API (eu-west-2)
        → Sends from: noreply@contact.sky (or your verified address)
            → Delivered to: @sky.uk internal addresses
```

---

## Supported Email Methods

| Method | Status | Domain | Best For |
|--------|--------|--------|----------|
| **AWS SES** | Active | @contact.sky | Internal communications |
| SMTP | Available | @contact.sky | Alternative |
| Microsoft Graph | Not recommended | @sky.uk | Requires on-premise |
| Resend | Available | Custom | External comms |

---

## AWS SES Configuration (Current)

### Environment Variables

Set these in **AWS Amplify Console > Environment Variables**:

```bash
# AWS SES Configuration
SES_ACCESS_KEY_ID=your-iam-access-key
SES_SECRET_ACCESS_KEY=your-iam-secret-key
SES_REGION=eu-west-2

# IMPORTANT: Use @contact.sky domain (not @sky.uk)
SES_FROM_EMAIL=gpe-communications@contact.sky
SES_FROM_NAME=GPE Communications Team

# Default email provider
EMAIL_PROVIDER=ses
```

### AWS SES Console Setup

1. **Verify Sender Identity**
   - Go to: AWS Console > SES > Verified identities
   - Add email: `gpe-communications@contact.sky`
   - Complete verification process

2. **Request Production Access** (if in sandbox)
   - Go to: AWS Console > SES > Account dashboard
   - Click "Request production access"
   - Explain use case: Internal business communications

3. **Create IAM User**
   - Create IAM user with `AmazonSESFullAccess` policy
   - Generate access keys for Amplify

---

## Domain Explanation

| Domain | Owner | Use Case | AWS SES Compatible |
|--------|-------|----------|-------------------|
| `@sky.uk` | Sky UK Corporate | On-premise email only | No |
| `@contact.sky` | Sky UK | Third-party sending | Yes |

The `@contact.sky` domain was created by Sky to allow authorized third parties to send emails on behalf of Sky. This bypasses the corporate restriction on `@sky.uk` while maintaining Sky branding.

---

## Sending From Address Options

| Address | Example | Use Case |
|---------|---------|----------|
| Generic | `gpe-communications@contact.sky` | Team communications |
| No-reply | `noreply@contact.sky` | Automated notifications |
| Specific | `ava.foxwell@contact.sky` | Personal sender |

**Note:** All addresses must be verified in AWS SES before use.

---

## Testing Email

1. Verify environment variables are set in Amplify
2. Go to: `https://main.d2baofxalff7ki.amplifyapp.com/api/test-ses`
3. Check that all SES variables are loaded
4. Test send: `https://main.d2baofxalff7ki.amplifyapp.com/api/send-test-email?to=your-email@sky.uk`

---

## Troubleshooting

### Error: "Email address is not verified"
- Verify the sender email in AWS SES Console
- Ensure you're using `@contact.sky` not `@sky.uk`

### Error: "Sending paused for this account"
- Request production access in SES Console
- Check SES reputation dashboard

### Emails not arriving
- Check spam/junk folder
- Verify recipient address is correct
- Check SES sending statistics for bounces

---

## Alternative: SMTP Configuration

If you need SMTP instead of SES API:

```bash
EMAIL_METHOD=smtp
SMTP_HOST=email-smtp.eu-west-2.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-user
SMTP_PASS=your-ses-smtp-password
SMTP_FROM_EMAIL=gpe-communications@contact.sky
SMTP_FROM_NAME=GPE Communications Team
```

**Note:** SMTP credentials are different from IAM credentials. Generate them in SES Console > SMTP settings.
