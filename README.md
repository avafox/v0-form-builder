# GPE Communications Tool

Internal communications management tool for the GPE team at Sky UK, built with Next.js and AWS SES.

## Overview

This app allows the GPE team to create, manage, and send professional email communications using AWS Simple Email Service (SES). It features Azure AD authentication for secure Sky UK SSO access and a rich text editor for composing emails.

## Features

- 📧 Email composition and sending via AWS SES
- 🎨 Rich text editor with formatting options
- 👥 Azure AD authentication (Sky UK SSO)
- 📱 Responsive design for desktop and mobile
- 🔒 Secure email delivery with AWS infrastructure
- ⚡ Server-side rendering with Next.js 15

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Authentication:** Azure AD (Microsoft Entra ID) via NextAuth
- **Email Service:** AWS SES (Custom fetch implementation)
- **Database:** Supabase (PostgreSQL with RLS)
- **Cache:** Upstash Redis
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Hosting:** AWS Amplify (SSR enabled, Node.js 20)

## Quick Start

### Prerequisites

- Node.js 20 or higher
- AWS Account with SES configured
- Azure AD app registration
- Supabase project

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd form-builder
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed variable descriptions.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Authentication

**Azure AD MFA is now working and enforced for all users.**

### Current Setup
- Azure AD authentication via NextAuth.js
- MFA enforced through `prompt: "login"` parameter
- Authorized domains: @sky.uk (production) and @3dflyingmonsters.co.uk (testing)
- Environment variables injected at build time via `lib/runtime-config.ts`

### How to Sign In
1. Visit `/auth/signin`
2. Click "Sign in with Microsoft"
3. Authenticate with your Microsoft account
4. Complete MFA if prompted by your Azure AD policies
5. Access the communications builder at `/communications`

**See [docs/AZURE_MFA_FINAL_SETUP.md](./docs/AZURE_MFA_FINAL_SETUP.md) for detailed setup and troubleshooting.**

## Environment Variables

**Critical variables for AWS Amplify:**

```bash
# Authentication (Azure AD + NextAuth)
MICROSOFT_CLIENT_ID=<azure-client-id>
MICROSOFT_CLIENT_SECRET=<azure-client-secret>
MICROSOFT_TENANT_ID=<azure-tenant-id>
NEXTAUTH_SECRET=<generate-with-openssl>
NEXTAUTH_URL=https://your-app.amplifyapp.com

# Email (AWS SES)
# Important: Use SES_ prefix (Amplify reserves AWS_ prefix)
SES_ACCESS_KEY_ID=<iam-access-key>
SES_SECRET_ACCESS_KEY=<iam-secret-key>
SES_REGION=eu-west-2
SES_FROM_EMAIL=cti-gpe-communications@sky.uk
SES_FROM_NAME=GPE Communications Team

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Cache (Upstash Redis)
KV_URL=<upstash-url>
KV_REST_API_TOKEN=<upstash-token>
KV_REST_API_URL=<upstash-rest-url>
```

## Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[NPM_SECURITY_BEST_PRACTICES.md](./docs/NPM_SECURITY_BEST_PRACTICES.md)** - 🔒 **CRITICAL** - Supply chain attack protection
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment guide and troubleshooting
- **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Local development setup and guidelines
- **[COMMON-ISSUES.md](./docs/COMMON-ISSUES.md)** - Common problems and solutions
- **[AZURE_MFA_FINAL_SETUP.md](./docs/AZURE_MFA_FINAL_SETUP.md)** - Detailed setup and troubleshooting for Azure AD MFA

## Architecture

### Authentication Flow
```
User → Azure AD Login → NextAuth → Protected Routes → App
```

### Email Sending Flow
```
User → Form Submit → /api/send-email (Node.js) → AWS SES → Recipient
```

**Key Design Decisions:**

1. **Custom SES Implementation:** AWS SDK v3 doesn't work in Amplify's SSR environment due to Node.js filesystem dependencies. We use a custom fetch-based implementation with AWS Signature V4 signing.

2. **Azure AD for Auth Only:** Azure AD handles authentication (Sky UK SSO), but AWS SES handles all email sending. No Microsoft Graph API needed.

