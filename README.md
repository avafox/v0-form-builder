# GPE Communications Tool

Internal communications management tool for the GPE team, built with Next.js and AWS SES.

## Overview

This app allows the GPE team to create, manage, and send professional email communications using AWS Simple Email Service (SES). It features Azure AD authentication for secure access control and a rich text editor for composing emails.

## Features

- 📧 Email composition and sending via AWS SES
- 🎨 Rich text editor with formatting options
- 👥 Azure AD authentication and group-based access control
- 📱 Responsive design for desktop and mobile
- 🔒 Secure email delivery with AWS infrastructure
- 📊 Email history and tracking

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Authentication:** Azure AD (Microsoft Entra ID)
- **Email Service:** AWS SES (Simple Email Service)
- **Database:** Supabase (PostgreSQL)
- **Cache:** Upstash Redis
- **Styling:** Tailwind CSS
- **Deployment:** AWS Amplify

## Environment Variables

### For Local Development (v0 Preview)

\`\`\`bash
# AWS SES (Email Sending)
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_SES_FROM_EMAIL=cti-gpe-communications@sky.uk
AWS_SES_FROM_NAME=GPE Communications Team

# Azure AD (Authentication Only)
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_CLIENT_SECRET=your-client-secret

# Database (Supabase)
POSTGRES_URL=your-postgres-url
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key

# Cache (Upstash Redis)
KV_URL=your-kv-url
KV_REST_API_TOKEN=your-token
\`\`\`

### For AWS Amplify Deployment

**Important:** AWS Amplify does not allow environment variables starting with `AWS_`. Use `SES_` prefix instead:

\`\`\`bash
# AWS SES (Email Sending) - Use SES_ prefix for Amplify
SES_REGION=eu-west-2
SES_ACCESS_KEY_ID=your-access-key
SES_SECRET_ACCESS_KEY=your-secret-key
SES_FROM_EMAIL=cti-gpe-communications@sky.uk
SES_FROM_NAME=GPE Communications Team

# Azure AD (Authentication Only)
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_CLIENT_SECRET=your-client-secret

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

See [docs/AMPLIFY_ENVIRONMENT_VARIABLES.md](./docs/AMPLIFY_ENVIRONMENT_VARIABLES.md) for detailed Amplify setup.

## Setup

### 1. AWS SES Configuration

See [docs/AWS_SES_SETUP.md](./docs/AWS_SES_SETUP.md) for detailed setup instructions.

Quick steps:
1. Verify email address `cti-gpe-communications@sky.uk` in AWS SES
2. Create IAM user with SES permissions
3. Add AWS credentials to environment variables
4. Request production access (to send to any email)

### 2. Azure AD Configuration

Azure AD is used **only for authentication** (not for email sending).

Required permissions:
- User.Read (Delegated) - Read user profile
- GroupMember.Read.All (Delegated) - Check group membership

Setup:
1. Register app in Azure AD
2. Configure redirect URIs
3. Add required permissions above
4. Grant admin consent
5. Create client secret

**Note:** No Mail.Send permission needed - emails are sent via AWS SES.

### 3. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Testing

Test AWS SES connection:

\`\`\`bash
npx tsx scripts/test-aws-ses.tsx
\`\`\`

## Deployment

The app is configured for AWS Amplify deployment. See [docs/DEPLOY_FROM_REPO.md](./docs/DEPLOY_FROM_REPO.md) for step-by-step instructions.

Quick steps:
1. Push code to GitHub repository
2. Connect repository to AWS Amplify
3. Configure environment variables (use `SES_` prefix)
4. Deploy automatically on push to main branch

**Important:** Use `SES_` prefix for all SES-related variables in Amplify (not `AWS_` prefix).

## Architecture

- **Authentication:** Azure AD handles user authentication and group membership checking
- **Email Sending:** AWS SES sends all emails (independent of Microsoft 365)
- **Database:** Supabase stores email templates and history
- **Cache:** Upstash Redis caches user sessions and group memberships

## Email Flow

\`\`\`
User creates email → App validates → AWS SES sends → Recipient receives
                          ↓
                   Azure AD checks user access
\`\`\`

**Key Points:**
- No Microsoft Graph API needed for email
- No mailbox "Send As" permissions needed
- Azure AD only used for authentication
- All emails sent through AWS SES

## Security

- Azure AD group-based access control
- Environment variables for sensitive credentials
- AWS IAM for SES permissions
- HTTPS only in production
- No email credentials stored in app
- npm dependencies pinned to exact versions (Sky security requirement)

## Cost

**AWS SES:** ~$0.10 per 1,000 emails
- Very cost-effective for internal communications
- See [docs/AWS_SES_SETUP.md](./docs/AWS_SES_SETUP.md) for detailed pricing

## Documentation

- [AWS SES Setup Guide](./docs/AWS_SES_SETUP.md)
- [Amplify Deployment Guide](./docs/DEPLOY_FROM_REPO.md)
- [Amplify Environment Variables](./docs/AMPLIFY_ENVIRONMENT_VARIABLES.md)
- [Email Configuration](./docs/EMAIL_CONFIGURATION.md)
- [Troubleshooting](./docs/TROUBLESHOOTING_AMPLIFY.md)

## Support

For issues or questions:
1. Check documentation in [docs/](./docs/) folder
2. Review [docs/TROUBLESHOOTING_AMPLIFY.md](./docs/TROUBLESHOOTING_AMPLIFY.md)
3. Contact the development team

## Deployment Status

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/avafoxwell-4565s-projects/v0-form-builder)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/tflzi32BBKO)

**Live at:** [https://vercel.com/avafoxwell-4565s-projects/v0-form-builder](https://vercel.com/avafoxwell-4565s-projects/v0-form-builder)

**Continue building:** [https://v0.app/chat/projects/tflzi32BBKO](https://v0.app/chat/projects/tflzi32BBKO)
