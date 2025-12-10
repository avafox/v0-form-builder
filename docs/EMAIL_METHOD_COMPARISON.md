# Email Method Comparison: SMTP vs Microsoft Graph API

## Overview

This document compares the two email sending methods available in the GPE Communications Tool and helps you choose the right one for your organization.

---

## Quick Decision Guide

**Use SMTP if:**
- ✅ Your organization blocks Microsoft Graph `Mail.Send` permission
- ✅ You prefer traditional email protocols
- ✅ You want simpler permission management
- ✅ You have SMTP credentials available

**Use Microsoft Graph API if:**
- ✅ Your organization allows Graph API permissions
- ✅ You want modern OAuth 2.0 authentication
- ✅ You prefer not managing passwords
- ✅ You want better integration with Microsoft 365

---

## Detailed Comparison

| Aspect | SMTP | Microsoft Graph API |
|--------|------|---------------------|
| **Azure AD Permissions** | None for email | `Mail.Send` (Application) |
| **Authentication** | Username + Password/App Password | OAuth 2.0 Client Credentials |
| **Setup Complexity** | Low | Medium |
| **Credential Management** | Password/App Password | Client Secret |
| **MFA Compatibility** | Requires App Password | Native support |
| **Modern/Recommended** | No (legacy protocol) | Yes (modern API) |
| **Works if Graph blocked** | ✅ Yes | ❌ No |
| **Protocol** | SMTP (RFC 5321) | HTTPS REST API |
| **Port Requirements** | 587 (TLS) or 465 (SSL) | 443 (HTTPS) |
| **Firewall Considerations** | May be blocked | Usually allowed |
| **Rate Limits** | Exchange Online limits | Graph API throttling |
| **Error Handling** | SMTP error codes | HTTP status codes + JSON |
| **Audit Trail** | Exchange logs | Graph API logs + Azure AD logs |
| **Sent Items** | Saved automatically | Configurable |
| **Attachments** | Full support | Full support |
| **HTML Emails** | Full support | Full support |
| **Delivery Reports** | Via SMTP | Via Graph API |

---

## Security Comparison

### SMTP Security

**Pros:**
- ✅ No Azure AD app permissions needed for email
- ✅ Credentials can be rotated independently
- ✅ Works with service accounts

**Cons:**
- ⚠️ Requires storing password/app password
- ⚠️ Password-based authentication (less secure than OAuth)
- ⚠️ If MFA enabled, requires app password management

**Best Practices:**
- Use dedicated service account
- Use app passwords (not regular passwords)
- Rotate credentials every 6-12 months
- Store credentials in secure environment variables
- Monitor for unauthorized access

---

### Microsoft Graph API Security

**Pros:**
- ✅ OAuth 2.0 token-based authentication
- ✅ No passwords stored (uses client secret)
- ✅ Better audit trail in Azure AD
- ✅ Granular permission control

**Cons:**
- ⚠️ Requires `Mail.Send` permission (may be blocked)
- ⚠️ Client secret must be protected
- ⚠️ Requires admin consent

**Best Practices:**
- Use `Mail.Send.Shared` instead of `Mail.Send` if available
- Rotate client secrets every 12-24 months
- Monitor Graph API usage in Azure AD
- Use managed identities if possible (future enhancement)

---

## Performance Comparison

### SMTP Performance

**Typical Latency:** 1-3 seconds per email

**Factors:**
- SMTP server response time
- Network latency
- TLS handshake overhead
- Email size

**Throughput:**
- Office 365: 30 messages/minute per connection
- Can open multiple connections for higher throughput

---

### Microsoft Graph API Performance

**Typical Latency:** 500ms - 2 seconds per email

**Factors:**
- OAuth token acquisition (cached)
- API endpoint response time
- Network latency
- Email size

**Throughput:**
- Graph API throttling limits apply
- Batch operations supported (future enhancement)

---

## Cost Comparison

### SMTP

**Costs:**
- ✅ No additional Azure costs
- ✅ Included with Exchange Online license
- ✅ No API call charges

**Requirements:**
- Exchange Online mailbox license
- SMTP AUTH enabled (included)

---

### Microsoft Graph API

**Costs:**
- ✅ No additional Azure costs
- ✅ Included with Exchange Online license
- ✅ No API call charges

**Requirements:**
- Azure AD app registration (free)
- Exchange Online mailbox license
- Admin consent for permissions

**Both methods have the same cost - zero additional charges beyond your existing Microsoft 365 licenses.**

---

## Reliability Comparison

### SMTP Reliability

**Pros:**
- ✅ Mature, stable protocol (40+ years old)
- ✅ Well-understood error handling
- ✅ Automatic retry mechanisms

**Cons:**
- ⚠️ May be blocked by corporate firewalls
- ⚠️ Less detailed error messages
- ⚠️ Connection pooling required for scale

**Typical Issues:**
- Authentication failures
- Connection timeouts
- Relay access denied
- Mailbox quota exceeded

---

### Microsoft Graph API Reliability

**Pros:**
- ✅ Modern, actively maintained
- ✅ Detailed error responses
- ✅ Built-in retry logic
- ✅ Better monitoring capabilities

