# Deploy to AWS Amplify from Your Repository

Step-by-step guide to deploy your GPE Communications app from GitHub/GitLab/Bitbucket to AWS Amplify.

---

## Prerequisites

Before you begin, ensure you have:

- AWS Account with appropriate permissions
- Your code in a Git repository (GitHub, GitLab, or Bitbucket)
- AWS SES set up with verified email: `ava.foxwell@sky.uk`
- IAM user with SES permissions (Access Key ID and Secret Key)
- Azure AD app registration (Client ID, Tenant ID, Client Secret)
- Supabase project (if using database features)

---

## Part 1: Prepare Your Repository

### Step 1: Push Your Code to Git

If you haven't already, push your code to GitHub, GitLab, or Bitbucket.

**For GitHub:**

\`\`\`bash
# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/your-username/gpe-communications.git

# Add all files
git add .

# Commit
git commit -m "Initial commit - GPE Communications app"

# Push to main branch
git push -u origin main
\`\`\`

**For GitLab:**

\`\`\`bash
git remote add origin https://gitlab.com/your-username/gpe-communications.git
git push -u origin main
\`\`\`

**For Bitbucket:**

\`\`\`bash
git remote add origin https://bitbucket.org/your-username/gpe-communications.git
git push -u origin main
\`\`\`

### Step 2: Verify Repository Contents

Make sure these files are in your repository:

\`\`\`
✓ amplify.yml              (build configuration)
✓ package.json             (dependencies)
✓ package-lock.json        (locked versions - REQUIRED for security)
✓ next.config.mjs          (Next.js config)
✓ .npmrc                   (npm security settings)
✓ All source code files
\`\`\`

**Important:** Do NOT commit these files:

\`\`\`
✗ .env                     (contains secrets)
✗ .env.local               (local environment)
✗ node_modules/            (dependencies)
✗ .next/                   (build output)
\`\`\`

Add a `.gitignore` file if you don't have one:

\`\`\`bash
# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/

# Environment variables
.env
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.DS_Store
*.pem

# IDEs
.idea/
.vscode/
*.swp
*.swo
EOF

git add .gitignore
git commit -m "Add .gitignore"
git push
\`\`\`

---

## Part 2: Create AWS Amplify App

### Step 1: Access AWS Amplify Console

1. Sign in to AWS Console: https://console.aws.amazon.com
2. Search for "Amplify" in the services search bar
3. Click "AWS Amplify"
4. Click "Get Started" or "New app" → "Host web app"

### Step 2: Connect Your Repository

**2.1 Choose Repository Provider**

\`\`\`
Select your Git provider:
○ GitHub
○ GitLab
○ Bitbucket
○ AWS CodeCommit
\`\`\`

Click "Continue"

**2.2 Authorize Amplify**

For GitHub:
- Click "Authorize AWS Amplify"
- Sign in to GitHub
- Grant permissions to AWS Amplify
- You'll be redirected back to AWS

For GitLab/Bitbucket:
- Similar authorization flow
- Grant appropriate permissions

**2.3 Select Repository and Branch**

\`\`\`
Repository: Select "gpe-communications" (or your repo name)
Branch: Select "main" (or your default branch)
\`\`\`

Check the box: "Connecting a monorepo? Pick a folder."
- Leave blank (unless your app is in a subfolder)

Click "Next"

### Step 3: Configure Build Settings

**3.1 App Name**

\`\`\`
App name: gpe-communications
\`\`\`

**3.2 Build and Test Settings**

Amplify should auto-detect your `amplify.yml` file:

\`\`\`yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --legacy-peer-deps
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

If not detected, toggle "Edit" and paste the above configuration.

**3.3 Advanced Settings (Click "Advanced settings")**

\`\`\`
Node version: 18
Build timeout: 30 minutes (default is fine)
\`\`\`

Click "Next"

### Step 4: Review and Deploy

Review all settings:

\`\`\`
Repository: your-username/gpe-communications
Branch: main
Build command: npm run build
Framework: Next.js
\`\`\`

Click "Save and deploy"

**Initial Deployment Status:**

\`\`\`
Provision    ⏳ In progress...
Build        ⏸️ Pending
Deploy       ⏸️ Pending
\`\`\`

**Note:** The first build will FAIL because environment variables are not set yet. This is expected.

---

## Part 3: Configure Environment Variables

### Step 1: Access Environment Variables

While the build is running (or after it fails):

1. In Amplify Console, click your app name
2. Click "Hosting" → "Environment variables" in left sidebar
3. Click "Manage variables"

### Step 2: Add Environment Variables

Click "Add variable" for each of the following:

**AWS SES Configuration:**

\`\`\`
Variable: AWS_REGION
Value: eu-west-2
\`\`\`

\`\`\`
Variable: AWS_ACCESS_KEY_ID
Value: AKIA[your-access-key-id]
\`\`\`

\`\`\`
Variable: AWS_SECRET_ACCESS_KEY
Value: [your-secret-access-key]
\`\`\`

\`\`\`
Variable: AWS_SES_FROM_EMAIL
Value: ava.foxwell@sky.uk
\`\`\`

\`\`\`
Variable: AWS_SES_FROM_NAME
Value: GPE Communications Team
\`\`\`

**Azure AD Authentication:**

\`\`\`
Variable: MICROSOFT_CLIENT_ID
Value: [your-azure-client-id]
\`\`\`

\`\`\`
Variable: MICROSOFT_TENANT_ID
Value: [your-azure-tenant-id]
\`\`\`

\`\`\`
Variable: MICROSOFT_CLIENT_SECRET
Value: [your-azure-client-secret]
\`\`\`

\`\`\`
Variable: NEXTAUTH_URL
Value: https://main.d[app-id].amplifyapp.com
(You'll get this URL after first deployment - come back to set this)
\`\`\`

\`\`\`
Variable: NEXTAUTH_SECRET
Value: [generate-a-random-secret]
\`\`\`

To generate NEXTAUTH_SECRET:

\`\`\`bash
# On Mac/Linux
openssl rand -base64 32

# Or use this online: https://generate-secret.vercel.app/32
\`\`\`

**Supabase Configuration (if using database):**

\`\`\`
Variable: NEXT_PUBLIC_SUPABASE_URL
Value: [your-supabase-url]
\`\`\`

\`\`\`
Variable: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [your-supabase-anon-key]
\`\`\`

\`\`\`
Variable: SUPABASE_SERVICE_ROLE_KEY
Value: [your-supabase-service-role-key]
\`\`\`

**Redis/KV Configuration (if using):**

\`\`\`
Variable: KV_URL
Value: [your-kv-url]
\`\`\`

\`\`\`
Variable: KV_REST_API_TOKEN
Value: [your-kv-token]
\`\`\`

Click "Save" after adding all variables.

### Step 3: Redeploy

After adding environment variables:

1. Go to "Deployments" in the left sidebar
2. Find the failed deployment
3. Click the three dots menu
4. Click "Redeploy this version"

Or trigger a new deployment:

\`\`\`bash
# Push an empty commit to trigger rebuild
git commit --allow-empty -m "Trigger Amplify rebuild"
git push
\`\`\`

---

## Part 4: Configure Azure AD Redirect URIs

### Step 1: Get Amplify App URL

After successful deployment:

1. In Amplify Console, click your app
2. You'll see the URL: `https://main.d[app-id].amplifyapp.com`
3. Copy this URL

