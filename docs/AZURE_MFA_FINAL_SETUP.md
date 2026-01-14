# Azure AD MFA - Final Setup Guide

## What Changed

The environment variables weren't loading at runtime in AWS Amplify Lambda functions. The solution is to inject environment variables at **build time** by generating a `lib/runtime-config.ts` file that gets bundled into the application.

## How It Works

1. **During Build** (amplify.yml):
   - Amplify reads environment variables from the Console
   - Generates `lib/runtime-config.ts` with values baked in
   - This file gets bundled into your Next.js build

2. **At Runtime**:
   - `auth-options.ts` imports `runtimeConfig` instead of reading `process.env`
   - Environment variables are available because they're in the bundled code

## Verification Steps

After deployment, visit: `https://your-amplify-url.amplifyapp.com/api/debug/azure-check`

You should see:
```json
{
  "runtimeConfigVars": {
    "NEXTAUTH_SECRET": true,
    "MICROSOFT_CLIENT_ID": true,
    "MICROSOFT_CLIENT_SECRET": true,
    "MICROSOFT_TENANT_ID": true
  },
  "canAuthenticateViaRuntimeConfig": true
}
```

## Testing Authentication

1. Visit: `https://your-amplify-url.amplifyapp.com/auth/signin`
2. Click "Sign in with Microsoft"
3. You should be redirected to Azure AD login
4. Complete MFA if prompted by your Azure AD policies
5. After successful authentication, you'll be redirected to `/communications`

## Troubleshooting

If authentication still fails:

1. **Check Amplify Build Logs**:
   - Look for "Generated runtime config:" output
   - Verify the file shows actual values, not empty strings

2. **Verify Azure AD App Registration**:
   - Redirect URI: `https://your-amplify-url.amplifyapp.com/api/auth/callback/azure-ad`
   - Admin consent granted (if required by tenant policy)

3. **Check Environment Variables in Amplify Console**:
   - Go to: App Settings → Environment variables
   - Ensure all variables are set for "All branches" or your specific branch
   - Variable names must match exactly (case-sensitive)

## Environment Variables Required

```
NEXTAUTH_SECRET=<your-generated-32-char-secret>
NEXTAUTH_URL=https://your-amplify-url.amplifyapp.com
MICROSOFT_CLIENT_ID=<your-azure-app-client-id>
MICROSOFT_CLIENT_SECRET=<your-azure-app-client-secret>
MICROSOFT_TENANT_ID=<your-azure-tenant-id>
```

## Authorized Domains

- @sky.uk (production users)
- @3dflyingmonsters.co.uk (test users)

## MFA Enforcement

MFA is enforced via `prompt: "login"` parameter in the Azure AD configuration, which forces re-authentication on every sign-in. Your Azure AD Conditional Access policies control the actual MFA requirements.
