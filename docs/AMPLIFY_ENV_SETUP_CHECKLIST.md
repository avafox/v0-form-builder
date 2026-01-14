# AWS Amplify Environment Variables Setup Checklist

## Problem
Environment variables set in the Amplify Console were not being loaded at runtime in Lambda functions, causing NextAuth authentication to fail with a "Configuration" error.

## Solution
The amplify.yml now writes environment variables to `.env.production` during the build phase, which gets included in the deployment artifacts.

## Required Environment Variables in Amplify Console

Go to your Amplify app → **App settings** → **Environment variables** and ensure ALL of these are set:

### NextAuth Variables
1. **NEXTAUTH_SECRET** = `<your-generated-32-char-secret>`
2. **NEXTAUTH_URL** = `https://your-amplify-url.amplifyapp.com`

### Azure AD Variables
3. **MICROSOFT_CLIENT_ID** = `<your-azure-app-client-id>`
4. **MICROSOFT_CLIENT_SECRET** = `<your-azure-app-client-secret>`
5. **MICROSOFT_TENANT_ID** = `<your-azure-tenant-id>`

### AWS SES Variables
6. **SES_ACCESS_KEY_ID** = `<your-ses-access-key-id>`
7. **SES_SECRET_ACCESS_KEY** = `<your-ses-secret-access-key>`
8. **SES_REGION** = `eu-west-2`
9. **SES_FROM_EMAIL** = `your-email@yourdomain.com`
10. **SES_FROM_NAME** = `Your Team Name`

## Verification Steps

After deploying:

1. **Check environment variables are loaded:**
   - Visit: `https://your-amplify-url.amplifyapp.com/api/debug/azure-check`
   - Should show `canAuthenticate: true`
   - All variables should show `true` instead of `false`

2. **Test authentication flow:**
   - Visit: `https://your-amplify-url.amplifyapp.com/auth/signin`
   - Click "Sign in with Microsoft"
   - Should redirect to Microsoft login (not error page)
   - After MFA authentication, should redirect back to `/communications`

3. **Check Amplify build logs:**
   - Look for `.env.production` file being created during preBuild
   - Should see output from `cat .env.production` command
   - Verify all variables are present

## Common Issues

### Issue: Still showing `allEnvKeys: []`
**Solution:** The `.env.production` file needs to be included in artifacts. Check amplify.yml has:
```yaml
artifacts:
  files:
    - '**/*'
    - .env.production
```

### Issue: Variables show in build logs but not at runtime
**Solution:** Amplify's SSR deployments require `.env.production` to be in the artifacts AND at the root of the deployment, not in `.next/` directory.

### Issue: Configuration error on sign-in
**Solution:** 
1. Verify all 5 NextAuth/Azure variables are set in Amplify Console
2. Redeploy the app to regenerate `.env.production`
3. Check `/api/debug/azure-check` shows all variables as `true`

## Azure AD Redirect URI

Ensure your Azure AD App Registration has this redirect URI:
```
https://your-amplify-url.amplifyapp.com/api/auth/callback/azure-ad
```

## Admin Consent

If you get "AADSTS90097" error, your Azure AD admin needs to:
1. Go to Azure Portal → App Registrations → Your App
2. API Permissions → Grant admin consent for your organization

## Support

If issues persist after following all steps, check:
- Amplify build logs for errors during `.env.production` creation
- Browser console for NextAuth errors
- `/api/debug/azure-check` endpoint for missing variables
