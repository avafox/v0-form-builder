# Form Builder Architecture

## Overview
Communication management system for GPE team at Sky UK.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Authentication**: NextAuth + Azure AD (Sky UK SSO)
- **Email**: AWS SES (via REST API, not SDK)
- **Hosting**: AWS Amplify (SSR enabled)
- **Database**: Supabase (PostgreSQL with RLS)
- **Cache**: Upstash Redis

## Key Architecture Decisions

### Why AWS SES via Fetch (Not SDK)
AWS SDK v3 doesn't work in Amplify's edge-like SSR environment due to Node.js filesystem dependencies. We use a custom fetch-based implementation with AWS Signature V4 signing.

### Why Azure AD
Sky UK corporate SSO requirement. All users must authenticate with @sky.uk accounts.

### Why Amplify
Integrated CI/CD, automatic deployments from Git, SSR support for Next.js.

## Project Structure

\`\`\`
/app
  /api
    /send-email        # SES email sending endpoint
    /auth              # NextAuth configuration
  /communications      # Main form builder UI
  /login               # Authentication pages

/components
  /auth                # Auth providers and guards
  /navigation          # Headers, menus
  /ui                  # shadcn components
  communications-template.tsx  # Main form component

/lib
  aws-ses-email.ts     # Custom SES implementation
  microsoft-graph.ts   # (Legacy - not used)
  supabase-*          # Database clients
  utils.ts             # Utilities

/scripts               # Database migrations (SQL)
\`\`\`

## Data Flow

### Authentication Flow
\`\`\`
User → Azure AD Login → NextAuth → Protected Routes → App
\`\`\`

### Email Sending Flow
\`\`\`
User → Form Submit → /api/send-email → AWS SES → Recipient
\`\`\`

### Form Data Storage
\`\`\`
User → Form → Supabase (communications table) → Redis Cache
\`\`\`

## Environment Variables

See `.env.example` for all required variables.

**Critical variables:**
- `SES_*` - AWS SES credentials (no AWS_ prefix allowed in Amplify)
- `MICROSOFT_*` - Azure AD OAuth credentials
- `NEXTAUTH_*` - Session encryption and callback URLs
- `NEXT_PUBLIC_SUPABASE_*` - Database connection

## Security Considerations

1. **Row Level Security (RLS)** enabled on all Supabase tables
2. **Environment variables** never committed to Git
3. **NextAuth secret** rotates annually
4. **SES credentials** use least-privilege IAM policy
5. **Azure AD** requires group membership verification
