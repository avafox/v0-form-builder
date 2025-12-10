# AWS Amplify SSR Setup Guide

## Issue: 403 Error After Successful Deployment

If your app shows "deployed successfully" in Amplify but returns a 403 CloudFront error, this means Amplify's SSR hosting is not properly configured.

## Root Cause

Your app uses:
- API Routes (`/api/send-email`) with Node.js runtime for AWS SES
- Server-side authentication with NextAuth
- Dynamic server components

These features require **Server-Side Rendering (SSR)**, not static export.

## Solution: Enable Amplify Hosting Compute

AWS Amplify has two hosting modes:

### 1. Static Hosting (Default)
- Only serves static HTML/CSS/JS files
- Does NOT support API routes or SSR
- Results in 403 errors for dynamic routes

### 2. SSR Hosting with Amplify Compute (Required)
- Supports Next.js API routes
- Enables server-side rendering
- Handles dynamic content

## How to Enable SSR in Amplify

### Step 1: Check Amplify Gen 2 vs Gen 1

\`\`\`
1. Go to AWS Amplify Console
2. Click on your app
3. Look for "Gen 2" badge or check deployment method
\`\`\`

### Step 2: Enable SSR (Amplify Gen 2)

If using Gen 2:

\`\`\`
1. Amplify Console → Your app
2. Click "Hosting" in left sidebar
3. Look for "Compute settings"
4. Enable "Server-side rendering (SSR)"
5. Select compute size (Small - 0.25 vCPU should be sufficient)
6. Save and redeploy
\`\`\`

### Step 3: Verify Build Settings

Your `amplify.yml` should use standard Next.js output:

\`\`\`yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
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

**Important:** Do NOT use `output: 'export'` or `output: 'standalone'` in `next.config.mjs`

### Step 4: Add Environment Variables

Make sure all required variables are set:

\`\`\`bash
# Email
SES_REGION=eu-west-2
SES_ACCESS_KEY_ID=your-key
SES_SECRET_ACCESS_KEY=your-secret
SES_FROM_EMAIL=cti-gpe-communications@sky.uk
SES_FROM_NAME=GPE Communications Team

# Auth
MICROSOFT_CLIENT_ID=your-id
MICROSOFT_TENANT_ID=your-tenant
MICROSOFT_CLIENT_SECRET=your-secret
NEXTAUTH_URL=https://main.d2mp4ewdy6n5ed.amplify app.com
NEXTAUTH_SECRET=your-generated-secret
\`\`\`

## Alternative: Deploy to Vercel

If Amplify SSR is not available or causing issues, Vercel has first-class Next.js support:

\`\`\`
1. Go to vercel.com
2. Import your Git repository
3. Vercel auto-detects Next.js and configures SSR
4. Add environment variables (use AWS_ prefix, it works on Vercel)
5. Deploy
\`\`\`

Vercel is built by the Next.js team and has zero-config SSR support.

## Troubleshooting

### Still Getting 403?

**Check 1: Is SSR enabled?**
- Amplify Console → Hosting → Check "SSR" is enabled

**Check 2: Build completed successfully?**
- Amplify Console → Deployments → Latest → All phases green?

**Check 3: Environment variables set?**
- Amplify Console → Environment variables → Count should be 10+

**Check 4: Node.js version?**
- Amplify should use Node.js 18+ (check build logs)

### Build Succeeds but App 404s?

This means Amplify is in static mode. Enable SSR/Compute.

### API Routes Return 404?

This confirms static hosting is being used. You need SSR enabled.

## Summary

**Problem:** 403 error despite successful deployment
**Cause:** Amplify serving static files only, API routes don't work
**Solution:** Enable SSR/Amplify Compute in hosting settings
**Alternative:** Deploy to Vercel for automatic SSR support