### Step 2: Update Azure AD App Registration

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to "Azure Active Directory"
3. Click "App registrations"
4. Find and click your GPE Communications app
5. Click "Authentication" in left sidebar

**Add Redirect URIs:**

Click "Add a platform" → "Web"

Add these redirect URIs:

\`\`\`
https://main.d[app-id].amplifyapp.com/api/auth/callback/azure-ad
https://main.d[app-id].amplifyapp.com/api/auth/callback/microsoft
\`\`\`

Replace `[app-id]` with your actual Amplify app ID.

Click "Save"

### Step 3: Update NEXTAUTH_URL

1. Go back to Amplify Console
2. Hosting → Environment variables
3. Update `NEXTAUTH_URL`:

\`\`\`
Variable: NEXTAUTH_URL
Value: https://main.d[app-id].amplifyapp.com
\`\`\`

Click "Save"

4. Redeploy the app (as in Part 3, Step 3)

---

## Part 5: Monitor Deployment

### Step 1: Watch Build Progress

In Amplify Console:

\`\`\`
Provision    ✓ Complete (30s)
Build        ⏳ In progress... (5-10 minutes)
Deploy       ⏸️ Pending
\`\`\`

Click "Build" to see live logs:

\`\`\`
# Installing dependencies
npm ci --legacy-peer-deps

# Building application
npm run build

# Compiling Next.js pages
✓ Compiled successfully
\`\`\`

**Common Build Errors:**

1. **Missing environment variables**
   - Solution: Add missing variables (Part 3)

2. **Dependency installation failed**
   - Solution: Ensure `package-lock.json` is committed
   - Run `npm ci` locally to verify

3. **Build timeout**
   - Solution: Increase timeout in Advanced settings

4. **TypeScript errors**
   - Solution: Fix TypeScript errors locally first
   - Run `npm run build` locally

### Step 2: Verify Deployment

Once deployment succeeds:

\`\`\`
Provision    ✓ Complete
Build        ✓ Complete (8m 23s)
Deploy       ✓ Complete (1m 12s)
\`\`\`

Click the app URL to open your deployed app.

---

## Part 6: Test Your Deployment

### Step 1: Test Authentication

1. Visit your Amplify app URL
2. You should see the login page
3. Click "Sign in with Azure AD"
4. Log in with your Sky credentials
5. Grant permissions if prompted
6. You should be redirected to the home page

**If authentication fails:**

- Check Azure AD redirect URIs (Part 4)
- Check `NEXTAUTH_URL` matches your Amplify URL
- Check `NEXTAUTH_SECRET` is set
- Check browser console for errors

### Step 2: Test Email Sending

1. Navigate to Communications page
2. Create a test communication
3. Click "Send via AWS SES"
4. Fill in:
   - From: ava.foxwell@sky.uk
   - To: your-test-email@sky.uk
   - Subject: Test from Amplify
5. Click "Send"

**Expected result:**

\`\`\`
✓ Email sent successfully
Check your inbox for the test email
\`\`\`

**If email fails:**

- Check AWS SES environment variables (Part 3)
- Verify AWS SES email is verified
- Check AWS IAM permissions
- Check CloudWatch logs (see Part 7)

### Step 3: Test App Features

Go through key features:

\`\`\`
✓ User authentication works
✓ Navigation works
✓ Communications page loads
✓ Email editor works
✓ Email preview works
✓ Email sending works
✓ Styles load correctly
✓ Images load correctly
\`\`\`

---

## Part 7: Configure Custom Domain (Optional)

### Step 1: Add Custom Domain

1. In Amplify Console, click "Domain management"
2. Click "Add domain"
3. Enter your domain: `gpe-communications.sky.uk`
4. Click "Configure domain"

### Step 2: Update DNS Records

Amplify will show DNS records to add:

\`\`\`
Type: CNAME
Name: gpe-communications
Value: [amplify-value].cloudfront.net
\`\`\`

Add this record in your Sky DNS management.

### Step 3: Wait for SSL Certificate

\`\`\`
Domain verification: ⏳ In progress (up to 48 hours)
SSL certificate: ⏸️ Pending
\`\`\`

Once complete:

\`\`\`
Domain verification: ✓ Complete
SSL certificate: ✓ Active
\`\`\`

Your app will be available at: `https://gpe-communications.sky.uk`

