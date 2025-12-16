# Email Configuration Guide

This document explains how to configure email sending for the GPE Communications Tool.

---

## Supported Email Methods

The app supports three email sending methods:

1. **SMTP** - Direct SMTP connection to Microsoft 365
2. **Microsoft Graph API** - Using delegated Mail.Send permissions
3. **AWS SES** - Amazon Simple Email Service

---

## Method Comparison

| Feature | SMTP | Graph API | AWS SES |
|---------|------|-----------|---------|
| **Setup Complexity** | Low | Low | Medium |
| **Cost** | Free (M365) | Free (M365) | $0.10/1k emails |
| **Microsoft Dependency** | Full | Full | None |
| **Scalability** | Good | Good | Excellent |
| **Azure AD Permissions** | None | Mail.Send | None |
| **User Permissions** | None | Send As | None |
| **Best For** | Small teams | Small teams | High volume |

---

## Configuration

### Method 1: SMTP (Recommended for Most)

**Environment Variables:**

```bash
EMAIL_METHOD=smtp

SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=cti-cbp-gpe-communications@sky.uk
SMTP_PASSWORD=your-mailbox-password
SMTP_FROM_EMAIL=cti-cbp-gpe-communications@sky.uk
SMTP_FROM_NAME=GPE Communications Team
```

**Azure AD Permissions Needed:**
- User.Read (Delegated)
- GroupMember.Read.All (Delegated)

**Exchange Permissions Needed:**
- None

**Test:**
```bash
npx tsx scripts/test-smtp.tsx
```

---

### Method 2: Microsoft Graph API

**Environment Variables:**

```bash
EMAIL_METHOD=graph

MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_CLIENT_SECRET=your-client-secret
```

**Azure AD Permissions Needed:**
- User.Read (Delegated)
- GroupMember.Read.All (Delegated)
- Mail.Send (Delegated)

**Exchange Permissions Needed:**
- Grant "Send As" permission to GPE-Communications-Team group

**Setup:**
```powershell
Add-RecipientPermission `
  -Identity "cti-cbp-gpe-communications@sky.uk" `
  -Trustee "GPE-Communications-Team" `
  -AccessRights SendAs