**Cons:**
- ⚠️ Dependent on Azure AD availability
- ⚠️ Token expiration handling needed
- ⚠️ API versioning changes

**Typical Issues:**
- Permission errors
- Token expiration
- API throttling
- Service outages (rare)

---

## Migration Guide

### From Graph API to SMTP

**When to migrate:**
- Organization blocks `Mail.Send` permission
- Prefer simpler authentication
- Want to reduce Azure AD app permissions

**Steps:**

1. **Get SMTP credentials**
   \`\`\`
   - Create app password for shared mailbox
   - Or create service account with "Send As" permission
   \`\`\`

2. **Add environment variables**
   \`\`\`bash
   EMAIL_METHOD=smtp
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=gpe-communications@yourcompany.com
   SMTP_PASSWORD=your-app-password
   \`\`\`

3. **Test SMTP connection**
   \`\`\`bash
   npx tsx scripts/test-smtp.ts
   \`\`\`

4. **Deploy changes**
   \`\`\`
   - Update AWS Amplify environment variables
   - Redeploy application
   - Test email sending
   \`\`\`

5. **Remove Graph permissions (optional)**
   \`\`\`
   - Azure Portal → App registrations
   - Remove Mail.Send permission
   - Keep User.Read and GroupMember.Read.All
   \`\`\`

---

### From SMTP to Graph API

**When to migrate:**
- Organization allows Graph API permissions
- Want modern OAuth authentication
- Prefer not managing passwords

**Steps:**

1. **Configure Azure AD app**
   \`\`\`
   - Add Mail.Send (Application) permission
   - Grant admin consent
   - Wait 15-30 minutes for propagation
   \`\`\`

2. **Grant "Send As" permission**
   ```powershell
   Add-RecipientPermission -Identity "shared-mailbox@company.com" `
     -Trustee "Your App Name" -AccessRights SendAs
   \`\`\`

3. **Update environment variables**
   \`\`\`bash
   EMAIL_METHOD=graph
   # SMTP variables can be removed
   \`\`\`

4. **Test Graph API**
   \`\`\`bash
   # Use Postman collection or curl
   curl -X POST /api/send-email ...
   \`\`\`

5. **Deploy changes**
   \`\`\`
   - Update AWS Amplify environment variables
   - Redeploy application
   - Test email sending
   \`\`\`

---

## Troubleshooting Decision Tree

\`\`\`
Email not sending?
│
├─ Using SMTP?
│  ├─ Authentication failed?
│  │  ├─ Check SMTP_USER is correct
│  │  ├─ Verify SMTP_PASSWORD (use app password if MFA)
│  │  └─ Ensure SMTP AUTH enabled on mailbox
│  │
│  ├─ Connection timeout?
│  │  ├─ Verify SMTP_HOST and SMTP_PORT
│  │  ├─ Check firewall allows outbound SMTP
│  │  └─ Try telnet smtp.office365.com 587
│  │
│  └─ Relay access denied?
│     ├─ Verify "Send As" permission granted
│     └─ Ensure fromEmail matches SMTP_USER
│
└─ Using Graph API?
   ├─ Insufficient privileges?
   │  ├─ Verify Mail.Send permission added
   │  ├─ Check admin consent granted
   │  └─ Wait 15-30 minutes for propagation
   │
   ├─ Mailbox not found?
   │  ├─ Verify shared mailbox exists
   │  ├─ Check email address is correct
   │  └─ Ensure "Send As" permission granted to app
   │
   └─ Token errors?
      ├─ Verify client secret is correct
      ├─ Check client secret not expired
      └─ Ensure tenant ID is correct
\`\`\`

---

## Recommendations by Organization Type

### Enterprise with Strict Security Policies

**Recommended:** SMTP
- Less Azure AD permissions required
- Easier to audit and control
- Works even if Graph API blocked

---

### Modern Cloud-First Organizations

**Recommended:** Microsoft Graph API
- Modern OAuth authentication
- Better integration with Microsoft 365
- Detailed audit logs in Azure AD

---

### Hybrid Environments

**Recommended:** SMTP
- More compatible with on-premises Exchange
- Fewer dependencies on cloud services
- Easier troubleshooting

---

### Startups / Small Teams

**Recommended:** Microsoft Graph API
- Simpler setup (no password management)
- Better developer experience
- Modern best practices

---

## Future Enhancements

### Planned Features

**Both Methods:**
- Batch email sending
- Email templates
- Delivery status tracking
- Retry logic with exponential backoff

**SMTP Specific:**
- Connection pooling
- Multiple SMTP server support
- DKIM signing

**Graph API Specific:**
- Managed identity support (when on Azure)
- Batch API operations
- Advanced Graph features (calendar, contacts)

---

## Summary

**Choose SMTP if:**
- Your organization blocks Graph API `Mail.Send`
- You prefer traditional protocols
- You want minimal Azure AD permissions

**Choose Graph API if:**
- Your organization allows Graph permissions
- You want modern OAuth authentication
- You prefer API-based integrations

**Both methods are fully supported and production-ready. The choice depends on your organization's security policies and preferences.**

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Next Review:** [Date + 90 days]