### Step 4: Update Azure AD and Environment Variables

Update redirect URIs and `NEXTAUTH_URL` to use custom domain.

---

## Part 8: Set Up Continuous Deployment

### Automatic Deployments

Amplify automatically deploys when you push to your connected branch:

\`\`\`bash
# Make changes locally
git add .
git commit -m "Update email template"
git push

# Amplify automatically detects the push and deploys
\`\`\`

### Branch Deployments

Deploy different branches for dev/staging/production:

1. In Amplify Console, click "Connect branch"
2. Select branch (e.g., `develop`)
3. Configure build settings
4. Each branch gets its own URL

Example:

\`\`\`
main branch:    https://main.d[app-id].amplifyapp.com
develop branch: https://develop.d[app-id].amplifyapp.com
\`\`\`

### Environment-Specific Variables

Set different variables per branch:

1. Go to "Environment variables"
2. Use branch-specific overrides
3. Example: Different AWS SES emails for test vs prod

---

## Part 9: Monitoring and Logs

### Access Logs

**Build Logs:**
1. Click "Deployments"
2. Click any deployment
3. Click "Build logs"

**Runtime Logs:**
1. Click "Monitoring"
2. View server-side logs
3. Set up CloudWatch integration for detailed logs

**Error Tracking:**
1. Click "Monitoring" → "Errors"
2. View runtime errors
3. Set up alerts

### CloudWatch Integration

Enable detailed logging:

1. Amplify Console → "Monitoring"
2. Click "Enable CloudWatch logs"
3. View logs in CloudWatch Console

Useful log groups:

\`\`\`
/aws/amplify/[app-id]/main/build
/aws/amplify/[app-id]/main/access
/aws/amplify/[app-id]/main/server
\`\`\`

---

## Part 10: Troubleshooting

### Build Fails

**Error: "npm ci failed"**

Solution:
\`\`\`bash
# Ensure package-lock.json is committed
git add package-lock.json
git commit -m "Add package-lock.json"
git push
\`\`\`

**Error: "Module not found"**

Solution:
- Check package.json has all dependencies
- Run `npm install [package-name]` locally
- Commit and push

**Error: "TypeScript errors"**

Solution:
\`\`\`bash
# Fix errors locally first
npm run build

# If it builds locally, it should build on Amplify
git add .
git commit -m "Fix TypeScript errors"
git push
\`\`\`

### Deployment Succeeds but App Doesn't Work

**Error: "404 Not Found"**

Solution:
- Check `baseDirectory` in amplify.yml is `.next`
- Ensure Next.js build completed successfully

**Error: "Environment variables not found"**

Solution:
- Check all variables are set in Amplify Console
- Click "Save" after adding variables
- Redeploy

**Error: "Authentication fails"**

Solution:
- Check Azure AD redirect URIs match Amplify URL
- Check `NEXTAUTH_URL` matches Amplify URL exactly
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

**Error: "Email sending fails"**

Solution:
- Check AWS SES environment variables
- Verify email address in SES Console
- Check IAM permissions
- Test with `scripts/test-aws-ses.tsx` locally

### Performance Issues

**Slow page loads:**

Solution:
- Enable Amplify CDN caching
- Optimize images
- Check bundle size: `npm run build` locally

**Build timeout:**

Solution:
- Increase timeout in Advanced settings
- Optimize dependencies
- Use build caching

---

## Quick Reference

### Environment Variables Checklist

Copy this checklist when setting up environment variables:

\`\`\`
AWS SES:
[ ] AWS_REGION
[ ] AWS_ACCESS_KEY_ID
[ ] AWS_SECRET_ACCESS_KEY
[ ] AWS_SES_FROM_EMAIL
[ ] AWS_SES_FROM_NAME

Azure AD:
[ ] MICROSOFT_CLIENT_ID
[ ] MICROSOFT_TENANT_ID
[ ] MICROSOFT_CLIENT_SECRET
[ ] NEXTAUTH_URL
[ ] NEXTAUTH_SECRET

Supabase (if used):
[ ] NEXT_PUBLIC_SUPABASE_URL
[ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
[ ] SUPABASE_SERVICE_ROLE_KEY

Redis/KV (if used):
[ ] KV_URL
[ ] KV_REST_API_TOKEN
\`\`\`

### Useful Commands

\`\`\`bash
# Trigger rebuild
git commit --allow-empty -m "Trigger rebuild"
git push

# Check local build
npm ci --legacy-peer-deps
npm run build

# Test email locally
npx tsx scripts/test-aws-ses.tsx

# Check environment variables
cat amplify.yml
\`\`\`

### Useful Links

\`\`\`
Amplify Console: https://console.aws.amazon.com/amplify
Azure Portal: https://portal.azure.com
AWS SES Console: https://console.aws.amazon.com/ses
CloudWatch Logs: https://console.aws.amazon.com/cloudwatch
\`\`\`

---

## Summary

You've successfully deployed your GPE Communications app to AWS Amplify:

1. Connected your Git repository to Amplify
2. Configured build settings with security requirements (npm ci)
3. Added all required environment variables
4. Configured Azure AD authentication
5. Set up AWS SES email sending
6. Tested the deployment
7. Configured monitoring and logs

**Your app is now live and automatically deploys on every push to your repository.**

**Next steps:**
- Set up custom domain (optional)
- Configure branch deployments for dev/staging
- Set up CloudWatch alerts
- Monitor email deliverability
- Train your team on using the app

---

**Need help? Check the troubleshooting section or AWS Amplify documentation.**
