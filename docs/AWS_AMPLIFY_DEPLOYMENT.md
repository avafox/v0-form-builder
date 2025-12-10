# AWS Amplify Deployment Guide

Complete step-by-step guide to deploy the GPE Communications Form Builder to AWS Amplify with AWS SES email integration.

---

## Prerequisites

Before starting, ensure you have:

- AWS Account with admin access
- GitHub account (or repository hosting)
- Verified email address in AWS SES: `ava.foxwell@sky.uk`
- Azure AD application credentials for authentication
- Code repository pushed to GitHub

---

## Architecture Overview

\`\`\`
User Browser
    ↓
AWS Amplify (Next.js App)
    ↓
Azure AD (Authentication)
    ↓
AWS SES (Email Sending)
    ↓
Recipients
\`\`\`

**Services Used:**
- AWS Amplify: Host Next.js application
- AWS SES: Send emails
- Azure AD: User authentication
- AWS IAM: Access management

---

## Part 1: AWS SES Setup

### Step 1: Verify Email Address

1. Sign in to AWS Console: https://console.aws.amazon.com
2. Navigate to SES (Simple Email Service)
3. Select your region: **eu-west-2 (London)**
4. Go to: **Verified identities**
5. Click: **Create identity**
6. Select: **Email address**
7. Enter: `ava.foxwell@sky.uk`
8. Click: **Create identity**
9. Check email inbox for verification email
10. Click verification link in email
11. Wait for status to show: **Verified**

**Verification Status:**
\`\`\`
✓ ava.foxwell@sky.uk is already verified
\`\`\`

---

### Step 2: Request Production Access

By default, SES starts in **Sandbox Mode** with limitations:
- Can only send to verified email addresses
- 200 emails per day limit
- 1 email per second

**Request Production Access:**

1. In SES Console, click: **Account dashboard**
2. Click: **Request production access**
3. Fill in the form:
   - **Mail type**: Transactional
   - **Website URL**: Your Amplify URL (or temporary URL)
   - **Use case description**:
     \`\`\`
     Internal communications tool for GPE team to send formatted 
     email communications to team members. Transactional emails only,
     no marketing. Recipients are Sky employees with opt-in.
     \`\`\`
   - **Contact preference**: Choose your preference
   - **Acknowledge**: Check compliance boxes
4. Click: **Submit request**
5. Wait for approval (usually 24 hours)

**Status Check:**
\`\`\`
Go to: SES Console → Account dashboard
Look for: Account status: Production
\`\`\`

---

### Step 3: Create IAM User for SES

Create a dedicated IAM user for your app to send emails:

1. Go to: **IAM Console** → https://console.aws.amazon.com/iam/
2. Click: **Users** → **Create user**
3. User name: `gpe-communications-ses`
4. Click: **Next**
5. Select: **Attach policies directly**
6. Search for: `AmazonSESFullAccess`
7. Check the box next to it
8. Click: **Next**
9. Click: **Create user**

---

### Step 4: Generate Access Keys

1. In IAM Users list, click: `gpe-communications-ses`
2. Click: **Security credentials** tab
3. Scroll to: **Access keys**
4. Click: **Create access key**
5. Select: **Application running outside AWS**
6. Check: **I understand the recommendation**
7. Click: **Next**
8. Description: `GPE Communications Amplify App`
9. Click: **Create access key**

**IMPORTANT: Save these credentials immediately**

\`\`\`
Access Key ID: AKIA...
Secret Access Key: ...
\`\`\`

Copy these to a secure location. You'll need them for Amplify environment variables.

---

### Step 5: Test SES Configuration

Test that your SES setup works:

1. Go to: **SES Console** → **Verified identities**
2. Click: `ava.foxwell@sky.uk`
3. Click: **Send test email** button
4. Fill in:
   - **From address**: ava.foxwell@sky.uk
   - **To address**: Your email for testing
   - **Subject**: Test Email
   - **Body**: Testing SES configuration
5. Click: **Send test email**
6. Check inbox for email delivery

---

## Part 2: AWS Amplify Setup

### Step 1: Create New Amplify App

1. Go to: **AWS Amplify Console** → https://console.aws.amazon.com/amplify/
2. Click: **New app** → **Host web app**
3. Select: **GitHub** (or your repository provider)
4. Click: **Continue**
5. Authorize AWS Amplify to access your GitHub account
6. Select repository: Your form builder repo
7. Select branch: `main` (or your deployment branch)
8. Click: **Next**

---

### Step 2: Configure Build Settings

1. App name: `gpe-communications-form-builder`
2. Environment: `production`
3. Build settings should auto-detect (`amplify.yml`)
4. Verify build settings show:

\`\`\`yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install --legacy-peer-deps
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
\`\`\`

5. Click: **Advanced settings**
6. Add environment variables (see Step 3)
7. Click: **Next**
8. Review settings
9. Click: **Save and deploy**

---

### Step 3: Add Environment Variables

In Amplify Console, add these environment variables:

**AWS SES Configuration:**

\`\`\`bash
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=AKIA... (from Step 4 above)
AWS_SECRET_ACCESS_KEY=... (from Step 4 above)
AWS_SES_FROM_EMAIL=ava.foxwell@sky.uk
AWS_SES_FROM_NAME=GPE Communications Team
\`\`\`

**Azure AD Configuration:**

\`\`\`bash
MICROSOFT_CLIENT_ID=your-azure-app-client-id
MICROSOFT_TENANT_ID=your-azure-tenant-id
MICROSOFT_CLIENT_SECRET=your-azure-app-client-secret
\`\`\`

**Database Configuration (from your existing setup):**

\`\`\`bash
POSTGRES_URL=your-postgres-url
POSTGRES_PRISMA_URL=your-postgres-prisma-url
SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
\`\`\`

**Other Configuration:**

\`\`\`bash
NEXTAUTH_URL=https://your-amplify-app.amplifyapp.com
NEXTAUTH_SECRET=your-generated-secret
\`\`\`

**To add environment variables:**

1. In Amplify Console, select your app
2. Click: **Environment variables** in left sidebar
3. Click: **Manage variables**
4. Click: **Add variable** for each variable above
5. Enter: Key and Value
6. Click: **Save**

---

### Step 4: Generate NextAuth Secret

Generate a secure secret for NextAuth:

\`\`\`bash
# On your local machine, run:
openssl rand -base64 32
\`\`\`

Copy the output and use it as `NEXTAUTH_SECRET` value.

---

### Step 5: Update Azure AD Redirect URL

1. Go to: **Azure Portal** → **Azure Active Directory**
2. Navigate to: **App registrations**
3. Select: Your GPE Communications app
4. Click: **Authentication** in left sidebar
5. Under **Web** → **Redirect URIs**, add:
   \`\`\`
   https://your-app-name.amplifyapp.com/api/auth/callback/azure-ad
   \`\`\`
6. Replace `your-app-name` with actual Amplify domain
7. Click: **Save**

**Example:**
\`\`\`
https://main.d1234567890abc.amplifyapp.com/api/auth/callback/azure-ad
\`\`\`

---

### Step 6: Monitor Deployment

1. Go to: Amplify Console → Your app
2. You'll see deployment progress:
   - **Provision**: Setting up build environment
   - **Build**: Running npm install and npm build
   - **Deploy**: Deploying to CDN
   - **Verify**: Health checks

3. Wait for status: **Deployed**
4. Note your app URL: `https://main.d1234567890abc.amplifyapp.com`

