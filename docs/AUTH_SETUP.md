# Azure AD Authentication Setup Guide

## Required Environment Variables

Add these to **AWS Amplify Console → Environment Variables**:

### 1. NextAuth Configuration

```env
NEXTAUTH_SECRET=<generate-random-32-char-string>
NEXTAUTH_URL=https://main.d2baofxalff7ki.amplifyapp.com
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

### 2. Azure AD Credentials (Already Set)

```env
MICROSOFT_CLIENT_ID=<your-value>
MICROSOFT_CLIENT_SECRET=<your-value>
MICROSOFT_TENANT_ID=<your-value>
```

## Current Status

| Variable | Status |
|----------|--------|
| MICROSOFT_CLIENT_ID | ✓ Set |
| MICROSOFT_CLIENT_SECRET | ✓ Set |
| MICROSOFT_TENANT_ID | ✓ Set |
| NEXTAUTH_SECRET | ✗ MISSING |
| NEXTAUTH_URL | ✗ MISSING |

## Steps to Fix Authentication Error

### Step 1: Add Missing Variables

1. Go to: **AWS Amplify Console**
2. Select your app
3. Click: **Hosting** → **Environment variables**
4. Add:
   ```
   NEXTAUTH_SECRET = <paste generated secret>
   NEXTAUTH_URL = https://main.d2baofxalff7ki.amplifyapp.com
   ```

### Step 2: Redeploy

1. Go to: **Hosting** → **Rewrites and redirects**
2. Or just push a commit to trigger redeploy
3. Wait for deployment to complete

### Step 3: Test Authentication

1. Visit: `https://main.d2baofxalff7ki.amplifyapp.com`
2. You should be redirected to Azure AD login
3. Sign in with your @sky.uk account
4. Complete MFA if prompted
5. You'll be redirected to the communications builder

## Azure MFA Enforcement

MFA is enforced by your Azure AD tenant policies. This app doesn't control MFA - it relies on Azure AD configuration.

**To ensure MFA is required:**

1. Go to: **Azure Portal** → **Azure Active Directory**
2. Navigate to: **Security** → **Conditional Access**
3. Create a policy that requires MFA for this application
4. Assign the policy to your users/groups

## Troubleshooting

### Error: CLIENT_FETCH_ERROR

**Cause:** Missing `NEXTAUTH_SECRET` or `NEXTAUTH_URL`

**Solution:** Add the environment variables as shown above

### Error: Access Denied

**Cause:** Email domain check failing

**Solution:** Ensure you're signing in with an `@sky.uk` email address

### Error: AADSTS90097 (Admin Consent)

**Cause:** App requires admin-approved permissions

**Solution:** Current configuration only uses basic permissions (openid, profile, email, User.Read) which shouldn't require admin consent. If still occurring, contact your Azure AD administrator.

## Security Notes

- Authentication is handled by Azure AD (Microsoft)
- MFA enforcement is configured in Azure AD, not this app
- Only `@sky.uk` domain emails are allowed
- Sessions expire after inactivity (controlled by NextAuth)
- All authentication cookies are HTTP-only and secure

</markdown>
```

```typescript file="" isHidden
