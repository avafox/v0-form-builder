# Deployment Guide

## Prerequisites

1. AWS Account with:
   - Amplify app configured
   - SES verified sender email
   - IAM user with SES permissions

2. Azure AD app registration with:
   - Redirect URI configured
   - API permissions granted
   - Client secret generated

3. Supabase project with:
   - Tables created via `/scripts/*.sql`
   - RLS policies enabled

## Environment Variables

All variables must be set in **Amplify Console → Environment variables**:

### Authentication
\`\`\`
MICROSOFT_CLIENT_ID=<from Azure AD>
MICROSOFT_CLIENT_SECRET=<from Azure AD>
MICROSOFT_TENANT_ID=<from Azure AD>
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://main.<your-app>.amplifyapp.com
\`\`\`

### Email (AWS SES)
\`\`\`
SES_ACCESS_KEY_ID=<IAM user access key>
SES_SECRET_ACCESS_KEY=<IAM user secret>
SES_REGION=eu-west-2
SES_FROM_EMAIL=cti-gpe-communications@sky.uk
SES_FROM_NAME=GPE Communications Team
\`\`\`

### Database (Supabase)
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=<from Supabase dashboard>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard>
\`\`\`

### Cache (Upstash Redis)
\`\`\`
KV_URL=<from Upstash>
KV_REST_API_TOKEN=<from Upstash>
KV_REST_API_URL=<from Upstash>
\`\`\`

## Deployment Process

### Initial Setup

1. **Create Amplify App**
\`\`\`
1. AWS Console → Amplify
2. New app → Host web app
3. Connect Git repository
4. Build settings → Use amplify.yml from repo
5. Add all environment variables
6. Deploy
\`\`\`

2. **Configure Azure AD Redirect URI**
\`\`\`
Azure Portal → App registrations → Authentication
Add: https://main.<your-app>.amplifyapp.com/api/auth/callback/azure-ad
\`\`\`

3. **Verify SES Sender Email**
\`\`\`
AWS Console → SES → Verified identities
Verify: cti-gpe-communications@sky.uk
\`\`\`

### Regular Deployments

Amplify auto-deploys on Git push to main branch:

\`\`\`bash
git add .
git commit -m "Your changes"
git push origin main
\`\`\`

Monitor deployment:
\`\`\`
Amplify Console → Deployments → View logs
\`\`\`

### Manual Redeploy

If environment variables change:
\`\`\`
Amplify Console → Actions → Redeploy this version
\`\`\`

## Troubleshooting

### Email Not Sending
1. Check SES verified identities (sender + recipients if sandbox)
2. Verify environment variables in Amplify
3. Check Amplify logs: Monitoring → Logs
4. Check browser console for `[v0]` debug logs

### Login Not Working
1. Verify Azure AD redirect URI matches Amplify URL
2. Check NEXTAUTH_SECRET and NEXTAUTH_URL are set
3. Verify Microsoft client credentials are correct
4. Check Azure AD admin consent granted

### 403 CloudFront Errors
1. Check build succeeded in Amplify
2. Verify Node.js 20 is being used (in build logs)
3. Clear CloudFront cache: Actions → Invalidate cache
4. Check amplify.yml baseDirectory is `.next`

### Environment Variables Not Loading
1. Redeploy after changing variables
2. Check variable names match code exactly (case-sensitive)
3. No AWS_ prefix allowed (Amplify reserves it)
