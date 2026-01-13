# Azure AD MFA Troubleshooting Guide

## Step 1: Check Environment Variables in Amplify

Visit this URL on your deployed Amplify app:
```
https://main.d2baofxalff7ki.amplifyapp.com/api/debug/azure-check
```

This will show you exactly which environment variables are loaded at runtime.

**Expected output:**
```json
{
  "envVars": {
    "NEXTAUTH_SECRET": true,
    "NEXTAUTH_URL": "https://main.d2baofxalff7ki.amplifyapp.com",
    "MICROSOFT_CLIENT_ID": true,
    "MICROSOFT_CLIENT_SECRET": true,
    "MICROSOFT_TENANT_ID": true
  },
  "canAuthenticate": true
}
```

## Step 2: Verify Amplify Environment Variables

In AWS Amplify Console → App Settings → Environment Variables, ensure:

| Variable Name | Value | Applied To |
|--------------|-------|------------|
| `MICROSOFT_CLIENT_ID` | `6a4e7950-9c5d-4ee7-b644-8d1f86235d8d` | All branches |
| `MICROSOFT_CLIENT_SECRET` | `bqm8Q~j2ujv...` | All branches |
| `MICROSOFT_TENANT_ID` | `2fdb7e27-9b62-44f7-a0fe-9836eaa1f161` | All branches |
| `NEXTAUTH_SECRET` | `nu/zSvG++aGcp6d55JT/sAo4FPY4oLUKvkKHRxNWVPo=` | All branches |
| `NEXTAUTH_URL` | `https://main.d2baofxalff7ki.amplifyapp.com` | All branches |

**Important:** After updating environment variables, you MUST redeploy the app.

## Step 3: Verify Azure AD App Registration

In Azure Portal → Microsoft Entra ID → App Registrations:

### Redirect URIs
Under **Authentication**, ensure this exact URI is added:
```
https://main.d2baofxalff7ki.amplifyapp.com/api/auth/callback/azure-ad
```

### API Permissions
Verify these permissions are granted:
- ✅ Microsoft Graph → User.Read (Delegated)
- ✅ Microsoft Graph → openid (Delegated)
- ✅ Microsoft Graph → profile (Delegated)
- ✅ Microsoft Graph → email (Delegated)

### Admin Consent
Check if "Grant admin consent" shows green checkmarks for all permissions.

## Step 4: Test Authentication Flow

1. Visit: `https://main.d2baofxalff7ki.amplifyapp.com/auth/signin`
2. Click "Sign in with Microsoft"
3. You should be redirected to Microsoft login
4. Enter your @sky.uk or @3dflyingmonsters.co.uk email
5. Complete MFA if prompted
6. You should be redirected back to the app

## Common Issues & Solutions

### Issue: "Configuration Error"
**Cause:** NextAuth can't find environment variables at runtime
**Solution:** 
- Check `/api/debug/azure-check` to see which variables are missing
- Ensure variables are set in Amplify Console (not just in amplify.yml)
- Redeploy after setting variables

### Issue: "Access Denied"
**Cause:** Email domain not allowed
**Solution:**
- Check `lib/access-control.ts` - should allow both @sky.uk and @3dflyingmonsters.co.uk
- Verify the email returned from Azure matches one of these domains

### Issue: "AADSTS90097: Admin consent required"
**Cause:** Sky UK tenant requires admin approval
**Solution:**
- Ask Azure AD admin to grant consent in Azure Portal
- Or configure tenant to allow user consent for this app

### Issue: Redirect to wrong URL
**Cause:** `NEXTAUTH_URL` is incorrect
**Solution:**
- Ensure `NEXTAUTH_URL` matches your Amplify domain exactly
- No trailing slash
- Must be HTTPS in production

### Issue: "Invalid client secret"
**Cause:** Client secret expired or incorrect
**Solution:**
- In Azure Portal, generate a new client secret
- Update `MICROSOFT_CLIENT_SECRET` in Amplify
- Redeploy

## Step 5: Check Amplify Build Logs

If the diagnostic endpoint returns missing variables:

1. Go to Amplify Console → App → Deployments
2. Click on latest deployment
3. View build logs
4. Search for environment variable export statements
5. Verify they're being set during build

## Step 6: Manual Test in Browser DevTools

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to sign in
4. Look for `[v0]` log messages showing authentication flow
5. Check Network tab for failed API calls to `/api/auth/*`

## Need More Help?

Share the output from `/api/debug/azure-check` and any error messages from browser console.
