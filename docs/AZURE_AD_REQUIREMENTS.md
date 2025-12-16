# Azure AD Application Requirements
## GPE Communications Tool

**Application Name:** GPE Communications Tool  
**Purpose:** Internal communications management with email sending and access control  
**Environment:** Production  
**Date:** [Current Date]

---

## Executive Summary

This application requires minimal Azure AD permissions to:
1. Send emails from a **specific shared mailbox** (not any mailbox)
2. Check if signed-in users belong to authorized groups
3. Authenticate users via Microsoft login

**Security Principle:** Least privilege - only what's needed, nothing more.

---

## Required Permissions

### Delegated Permissions (User Context)

**1. User.Read**
- **Type:** Delegated
- **Purpose:** Read signed-in user's profile (name, email)
- **Scope:** User's own data only
- **Required:** Yes

**2. GroupMember.Read.All**
- **Type:** Delegated
- **Purpose:** Check if user belongs to authorized groups
- **Scope:** User's own group memberships only
- **Required:** Yes

### Application Permissions (App Context)

**NONE REQUIRED** ✅


**Previously considered but NOT needed:**
- ❌ Mail.Send - Company blocks this permission
- ❌ Mail.Send.Shared - Company blocks this permission

**Why no email permissions?**
- App uses SMTP instead of Microsoft Graph API for email sending
- SMTP bypasses the need for Graph API permissions
- Only requires SMTP credentials (username/password)

---

## Email Sending Architecture

### Method: SMTP (Not Graph API)


**Why SMTP?**
1. Company blocks Mail.Send Graph API permission
2. No Azure AD permissions needed for email sending
3. Centralized control (only app has credentials)
4. Users don't need mailbox access

**Requirements:**
- Shared mailbox SMTP credentials
- SMTP enabled on mailbox (default for Office 365)
- Environment variables configured

**What Users DON'T Need:**
- ❌ "Send As" permission on shared mailbox
- ❌ Mail.Send delegated permission
- ❌ Ability to send from mailbox in Outlook

**Security Benefits:**
- ✅ Only app can send emails
- ✅ Users cannot manually send from mailbox
- ✅ Full control over email content
- ✅ Simpler permission management

### Environment Variables Required

```bash
# Email Method
EMAIL_METHOD=smtp

# SMTP Configuration
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=gpe-communications@yourcompany.com
SMTP_PASSWORD=your-mailbox-password
SMTP_FROM_EMAIL=gpe-communications@yourcompany.com
SMTP_FROM_NAME=GPE Communications Team
```

---

## Shared Mailbox Configuration

**Shared Mailbox Email:** `gpe-communications@yourcompany.com` *(replace with actual)*


**Required Setup:**
1. ✅ Shared mailbox created in Microsoft 365
2. ✅ SMTP enabled (default for Office 365)
3. ✅ SMTP credentials (username/password) provided to application
4. ❌ NO "Send As" permissions needed for app or users
5. ❌ NO Graph API permissions needed

**SMTP Credentials:**
- Username: `gpe-communications@yourcompany.com`
- Password: Shared mailbox password or app-specific password

**PowerShell Command (for AD team):**
```powershell
# No permissions needed for app or users
```

---

## What We Are NOT Requesting

**Explicitly NOT requesting:**
- ❌ `Mail.Send` (Application) - Company blocks this
- ❌ `Mail.Send` (Delegated) - Would require users to have mailbox access
- ❌ `Mail.Send.Shared` - Company blocks this
- ❌ `Directory.Read.All` - Too broad, not needed
- ❌ `User.Read.All` - Can read all users, not needed
- ❌ "Send As" permissions for app service principal
- ❌ "Send As" permissions for users on shared mailbox
- ❌ Ability for users to send from mailbox in Outlook
