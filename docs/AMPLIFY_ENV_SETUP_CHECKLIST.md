# AWS Amplify Environment Variables Setup Checklist

## Problem
Environment variables set in the Amplify Console were not being loaded at runtime in Lambda functions, causing NextAuth authentication to fail with a "Configuration" error.

## Solution
The amplify.yml now writes environment variables to `.env.production` during the build phase, which gets included in the deployment artifacts.

## Required Environment Variables in Amplify Console

Go to your Amplify app → **App settings** → **Environment variables** and ensure ALL of these are set:

### NextAuth Variables
1. **NEXTAUTH_SECRET** = `nu/zSvG++aGcp6d55JT/sAo4FPY4oLUKvkKHRxNWVPo=`
2. **NEXTAUTH_URL** = `https://main.d2baofxalff7ki.amplifyapp.com`

### Azure AD Variables
3. **MICROSOFT_CLIENT_ID** = `6a4e7950-9c5d-4ee7-b644-8d1f86235d8d`
4. **MICROSOFT_CLIENT_SECRET** = `bqm8Q~j2ujv1HdXAx61vqKNp64XUrLtI3I91gbPI`
5. **MICROSOFT_TENANT_ID** = `2fdb7e27-9b62-44f7-a0fe-9836eaa1f161`

### AWS SES Variables
6. **SES_ACCESS_KEY_ID** = `AKIAVUMJV46IQUPH2L5E`
7. **SES_SECRET_ACCESS_KEY** = `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`
8. **SES_REGION** = `eu-west-2`
9. **SES_FROM_EMAIL** = `cti-gpe-communications@sky.uk`
10. **SES_FROM_NAME** = `GPE Communications Team`

## Verification Steps

After deploying:

1. **Check environment variables are loaded:**
   - Visit: `https://main.d2baofxalff7ki.amplifyapp.com/api/debug/azure-check`
   - Should show `canAuthenticate: true`
   - All variables should show `true` instead of `false`

2. **Test authentication flow:**
   - Visit: `https://main.d2baofxalff7ki.amplifyapp.com/auth/signin`
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
https://main.d2baofxalff7ki.amplifyapp.com/api/auth/callback/azure-ad
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