---

### Step 7: Test the Deployment

1. Visit your Amplify URL
2. You should see the login page
3. Click: **Sign in with Azure AD**
4. Log in with your Sky credentials
5. You should be redirected to the app dashboard
6. Navigate to: **Communications** page
7. Create a test communication
8. Click: **Send via AWS SES**
9. Fill in recipient email
10. Click: **Send**
11. Check recipient inbox

---

## Part 3: Verification Checklist

Go through this checklist to ensure everything works:

### AWS SES Verification

- [ ] Email address verified in SES
- [ ] Production access approved (or in sandbox with verified test emails)
- [ ] IAM user created with SES permissions
- [ ] Access keys generated and saved
- [ ] Test email sent successfully from SES console

### Amplify Deployment

- [ ] App deployed successfully
- [ ] No build errors in logs
- [ ] App accessible via Amplify URL
- [ ] Environment variables configured correctly
- [ ] All required variables present

### Authentication

- [ ] Azure AD redirect URL updated
- [ ] User can sign in with Azure AD
- [ ] User redirected to app after login
- [ ] User menu shows correct user info
- [ ] Logout works correctly

### Email Sending

- [ ] Communications page loads
- [ ] Form preview renders correctly
- [ ] Email dialog opens
- [ ] Email sends successfully
- [ ] Email received in inbox
- [ ] Email formatting correct
- [ ] No errors in browser console

### Database

- [ ] Supabase connection working
- [ ] User data saves correctly
- [ ] Communications save to database
- [ ] No database connection errors

---

## Part 4: Troubleshooting

### Issue: Build Fails in Amplify

**Error:** `npm install` fails

