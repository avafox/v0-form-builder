# NextAuth Azure AD MFA - Troubleshooting Guide

## Current Issue: CLIENT_FETCH_ERROR

The `CLIENT_FETCH_ERROR` means NextAuth's API routes (`/api/auth/*`) are failing on the server side, preventing the client from authenticating.

## Root Cause

The most common cause in AWS Amplify is **environment variables not being available at runtime**.

## Diagnostic Steps

### Step 1: Check Environment Variables are Loaded

Visit this URL in your browser:
```
https://main.d2baofxalff7ki.amplifyapp.com/api/auth/check-env
```

You should see:
```json
{
  "NEXTAUTH_URL": "https://main.d2baofxalff7ki.amplifyapp.com",
  "hasNEXTAUTH_SECRET": true,
  "hasMICROSOFT_CLIENT_ID": true,
  "hasMICROSOFT_CLIENT_SECRET": true,
  "hasMICROSOFT_TENANT_ID": true,
  "nodeEnv": "production"
}
```

**If any values show `false`**, the environment variables are not loaded.

### Step 2: Check Server Logs

In the browser console, you should see:
```
[v0] NextAuth configuration check: {
  hasClientId: true,
  hasClientSecret: true,
  hasTenantId: true,
  hasSecret: true,
  nodeEnv: "production"
}
```

**If any values show `false`**, NextAuth cannot initialize properly.

### Step 3: Verify Amplify Environment Variables

Go to **AWS Amplify Console**:
1. Open your app: `v0-form-builder`
2. Click **Hosting** → **Environment variables**
3. Verify these variables exist for "All branches":
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `MICROSOFT_CLIENT_ID`
   - `MICROSOFT_CLIENT_SECRET`
   - `MICROSOFT_TENANT_ID`

## Common Fixes

### Fix 1: Redeploy After Adding Environment Variables

Environment variables only take effect after a redeploy:
1. Go to AWS Amplify Console
2. Click **Redeploy this version** on the latest build
3. Wait for deployment to complete (~5 minutes)
4. Test again

### Fix 2: Check Variable Names Match Exactly

Environment variable names are **case-sensitive**. Verify:
- `NEXTAUTH_SECRET` (not `NEXT_AUTH_SECRET`)
- `NEXTAUTH_URL` (not `NEXT_AUTH_URL`)
- `MICROSOFT_CLIENT_ID` (not `AZURE_AD_CLIENT_ID`)

### Fix 3: Ensure No Trailing Spaces

Environment variables with trailing spaces will fail silently:
1. Click **Manage variables** in Amplify Console
2. Check each value has no extra spaces
3. Save and redeploy

## Expected Authentication Flow (When Working)

1. User visits `https://main.d2baofxalff7ki.amplifyapp.com`
2. User clicks **Sign In with Microsoft**
3. Redirected to Microsoft Azure AD login
4. User enters `@sky.uk` email and password
5. **Azure AD prompts for MFA** (if configured in tenant)
6. User completes MFA (SMS, authenticator app, etc.)
7. Redirected back to app as authenticated user
8. Can access `/communications` page

## MFA Configuration

MFA is **enforced by Azure AD**, not by NextAuth. To enable MFA:

### Option 1: Conditional Access Policy (Recommended)
1. Azure Portal → **Azure Active Directory**
2. **Security** → **Conditional Access**
3. Create policy:
   - Users: All users (or specific group)
   - Cloud apps: Your registered app
   - Grant: **Require multi-factor authentication**

### Option 2: Per-User MFA
1. Azure Portal → **Azure Active Directory**
2. **Users** → Select user
3. **Per-user MFA** → Set to **Enabled** or **Enforced**

## Still Not Working?

If environment variables show as loaded but authentication still fails:

1. Check Azure AD App Registration:
   - Redirect URI: `https://main.d2baofxalff7ki.amplifyapp.com/api/auth/callback/azure-ad`
   - Client secret is not expired
   - Required permissions granted

2. Check browser console for specific errors
3. Check Amplify build logs for deployment errors
4. Try signing in with a different `@sky.uk` account

## Test Authentication

Once environment variables are confirmed loaded:

1. Visit: `https://main.d2baofxalff7ki.amplifyapp.com`
2. Click **Sign In with Microsoft**
3. Sign in with `@sky.uk` account
4. Complete MFA if prompted
5. Should redirect to `/communications`

## Contact

If issues persist after following all steps, check:
- Azure AD tenant configuration with Sky UK IT
- Amplify deployment logs in AWS Console
