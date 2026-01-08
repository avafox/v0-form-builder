# Form Builder Architecture

## Overview

Communication management system for GPE team at Sky UK. Enables creating and sending professional HTML email communications to internal Sky UK addresses.

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript | UI and SSR |
| **Styling** | Tailwind CSS v4, shadcn/ui | Component library |
| **Authentication** | NextAuth + Azure AD | Sky UK SSO |
| **Email** | AWS SES (Custom fetch implementation) | Send formatted emails |
| **Hosting** | AWS Amplify (SSR enabled) | Deployment and CI/CD |
| **Database** | Supabase (PostgreSQL with RLS) | Data persistence |
| **Cache** | Upstash Redis | Performance optimization |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FORM BUILDER APP                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Sky UK Users ──▶ AWS Amplify ──▶ Next.js 15 App                  │
│                        │                                            │
│            ┌───────────┼───────────┬───────────────┐               │
│            ▼           ▼           ▼               ▼               │
│      Azure AD      AWS SES     Supabase      Upstash Redis        │
│       (Auth)       (Email)       (DB)          (Cache)            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Architecture Decisions

### Why AWS SES via Fetch (Not SDK)

AWS SDK v3 doesn't work in Amplify's edge-like SSR environment due to Node.js filesystem dependencies. We implemented a **custom fetch-based solution** with AWS Signature V4 signing that works in serverless Lambda functions.

### Why Azure AD (Authentication Only)

Sky UK corporate SSO requirement. All users authenticate with @sky.uk Microsoft accounts. **Note:** We use email domain validation for access control (not Microsoft Graph groups) to avoid admin consent requirements.

### Why Amplify

- Integrated CI/CD with automatic deployments from Git
- SSR support for Next.js 15
- Built-in environment variable management
- CloudFront CDN for performance

### Why Custom SES Implementation

Standard AWS SDK fails in Amplify's serverless environment. Our custom implementation:
- Uses Web Crypto API for signing (browser-compatible)
- Makes direct REST API calls to SES v2
- Works in both SSR and API routes

## Project Structure

```
/app
  /api
    /send-email        # AWS SES email endpoint
    /auth              # NextAuth configuration
    /check-access      # Access control API
  /communications      # Main form builder UI
  /auth                # Sign-in pages

/components
  /auth                # Auth providers and guards
  /navigation          # Headers, menus
  /ui                  # shadcn components
  communications-template.tsx  # Main form + email generation

/lib
  aws-ses-email.ts     # Custom SES implementation (AWS Sig V4)
  access-control.ts    # Email whitelist validation
  supabase-*.ts        # Database clients

/docs
  /diagrams            # Mermaid architecture diagrams
  ARCHITECTURE.md      # This file
  DEPLOYMENT.md        # Deployment guide
  SBOM-SECURITY-ANALYSIS.md  # OSS compliance
```

## Data Flows

### Authentication Flow

```
User → Azure AD Login → OAuth Token → Email Domain Check → Access Granted/Denied
```

### Email Sending Flow

```
User → Form → generateEmailHTML() → /api/send-email → AWS SES → Sky UK Recipient
```

### Data Storage Flow

```
User → Form → Supabase (communications table) → Redis Cache (optional)
```

## Environment Variables

**Critical variables (configured in Amplify Console):**

| Variable | Purpose |
|----------|---------|
| `SES_ACCESS_KEY_ID` | AWS IAM credentials for SES |
| `SES_SECRET_ACCESS_KEY` | AWS IAM secret |
| `SES_REGION` | AWS region (eu-west-2) |
| `SES_FROM_EMAIL` | Sender address (cti-gpe-communications@sky.uk) |
| `MICROSOFT_CLIENT_ID` | Azure AD app registration |
| `MICROSOFT_TENANT_ID` | Sky UK tenant |
| `MICROSOFT_CLIENT_SECRET` | Azure AD secret |
| `NEXTAUTH_SECRET` | Session encryption |
| `NEXTAUTH_URL` | Callback URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Database connection |
| `SUPABASE_SERVICE_ROLE_KEY` | Database admin access |

**Note:** Use `SES_` prefix (not `AWS_`) - Amplify reserves the AWS_ prefix.

## Security

1. **Authentication:** Azure AD SSO with @sky.uk accounts only
2. **Authorization:** Email domain + whitelist validation
3. **Database:** Row Level Security (RLS) on all Supabase tables
4. **Secrets:** Environment variables in Amplify Console (not in code)
5. **Email:** Least-privilege IAM policy for SES
6. **Transport:** HTTPS/TLS for all connections

## Cost Estimate

| Service | Monthly Cost |
|---------|--------------|
| AWS Amplify | ~$5-15 |
| AWS SES | ~$0.10/1000 emails |
| Supabase | Free tier / $25 Pro |
| Upstash Redis | Free tier / $10 |
| **Total** | ~$15-50/month |
