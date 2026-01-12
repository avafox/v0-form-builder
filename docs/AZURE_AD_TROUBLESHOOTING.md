# Azure AD MFA Authentication - Troubleshooting Guide

## Current Status

Your form builder requires Azure AD authentication with MFA for all Sky UK users.

## Quick Diagnostic Steps

### 1. Check Environment Variables in Runtime

Visit this URL in your deployed app:
```
https://main.d2baofxalff7ki.amplifyapp.com/api/auth/test-config
```

You should see:
```json
{
  "hasNextAuthSecret": true,
  "hasNextAuthUrl": true,
  "hasMicrosoftClientId": true,
  "hasMicrosoftClientSecret": true,
  "hasMicrosoftTenantId": true,
  "nextAuthUrl": "https://main.d2baofxalff7ki.amplifyapp.com",
  "nodeEnv": "production"
}
```

If any value is `false`, the environment variable is not loaded at runtime.

### 2. Test Azure AD Login Flow

1. Visit: `https://main.d2baofxalff7ki.amplifyapp.com/auth/signin`
2. Check the configuration status at the bottom
3. Click "Sign in with Microsoft"
4. You should be redirected to Microsoft login

### 3. Common Errors and Solutions

#### CLIENT_FETCH_ERROR

**Cause:** NextAuth API routes can't communicate with the server

**Solutions:**
- Verify NEXTAUTH_SECRET is set and is a valid base64 string (32+ characters)
- Verify NEXTAUTH_URL exactly matches your Amplify domain
- Check Amplify build logs for errors
- Ensure all environment variables are set for "All branches"

#### AADSTS90097: Admin consent error

**Cause:** Azure AD app requires admin consent

**Solution:**
1. Contact Sky UK Azure AD administrator
2. Request admin consent for app ID: `6a4e7950-9c5d-4ee7-b644-8d1f86235d8d`
3. Ensure redirect URI is configured: `https://main.d2baofxalff7ki.amplifyapp.com/api/auth/callback/azure-ad`

#### Access Denied

**Cause:** User's email is not @sky.uk domain

**Solution:**
- Only @sky.uk email addresses are allowed
- Check the email associated with the Microsoft account

## Azure AD App Configuration Checklist

In Azure Portal → Microsoft Entra ID → App Registrations:

### Authentication
- [ ] Platform: Web
- [ ] Redirect URI: `https://main.d2baofxalff7ki.amplifyapp.com/api/auth/callback/azure-ad`
- [ ] ID tokens: Enabled
- [ ] Access tokens: Enabled

### API Permissions
- [ ] Microsoft Graph - User.Read (Delegated)
- [ ] Microsoft Graph - openid (Delegated)
- [ ] Microsoft Graph - profile (Delegated)
- [ ] Microsoft Graph - email (Delegated)
- [ ] Admin consent granted: Yes

### Certificates & Secrets
- [ ] Client secret created and not expired
- [ ] Client secret value copied to MICROSOFT_CLIENT_SECRET env var

## Environment Variables Required

All must be set in Amplify Console → Environment Variables → All branches:

| Variable | Example | Purpose |
|----------|---------|---------|
| NEXTAUTH_SECRET | `nu/zSvG++aGcp6d55JT...` | JWT encryption key |
| NEXTAUTH_URL | `https://main.d2baofxalff7ki.amplifyapp.com` | App base URL |
| MICROSOFT_CLIENT_ID | `6a4e7950-9c5d-4ee7...` | Azure AD app ID |
| MICROSOFT_CLIENT_SECRET | `bqm8Q~j2ujv1HdXA...` | Azure AD client secret |
| MICROSOFT_TENANT_ID | `2fdb7e27-9b62-44f7...` | Sky UK tenant ID |

## How MFA Works

1. User visits `/auth/signin`
2. Clicks "Sign in with Microsoft"
3. Redirected to Microsoft login page
4. Enters @sky.uk email and password
5. **Azure AD checks Conditional Access policies**
6. **If MFA is required by policy, user prompted for MFA**
7. After successful auth, redirected to `/communications`

**Note:** MFA is enforced by Azure AD Conditional Access policies configured by Sky UK IT, not by this application code.

## Testing Without Azure AD (Temporary)

If you need to test email sending functionality without authentication:

1. Comment out the authentication check in `lib/auth-helpers.ts`
2. Access `/communications` directly
3. Test AWS SES email sending

**Warning:** Do not deploy to production without authentication!

## Support

If authentication continues to fail:
1. Check Amplify build logs
2. Check browser console for errors
3. Visit `/api/auth/test-config` to verify env vars
4. Contact Sky UK Azure AD administrator for app registration issues
