# Get Your Amplify App Working - Quick Start Guide

Follow these steps in order to get your app live on AWS Amplify.

---

## Step 1: Verify Email in AWS SES (Required)

**This is the most important step!**

1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Select Region: **Europe (London) eu-west-2**
3. Click **"Verified identities"** in left sidebar
4. Click **"Create identity"**
5. Choose:
   - Identity type: **Email address**
   - Email address: **cti-gpe-communications@sky.uk**
6. Click **"Create identity"**
7. **Check the mailbox** for cti-gpe-communications@sky.uk
8. **Click the verification link** in the email
9. Go back to SES Console and verify status shows **"Verified"**

**Status Check:**
\`\`\`bash
aws ses get-identity-verification-attributes \
  --identities cti-gpe-communications@sky.uk \
  --region eu-west-2
\`\`\`

---

## Step 2: Add Environment Variables in Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app
3. Click **"Environment variables"** in left menu
4. Click **"Manage variables"**
5. Add these variables:

### Email Configuration (SES)

\`\`\`
SES_REGION=eu-west-2
SES_ACCESS_KEY_ID=[Your IAM Access Key ID]
SES_SECRET_ACCESS_KEY=[Your IAM Secret Access Key]
SES_FROM_EMAIL=cti-gpe-communications@sky.uk
SES_FROM_NAME=GPE Communications Team
EMAIL_METHOD=aws-ses
\`\`\`

### Azure AD Authentication

\`\`\`
MICROSOFT_CLIENT_ID=[Your Azure AD Client ID]
MICROSOFT_TENANT_ID=[Your Azure AD Tenant ID]
MICROSOFT_CLIENT_SECRET=[Your Azure AD Client Secret]
\`\`\`

### Supabase Database (if using)

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=[Your Supabase URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your Supabase Anon Key]
SUPABASE_SERVICE_ROLE_KEY=[Your Supabase Service Role Key]
\`\`\`

6. Click **"Save"**

---

## Step 3: Ensure Code is in Git Repository

1. Make sure all your code is committed:
\`\`\`bash
git add .
git commit -m "Configure for Amplify deployment"
git push origin main
\`\`\`

2. Files that must be present:
   - `amplify.yml` ✓
   - `package.json` ✓
   - `package-lock.json` ✓
   - All app files ✓

---

## Step 4: Trigger Deployment

### Option A: Automatic (if connected to Git)

1. Go to Amplify Console
2. Your app should automatically detect the push
3. Build will start automatically

### Option B: Manual Redeploy

1. Go to Amplify Console → Your App
2. Click **"Run build"** or **"Redeploy this version"**

---

## Step 5: Monitor Build

1. Go to Amplify Console → Your App → **"Build history"**
2. Click on the running build
3. Watch the logs for:

**Build phases:**
- ✓ Provision
- ✓ Build (this is where errors usually happen)
- ✓ Deploy
- ✓ Verify

**Common build errors:**

### Error: "npm ci requires package-lock.json"
**Fix:** Make sure `package-lock.json` is in your repo and committed

### Error: "Module not found"
**Fix:** Run `npm install` locally and commit package-lock.json

### Error: "Environment variable not found"
**Fix:** Check Step 2 - all variables must be added in Amplify Console

---

## Step 6: Test Your App

Once build completes:

1. Click on your Amplify URL (something like: `https://main.xxxxx.amplifyapp.com`)
2. You should see the login page
3. Log in with your Azure AD credentials
4. Go to `/communications` page
5. Fill in the form:
   - From: `cti-gpe-communications@sky.uk`
   - To: `your-test-email@sky.uk`
   - Subject: Test
6. Click **"Send via AWS SES"**
7. Check if email arrives

---

## Troubleshooting Common Issues

### Issue: 403 Forbidden Error

**Cause:** Build failed or environment variables missing

**Fix:**
1. Check build logs in Amplify Console
2. Verify all environment variables are set
3. Ensure SES email is verified

### Issue: Email Not Sending

**Cause:** SES email not verified or wrong credentials

**Fix:**
1. Verify `cti-gpe-communications@sky.uk` in SES
2. Check SES_ACCESS_KEY_ID and SES_SECRET_ACCESS_KEY are correct
3. Check CloudWatch logs in AWS

### Issue: "Cannot find module '@aws-sdk/client-ses'"

**Cause:** Dependencies not installed

**Fix:**
1. Delete `node_modules` locally
2. Run `npm install`
3. Commit `package-lock.json`
4. Push to Git

### Issue: Build Succeeds but App Doesn't Work

**Cause:** Environment variables not loaded

**Fix:**
1. Double-check all variables in Amplify Console
2. Make sure no typos in variable names
3. Redeploy after adding/changing variables

---

## Quick Checklist

Use this to verify everything is ready:

- [ ] Email `cti-gpe-communications@sky.uk` verified in AWS SES
- [ ] IAM user has SES send permissions
- [ ] All environment variables added to Amplify Console
- [ ] Code committed and pushed to Git
- [ ] Build completed successfully in Amplify
- [ ] Can access Amplify URL without 403 error
- [ ] Can log in with Azure AD
- [ ] Can send test email successfully

---

## Getting Your IAM Credentials

If you don't have IAM credentials yet:

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **"Users"** in left sidebar
3. Click **"Create user"**
4. Username: `gpe-communications-ses`
5. Click **"Next"**
6. Select **"Attach policies directly"**
7. Search and select: **"AmazonSESFullAccess"**
8. Click **"Next"** → **"Create user"**
9. Click on the user you just created
10. Click **"Security credentials"** tab
11. Click **"Create access key"**
12. Choose: **"Application running outside AWS"**
13. Click **"Create access key"**
14. **Copy and save:**
    - Access key ID
    - Secret access key
15. Use these for `SES_ACCESS_KEY_ID` and `SES_SECRET_ACCESS_KEY`

---

## Next Steps After It's Working

Once your app is live:

1. **Request SES Production Access** (if needed)
   - Go to SES Console → Account dashboard
   - Click "Request production access"
   - Fill out the form
   - Wait for approval (24 hours)

2. **Set up custom domain** (optional)
   - Amplify Console → Domain management
   - Add your custom domain

3. **Enable monitoring**
   - CloudWatch logs for errors
   - SES sending statistics
   - Amplify metrics

---

## Support

If you get stuck:

1. Check Amplify build logs
2. Check CloudWatch logs (Lambda/SES)
3. Review [TROUBLESHOOTING_AMPLIFY.md](./TROUBLESHOOTING_AMPLIFY.md)
4. Check [AMPLIFY_ENVIRONMENT_VARIABLES.md](./AMPLIFY_ENVIRONMENT_VARIABLES.md)

---

**Most Important:** Verify the email address in SES first! Nothing will work without this step.
