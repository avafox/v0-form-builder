# NextAuth Environment Variable Troubleshooting

## Current Issue
`NEXTAUTH_SECRET` and `NEXTAUTH_URL` are not being loaded in AWS Amplify runtime, even though they're set in the Amplify Console.

## Diagnostic Steps

### 1. Check ALL Environment Variables
Visit: `https://main.d2baofxalff7ki.amplifyapp.com/api/debug/all-env`

This will show you EXACTLY which environment variables are available in the Lambda runtime.

### 2. Verify Amplify Console Variable Names

Go to AWS Amplify Console → Your App → Environment variables

**Check for these common issues:**
- Typos in variable names (e.g., `NEXTAUTH_SECRE` instead of `NEXTAUTH_SECRET`)
- Extra spaces before/after the variable name
- Wrong branch selection (variables might be set for "All branches" vs specific branch)
- Quotes around the value (Amplify doesn't need quotes in the UI)

### 3. Common Solutions

#### Solution A: Variable Name Mismatch
If `/api/debug/all-env` shows variables like `NEXT_AUTH_SECRET` instead of `NEXTAUTH_SECRET`:
- You need to rename them in Amplify Console to match exactly

#### Solution B: Branch Mismatch  
- Make sure variables are set for "All branches" or specifically for your deployed branch
- Check if you're deploying from `main` branch and variables are set for `main`

#### Solution C: Rebuild Required
After setting/changing environment variables in Amplify:
1. Go to Amplify Console → Your App
2. Click "Redeploy this version" or trigger a new build
3. Wait for build to complete (usually 2-3 minutes)
4. Check `/api/debug/all-env` again

### 4. Expected Output

When working correctly, `/api/debug/all-env` should show:
```json
{
  "NEXTAUTH_SECRET": { "exists": true, "length": 44 },
  "NEXTAUTH_URL": { "exists": true, "length": 45 },
  "MICROSOFT_CLIENT_ID": { "exists": true, "length": 36 },
  "MICROSOFT_CLIENT_SECRET": { "exists": true, "length": 40 },
  "MICROSOFT_TENANT_ID": { "exists": true, "length": 36 }
}
```

### 5. If Variables Still Don't Load

The issue might be that Amplify Gen 2 apps handle environment variables differently. Try:

1. Delete `NEXTAUTH_SECRET` and `NEXTAUTH_URL` from Amplify Console
2. Re-add them with exact names (copy from below):
   - Variable name: `NEXTAUTH_SECRET`
   - Variable name: `NEXTAUTH_URL`
3. Make sure "All branches" is selected
4. Trigger a new build

## Testing After Fix

1. Visit `/api/debug/all-env` - should show both variables
2. Visit `/auth/signin` - configuration status should show all `true`
3. Click "Sign in with Microsoft" - should redirect to Azure AD
4. Complete MFA - should redirect back and sign you in

## Need Help?

If none of these solutions work, there might be an issue with how Amplify Gen 2 handles Next.js 15 environment variables. Consider:
- Using Amplify secrets manager instead of environment variables
- Hardcoding values temporarily to test auth flow
- Contacting AWS Amplify support