3. **Environment Variable Naming:** Amplify reserves the `AWS_` prefix, so we use `SES_` prefix for all SES-related variables.

## Deployment

### AWS Amplify (Production)

The app auto-deploys when you push to the `main` branch:

```bash
git push origin main
```

Monitor deployment:
```
AWS Amplify Console → Deployments → View logs
```

**Important:** After changing environment variables in Amplify Console, manually redeploy:
```
Amplify Console → Actions → Redeploy this version
```

### Manual Deployment Steps

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete deployment instructions.

## Testing

### Test Email Sending

1. Ensure both sender and recipient emails are verified in AWS SES
2. Fill out the email form
3. Click "Send via AWS SES"
4. Check browser console for `[v0]` debug logs

### Debug Mode

The app includes console logging for debugging. Look for:
```javascript
console.log('[v0] Environment variables loaded:', { ... })
console.log('[v0] Sending email to AWS SES...')
```

## Common Issues

### Email Not Sending

**Check:**
1. Environment variables configured in Amplify Console
2. Sender email `cti-gpe-communications@sky.uk` verified in AWS SES
3. If SES is in sandbox mode, recipient must also be verified
4. IAM user has `AmazonSESFullAccess` policy

See [docs/COMMON-ISSUES.md](./docs/COMMON-ISSUES.md) for detailed troubleshooting.

### 403 CloudFront Error

**Solutions:**
1. Verify environment variables are set in Amplify Console
2. Redeploy: `Actions → Redeploy this version`
3. Clear CloudFront cache: `Actions → Invalidate cache`
4. Check build logs for errors

### Login Issues

**Check:**
1. Azure AD redirect URI matches Amplify URL
2. `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set
3. User has @sky.uk email address

## Maintenance

### Long-Term Maintenance Strategy

1. **Documentation:** Keep `/docs` folder updated with changes
2. **Changelog:** Update `CHANGELOG.md` with each release
3. **Dependencies:** Review and update packages quarterly
4. **Security:** Rotate `NEXTAUTH_SECRET` annually
5. **Monitoring:** Check Amplify logs weekly for errors

### Regular Tasks

- **Weekly:** Review Amplify deployment logs + run `npm run security-check`
- **Monthly:** Check AWS SES sending statistics
- **Quarterly:** Update npm dependencies (check Snyk dashboard)
- **Annually:** Rotate secrets and review IAM permissions

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for code standards and contribution guidelines.

## Security

### Application Security
- **Authentication:** Azure AD with Sky UK SSO
- **Authorization:** Group-based access control
- **Database:** Row Level Security (RLS) enabled on all tables
- **Secrets:** Environment variables managed in Amplify Console
- **Email:** AWS SES with least-privilege IAM policy
- **Sessions:** Encrypted with NextAuth secret

### NPM Supply Chain Security

**Protection against npm supply chain attacks (Shai-Hulud 2.0):**

- All dependencies use exact versions (no `^` or `~`)
- `package-lock.json` committed to repository for reproducible builds
- Automated `npm audit` runs on every Amplify build
- Security check script available: `npm run security-check`

**Security Commands:**
```bash
npm run audit           # Check for vulnerabilities
npm run audit:fix       # Auto-fix vulnerabilities
npm run security-check  # Full security audit + outdated packages
bash scripts/security-check.sh  # Comprehensive weekly security check
```

**See [docs/NPM_SECURITY_BEST_PRACTICES.md](./docs/NPM_SECURITY_BEST_PRACTICES.md) for detailed security guidelines and incident response procedures.**

## Cost Estimate

- **AWS SES:** ~$0.10 per 1,000 emails
- **AWS Amplify:** ~$5-15/month for hosting
- **Supabase:** Free tier or ~$25/month for Pro
- **Upstash Redis:** Free tier or ~$10/month

**Total:** ~$40-50/month for production workload

## Support

For issues or questions:
1. Check [docs/COMMON-ISSUES.md](./docs/COMMON-ISSUES.md)
2. Review Amplify deployment logs
3. Contact development team

## Project Links

**Amplify URL:** https://main.d2baofxalff7ki.amplifyapp.com
**v0 Project:** Continue building at [v0.app](https://v0.app/chat/projects/tflzi32BBKO)

## License

Internal Sky UK project - All rights reserved
