# Documentation Index

This directory contains comprehensive documentation for the GPE Communications Tool.

## Quick Links

### Setup & Deployment
- **[AZURE_MFA_FINAL_SETUP.md](./AZURE_MFA_FINAL_SETUP.md)** - ✅ **CURRENT** - Azure AD MFA setup guide (working solution)
- **[PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)** - Complete production deployment guide
- **[AMPLIFY_ENV_SETUP_CHECKLIST.md](./AMPLIFY_ENV_SETUP_CHECKLIST.md)** - Environment variables checklist
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - General deployment instructions

### Authentication & Security
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Authentication architecture
- **[ACCESS_CONTROL_SETUP.md](./ACCESS_CONTROL_SETUP.md)** - User access control configuration
- **[SECURITY.md](./SECURITY.md)** - Security best practices

### Email Configuration
- **[AWS_SES_SETUP.md](./AWS_SES_SETUP.md)** - AWS SES email service setup
- **[EMAIL_CONFIGURATION.md](./EMAIL_CONFIGURATION.md)** - Email system configuration

### Architecture & Development
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture overview
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Local development guide
- **[MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md)** - Long-term maintenance

### Troubleshooting
- **[COMMON-ISSUES.md](./COMMON-ISSUES.md)** - Common problems and solutions
- **[AZURE_AD_TROUBLESHOOTING.md](./AZURE_AD_TROUBLESHOOTING.md)** - Azure AD specific issues

## Current Status (January 2026)

### ✅ Working Features
- Azure AD MFA authentication (via runtime-config.ts solution)
- Email sending via AWS SES
- Rich text editor for email composition
- Multi-domain support (@sky.uk and @3dflyingmonsters.co.uk)
- Rate limiting and security headers
- Supabase database integration
- Upstash Redis caching

### 🔧 Known Configuration
- Environment variables injected at build time (see amplify.yml)
- Authentication requires `lib/runtime-config.ts` for Lambda runtime access
- MFA enforcement via Azure AD Conditional Access policies

### 📋 Key Environment Variables Required
```bash
# Authentication (Critical)
NEXTAUTH_SECRET=<32-char-secret>
NEXTAUTH_URL=https://main.d2baofxalff7ki.amplifyapp.com
MICROSOFT_CLIENT_ID=<azure-client-id>
MICROSOFT_CLIENT_SECRET=<azure-secret>
MICROSOFT_TENANT_ID=<azure-tenant-id>

# Email (Critical)
SES_ACCESS_KEY_ID=<aws-access-key>
SES_SECRET_ACCESS_KEY=<aws-secret>
SES_REGION=eu-west-2
SES_FROM_EMAIL=cti-gpe-communications@sky.uk
SES_FROM_NAME=GPE Communications Team
```

## Diagnostic Tools

- **/api/debug/azure-check** - Verify Azure AD configuration and env vars loading
- **/api/auth/test-config** - Test NextAuth configuration

## Recent Changes

**Latest Update:** Azure AD MFA authentication fully working
- Created `lib/runtime-config.ts` to inject environment variables at build time
- Updated `amplify.yml` to generate runtime config during deployment
- Authentication now works in AWS Amplify Lambda environment

## Deprecated Documentation

The following files contain outdated information or duplicate content:

- `AZURE_MFA_ENABLED.md` - Superseded by AZURE_MFA_FINAL_SETUP.md
- `AZURE_MFA_TROUBLESHOOTING_STEPS.md` - Consolidated into AZURE_AD_TROUBLESHOOTING.md
- `NEXTAUTH_TROUBLESHOOTING.md` - Solution implemented, now in AZURE_MFA_FINAL_SETUP.md
- `NEXTAUTH_ENV_TROUBLESHOOTING.md` - Solution implemented, now in AZURE_MFA_FINAL_SETUP.md
- `CURRENT_STATE.md` - Outdated, replaced by this README

## Need Help?

1. Check [COMMON-ISSUES.md](./COMMON-ISSUES.md) first
2. Visit `/api/debug/azure-check` to diagnose configuration
3. Review [AZURE_MFA_FINAL_SETUP.md](./AZURE_MFA_FINAL_SETUP.md) for authentication issues
4. Check Amplify build logs for deployment problems
