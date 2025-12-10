# Email Sending Permissions Comparison

## Overview

This document compares three approaches for sending emails from the GPE Communications Tool.

---

## Option 1: Application Permissions (Blocked by Company)

### Configuration

\`\`\`
Azure AD App → Has Mail.Send permission → Sends from shared mailbox
\`\`\`

### Requirements

**Azure AD:**
- `Mail.Send` (Application permission)
- Admin consent granted

**Exchange:**
- App service principal has "Send As" on shared mailbox

**Users:**
- No mailbox permissions needed ✅
- Cannot send from mailbox manually ✅

### Pros & Cons

✅ **Pros:**
- Users don't need mailbox access
- Centralized control (only app can send)
- Better security (users can't manually send)
- Easier permission management

❌ **Cons:**
- **Company blocks Mail.Send application permission**
- Requires admin consent
- More complex Azure AD setup

### Security Level: **HIGH** ⭐⭐⭐⭐⭐

---

## Option 2: Delegated Permissions (Requires User Mailbox Access)

### Configuration

\`\`\`
User → Authenticates → Uses their token → Sends from shared mailbox
       ↓
       Requires: User has "Send As" permission
\`\`\`

### Requirements

**Azure AD:**
- `Mail.Send` (Delegated permission)
- User consent (or admin consent)

**Exchange:**
- **EVERY user needs "Send As" on shared mailbox** ⚠️
- OR grant to entire Azure AD group

**Users:**
- Must have "Send As" permission on mailbox
- Can send from mailbox in Outlook

### Pros & Cons

✅ **Pros:**
- May be allowed if application permissions are blocked
- Uses user's own token (delegated)
- Can grant to group for easier management

❌ **Cons:**
- **Every user needs mailbox "Send As" permission**
- Users can manually send from mailbox in Outlook
- Less control over email content
- Security risk if users misuse mailbox access
- Management overhead (keep group in sync)

### Security Level: **MEDIUM** ⭐⭐⭐

### Setup Commands

```powershell
# Option A: Grant to entire group (recommended)
Add-RecipientPermission -Identity "gpe-communications@yourcompany.com" `
  -Trustee "GPE-Communications-Team" `
  -AccessRights SendAs `
  -Confirm:$false

# Option B: Grant to individual users (not recommended)
Add-RecipientPermission -Identity "gpe-communications@yourcompany.com" `
  -Trustee "user@yourcompany.com" `
  -AccessRights SendAs `
  -Confirm:$false
