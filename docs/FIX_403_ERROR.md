# Fixing 403 Error on AWS Amplify

## Common Causes and Solutions

### Issue 1: Incorrect Build Output Directory

**Problem:** Amplify can't find the built files because the output directory is wrong.

**Solution:** Update `amplify.yml` to use the correct Next.js output structure.

\`\`\`yaml
artifacts:
  baseDirectory: .next
  files:
    - '**/*'
\`\`\`

For Next.js 13+ with App Router, this should work. However, if you're still getting 403, try:

\`\`\`yaml
artifacts:
  baseDirectory: .next/standalone
  files:
    - '**/*'
\`\`\`

---

### Issue 2: Missing Environment Variables

**Problem:** App fails to build or start because required environment variables are missing.

**Required Environment Variables in Amplify:**

\`\`\`bash
# AWS SES (Required for email sending)
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SES_FROM_EMAIL=ava.foxwell@sky.uk
AWS_SES_FROM_NAME=GPE Communications Team

# Azure AD (Required for authentication)
MICROSOFT_CLIENT_ID=...
MICROSOFT_TENANT_ID=...
MICROSOFT_CLIENT_SECRET=...

# Supabase (Required for database)
SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Database (If using PostgreSQL directly)
POSTGRES_URL=...
\`\`\`

**How to Add:**
1. Go to Amplify Console
2. Select your app
3. Environment variables (left menu)
4. Add each variable
5. Redeploy

---

### Issue 3: Build Failures

**Problem:** Build fails silently and Amplify serves a 403 error page.

**Check Build Logs:**
1. Go to Amplify Console
2. Click on your app
3. Click latest deployment
4. Check "Build" phase logs
5. Look for errors

**Common Build Errors:**

**Error: "Cannot find module '@aws-sdk/client-ses'"**
\`\`\`bash
# Solution: Ensure package-lock.json is committed
git add package-lock.json
git commit -m "Add package-lock.json"
git push
\`\`\`

**Error: "npm ci requires package-lock.json"**
\`\`\`bash
# Solution: Update amplify.yml to generate it
# (Already included in your amplify.yml)
\`\`\`

---

### Issue 4: Node.js Version Mismatch

**Problem:** Amplify uses wrong Node.js version.

**Solution:** Specify Node.js version in `amplify.yml`:

\`\`\`yaml
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 18
        - node --version
        - npm --version
\`\`\`

Or add `.nvmrc` file:

\`\`\`
18.17.0
\`\`\`

---

### Issue 5: Static Export Issues

**Problem:** Some Next.js features don't work with static export.

**Your app uses:**
- API Routes (`/api/send-email`)
- Server-side rendering
- Dynamic routes

**These require Node.js runtime.**

**Solution:** Use `output: 'standalone'` instead of `output: 'export'`:

\`\`\`javascript
// next.config.mjs
const nextConfig = {
  output: 'standalone', // NOT 'export'
}
\`\`\`

---

### Issue 6: Middleware or Auth Blocking

**Problem:** Middleware is blocking all requests.

**Check your `middleware.ts`:**

\`\`\`typescript
export async function middleware(request: NextRequest) {
  // Make sure this isn't blocking everything
  console.log('[v0] Middleware running for:', request.url)
  return NextResponse.next() // Allow request
}
\`\`\`

---

## Step-by-Step Debugging

### Step 1: Check Build Logs

1. Go to Amplify Console → Your App → Latest Build
2. Look at each phase:
   - Provision
   - Build
   - Deploy
3. Expand logs and look for red errors

### Step 2: Check Environment Variables

1. Amplify Console → Environment variables
2. Verify ALL required variables are set
3. No typos in variable names
4. No trailing spaces in values

### Step 3: Test Locally First

\`\`\`bash
# Build locally to catch errors
npm run build

# Test production build
npm start

# Visit http://localhost:3000
\`\`\`

If it works locally but fails on Amplify, it's likely:
- Environment variable issue
- Node.js version mismatch
- Build output configuration issue

### Step 4: Simplify Next.js Config

Try minimal config:

\`\`\`javascript
// next.config.mjs
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
\`\`\`

### Step 5: Check Amplify App Settings

1. Amplify Console → App settings → Build settings
2. Verify `amplify.yml` is being used
3. Check Build image: Should be "Amazon Linux 2023"
4. Node.js version: Should be 18.x or higher

---

## Quick Fix Checklist

- [ ] All environment variables added in Amplify
- [ ] package-lock.json committed to repo
- [ ] next.config.mjs has output: 'standalone'
- [ ] amplify.yml uses correct baseDirectory
- [ ] Build logs show no errors
- [ ] Node.js version is 18+
- [ ] No missing image files referenced in code
- [ ] API routes have proper runtime config

---

## Still Getting 403?

### Enable Detailed Logging

Add to `next.config.mjs`:

\`\`\`javascript
const nextConfig = {
  logging: {
    level: 'verbose',
  },
}
\`\`\`

### Contact Support

If none of these work:
1. Amplify Console → Help → Contact Support
2. Provide:
   - App ID
   - Build ID
   - Full build logs
   - List of environment variables (no values)

---

## Success Indicators

Once fixed, you should see:
1. Build completes successfully (green checkmark)
2. Deploy phase succeeds
3. Visiting your Amplify URL shows the homepage
4. No 403 errors in browser console
5. Can navigate to /communications page

---

## Next Steps After 403 is Fixed

1. Test email sending functionality
2. Test Azure AD authentication
3. Verify environment variables are working
4. Check AWS SES is sending emails
5. Monitor Amplify logs for any runtime errors
