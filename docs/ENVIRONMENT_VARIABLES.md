# Environment Variables Reference

Complete list of environment variables needed for AWS Amplify deployment.

---

## Required Variables

### AWS SES Configuration

\`\`\`bash
# AWS Region (London)
AWS_REGION=eu-west-2

# IAM User Access Keys
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Email Configuration
AWS_SES_FROM_EMAIL=ava.foxwell@sky.uk
AWS_SES_FROM_NAME=GPE Communications Team
\`\`\`

**Where to get these:**
1. AWS Console → IAM → Users → gpe-communications-ses
2. Security credentials → Access keys
3. Create new access key if needed

---

### Azure AD Configuration

\`\`\`bash
# Azure AD App Registration
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_CLIENT_SECRET=your-client-secret
\`\`\`

**Where to get these:**
1. Azure Portal → Azure Active Directory
2. App registrations → Your app
3. Overview page shows Client ID and Tenant ID
4. Certificates & secrets → Client secrets

---

### NextAuth Configuration

\`\`\`bash
# App URL (update with your Amplify domain)
NEXTAUTH_URL=https://your-app.amplifyapp.com

# Secret for session encryption (generate new)
NEXTAUTH_SECRET=your-generated-secret
\`\`\`

**Generate NEXTAUTH_SECRET:**
\`\`\`bash
openssl rand -base64 32
\`\`\`

---

### Database Configuration

\`\`\`bash
# Postgres Connection
POSTGRES_URL=postgresql://user:pass@host:5432/db
POSTGRES_PRISMA_URL=postgresql://user:pass@host:5432/db

# Supabase Configuration
SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
\`\`\`

**Where to get these:**
1. Supabase Dashboard → Project Settings
2. API → Project URL
3. API → Project API keys

---

## Optional Variables

### Email Testing

\`\`\`bash
# Test recipient for development
TEST_EMAIL=your-test-email@sky.uk
\`\`\`

### SES Advanced Configuration

\`\`\`bash
# Configuration set for tracking (optional)
AWS_SES_CONFIGURATION_SET=gpe-communications

# Reply-to address (optional)
AWS_SES_REPLY_TO=no-reply@sky.uk
\`\`\`

---

## Setting Variables in Amplify

1. Amplify Console → Your app
2. Environment variables (left sidebar)
3. Manage variables
4. Add each variable with key and value
5. Save

---

## Security Notes

- Never commit these values to Git
- Store securely (password manager, AWS Secrets Manager)
- Rotate secrets every 90 days
- Use different values for dev/staging/prod
- Monitor access logs for unauthorized use

---

## Verification

After adding variables, verify:

\`\`\`bash
# In Amplify Console, check:
- All required variables present
- No typos in variable names
- Values match your AWS/Azure resources
- NEXTAUTH_URL matches Amplify domain
\`\`\`

---

## Template

Copy this template to fill in your values:

\`\`\`bash
# AWS SES
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SES_FROM_EMAIL=ava.foxwell@sky.uk
AWS_SES_FROM_NAME=GPE Communications Team

# Azure AD
MICROSOFT_CLIENT_ID=
MICROSOFT_TENANT_ID=
MICROSOFT_CLIENT_SECRET=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Database
POSTGRES_URL=
POSTGRES_PRISMA_URL=
SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
