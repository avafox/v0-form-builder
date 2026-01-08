# Security Documentation - Form Builder Application

## Overview

This document outlines the security measures implemented in the GPE Communications Form Builder application.

---

## 1. Authentication & Access Control

### Azure AD Single Sign-On (SSO)

| Feature | Implementation |
|---------|----------------|
| Provider | Microsoft Azure AD via NextAuth.js |
| Protocol | OAuth 2.0 / OpenID Connect |
| Session | Encrypted JWT tokens |
| Timeout | Configurable session expiry |

### Access Control Layers

```
Layer 1: Azure AD Authentication
    └── User must have valid Sky UK Microsoft account

Layer 2: Email Domain Restriction
    └── Only @sky.uk email addresses allowed

Layer 3: Email Whitelist (Optional)
    └── Specific team members can be whitelisted
```

### Configuration

```env
# Domain restriction (all @sky.uk users)
ALLOWED_EMAIL_DOMAINS=sky.uk

# Specific user whitelist (optional, comma-separated)
ALLOWED_EMAILS=user1@sky.uk,user2@sky.uk,user3@sky.uk
```

---

## 2. Network Security

### IP Restriction (Optional)

Restrict access to specific IP addresses or ranges (e.g., Sky UK office networks).

```env
# Enable IP restriction
ENABLE_IP_RESTRICTION=true

# Allowed IP addresses/ranges (CIDR notation supported)
ALLOWED_IP_RANGES=10.0.0.0/8,192.168.1.0/24,203.0.113.50
```

### Security Headers

The following headers are applied to all responses:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | XSS filter |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer info |
| Permissions-Policy | camera=(), microphone=()... | Disable unused APIs |

### Blocked Paths

Automatic blocking of common attack vectors:

- `/wp-admin`, `/wp-login` (WordPress exploits)
- `/.env`, `/.git` (Configuration exposure)
- `/phpinfo`, `/admin.php` (PHP exploits)

---

## 3. Rate Limiting

Powered by Upstash Redis to prevent abuse.

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| API Routes | 20 requests | 10 seconds |
| Authentication | 5 attempts | 60 seconds |
| Email Sending | 10 emails | 60 seconds |

### Response Headers

When rate limited, clients receive:
- `429 Too Many Requests` status
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time until limit resets

---

## 4. Data Protection

### Encryption

| Data | Encryption |
|------|------------|
| Data in Transit | TLS 1.2+ (HTTPS enforced by Amplify) |
| Session Tokens | AES-256 encrypted JWT |
| Database | Supabase encryption at rest |
| Redis Cache | Upstash TLS connection |

### Sensitive Data Handling

- No passwords stored (Azure AD handles authentication)
- Email content not persisted after sending
- Audit logs stored securely in database

---

## 5. AWS Security

### SES Email Service

| Control | Implementation |
|---------|----------------|
| IAM Permissions | Least privilege (ses:SendEmail only) |
| Verified Identity | Sender email verified in SES |
| Region | eu-west-2 (London) |

### Amplify Hosting

| Feature | Status |
|---------|--------|
| HTTPS | Enforced |
| DDoS Protection | AWS Shield Standard |
| WAF | Optional (can be added) |

---

## 6. Recommendations for Enhanced Security

### High Priority

1. **Fix Azure AD Admin Consent**
   - Complete Azure AD setup for full SSO protection
   - Contact Azure AD admin to grant consent

2. **Enable IP Restriction**
   - Add Sky UK office IP ranges to `ALLOWED_IP_RANGES`
   - Set `ENABLE_IP_RESTRICTION=true`

### Medium Priority

3. **Add AWS WAF**
   - Create Web ACL in AWS WAF
   - Add managed rule groups (AWSManagedRulesCommonRuleSet)
   - Associate with Amplify/CloudFront distribution

4. **Enable CloudWatch Alarms**
   - Monitor for unusual API activity
   - Alert on rate limit violations
   - Track failed authentication attempts

### Low Priority

5. **Custom Domain with Route 53**
   - Use custom domain instead of amplifyapp.com
   - Adds professionalism and hides Amplify origin

6. **VPN-Only Access**
   - If Sky UK uses corporate VPN, restrict to VPN IPs only

---

## 7. Compliance Summary

| Requirement | Status |
|-------------|--------|
| Authentication | Azure AD SSO |
| Authorization | Domain + whitelist |
| Encryption (Transit) | TLS 1.2+ |
| Encryption (Rest) | AWS/Supabase managed |
| Rate Limiting | Upstash Redis |
| Audit Logging | Implemented |
| GDPR (Cookies) | Essential only |

---

## 8. Incident Response

### If Suspicious Activity Detected

1. Check CloudWatch/Amplify logs for source IP
2. Add IP to block list in middleware
3. Review rate limit logs in Upstash dashboard
4. If breach suspected, rotate all API keys/secrets

### Environment Variable Rotation

Regularly rotate these secrets:
- `NEXTAUTH_SECRET`
- `SES_ACCESS_KEY_ID` / `SES_SECRET_ACCESS_KEY`
- `MICROSOFT_CLIENT_SECRET`

---

## Contact

For security concerns, contact:
- Sky UK IT Security Team
- Application Owner: GPE Communications Team