**Solution:**
1. Check `amplify.yml` uses `--legacy-peer-deps` flag
2. Verify Node version (should be 18+)
3. Check build logs for specific error
4. Update `amplify.yml` if needed:

\`\`\`yaml
preBuild:
  commands:
    - npm ci --legacy-peer-deps
\`\`\`

---

### Issue: Email Not Sending

**Error:** "Email sending failed"

**Check:**
1. Verify AWS credentials in environment variables
2. Check SES is in production mode (or recipient is verified in sandbox)
3. Verify IAM user has SES permissions
4. Check AWS region matches (eu-west-2)
5. Review Amplify logs for detailed error

**Debug Steps:**
\`\`\`bash
# Check environment variables in Amplify Console
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SES_FROM_EMAIL=ava.foxwell@sky.uk

# Check browser console for errors
# Check Amplify logs for API errors
\`\`\`

---

### Issue: Authentication Fails

**Error:** "Unable to sign in"

**Check:**
1. Azure AD redirect URL matches Amplify domain
2. `NEXTAUTH_URL` environment variable correct
3. `NEXTAUTH_SECRET` is set
4. Azure AD credentials correct
5. User has access to Azure AD app

**Redirect URL Format:**
\`\`\`
https://[amplify-domain]/api/auth/callback/azure-ad
\`\`\`

---

### Issue: App Crashes After Login

**Error:** 500 Internal Server Error

**Check:**
1. Database environment variables correct
2. Supabase URL accessible from Amplify
3. Check Amplify function logs
4. Verify all required environment variables present

---

### Issue: SES Sandbox Limitations

**Error:** "Email address is not verified"

**Solution:**
1. If in SES Sandbox mode, you can only send to verified emails
2. Either verify recipient email addresses in SES
3. Or request production access (recommended)

**To verify additional emails in sandbox:**
1. SES Console → Verified identities
2. Create identity → Email address
3. Enter recipient email
4. Recipient verifies via email link

---

## Part 5: Post-Deployment

### Set Up Custom Domain (Optional)

1. In Amplify Console, select your app
2. Click: **Domain management**
3. Click: **Add domain**
4. Enter: Your custom domain
5. Follow DNS configuration steps
6. Update Azure AD redirect URL with custom domain

---

### Enable Auto-Deploy

1. In Amplify Console, select your app
2. Click: **Build settings**
3. Ensure auto-deploy is enabled for your branch
4. Every push to GitHub will trigger automatic deployment

---

### Set Up Monitoring

1. In Amplify Console, select your app
2. Click: **Monitoring**
3. View metrics:
   - Requests
   - Errors
   - Latency
4. Set up alarms if needed

---

### Enable Branch Previews

1. In Amplify Console, select your app
2. Click: **Previews**
3. Click: **Enable previews**
4. Select branches for preview deployments
5. Each PR will get a preview URL

---

## Part 6: Security Best Practices

### Rotate Access Keys

Rotate IAM access keys every 90 days:

1. Create new access key
2. Update Amplify environment variables
3. Test deployment
4. Delete old access key

---

### Monitor SES Usage

1. SES Console → Account dashboard
2. Monitor:
   - Emails sent
   - Bounce rate
   - Complaint rate
3. Set up CloudWatch alarms for high bounce/complaint rates

---

### Enable CloudWatch Logging

1. Amplify Console → Your app → Monitoring
2. Enable CloudWatch logs
3. Review logs regularly for errors

---

### Secure Environment Variables

- Never commit credentials to Git
- Use Amplify's environment variable encryption
- Restrict IAM user to minimum required permissions
- Rotate secrets regularly

---

## Part 7: Cost Estimation

**AWS Amplify:**
- Build minutes: First 1,000 minutes free, then $0.01/minute
- Hosting: First 15 GB served free, then $0.15/GB
- Estimate: $0-20/month for typical usage

**AWS SES:**
- First 3,000 emails free (if using EC2/Amplify)
- Then $0.10 per 1,000 emails
- Estimate: $0-5/month for typical usage

**Total estimated cost: $0-25/month**

---

## Summary

You've successfully deployed your GPE Communications Form Builder to AWS!

**What you've set up:**
- AWS SES for email sending
- AWS Amplify for app hosting
- Azure AD for authentication
- Automated deployments from GitHub

**Next steps:**
- Test all functionality
- Invite team members
- Monitor usage and costs
- Set up custom domain (optional)
- Configure additional email templates

**Support:**
- AWS Support: https://console.aws.amazon.com/support/
- Amplify Docs: https://docs.amplify.aws/
- SES Docs: https://docs.aws.amazon.com/ses/

---

**Your app is now live and ready to use!**
