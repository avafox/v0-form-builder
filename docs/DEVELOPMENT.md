# Development Guide

## Local Development Setup

### 1. Clone Repository
\`\`\`bash
git clone <your-repo-url>
cd form-builder
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables

Create `.env.local`:
\`\`\`env
# Authentication
MICROSOFT_CLIENT_ID=<from Azure AD>
MICROSOFT_CLIENT_SECRET=<from Azure AD>
MICROSOFT_TENANT_ID=<from Azure AD>
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# AWS SES (use same as Amplify)
SES_ACCESS_KEY_ID=<IAM access key>
SES_SECRET_ACCESS_KEY=<IAM secret>
SES_REGION=eu-west-2
SES_FROM_EMAIL=cti-gpe-communications@sky.uk
SES_FROM_NAME=GPE Communications Team

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<from dashboard>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from dashboard>

# Upstash Redis (optional for local)
KV_URL=<from Upstash>
KV_REST_API_TOKEN=<from Upstash>
KV_REST_API_URL=<from Upstash>
\`\`\`

**Important:** Never commit `.env.local` to Git!

### 4. Configure Azure AD for Localhost

Add redirect URI in Azure Portal:
\`\`\`
http://localhost:3000/api/auth/callback/azure-ad
\`\`\`

### 5. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:3000

## Code Standards

### TypeScript
- Use strict mode (enabled in tsconfig.json)
- Prefer interfaces over types for object shapes
- Use type inference where possible

### React Components
- Use functional components with hooks
- Client components: add `'use client'` directive
- Server components: default (no directive needed)
- Props interfaces: name with `Props` suffix

### Styling
- Use Tailwind utility classes
- Semantic tokens: `bg-background`, `text-foreground`
- Responsive: mobile-first with `md:`, `lg:` prefixes
- shadcn components: import from `@/components/ui`

### File Naming
- Components: `kebab-case.tsx`
- Utilities: `kebab-case.ts`
- API routes: `route.ts` in folder structure

## Common Tasks

### Adding a New Component
\`\`\`bash
# If shadcn component
npx shadcn@latest add <component-name>

# Custom component
touch components/my-component.tsx
\`\`\`

### Database Migrations
\`\`\`bash
# Create new migration
touch scripts/migration-v2-add-field.sql

# Run in Amplify (auto-executes in /scripts folder)
\`\`\`

### Testing Email Locally
\`\`\`bash
# Start dev server
npm run dev

# Email will send to real SES (use test recipients verified in SES)
\`\`\`

### Debugging
\`\`\`typescript
// Add debug logs
console.log('[v0] Variable value:', myVar)

// Check in browser console (F12)
// Remove before committing
\`\`\`

## Git Workflow

### Branch Strategy
\`\`\`
main - Production (auto-deploys to Amplify)
\`\`\`

### Commit Messages
\`\`\`bash
git commit -m "feat: add new form field"
git commit -m "fix: email sending error"
git commit -m "docs: update deployment guide"
\`\`\`

### Before Pushing
1. Test locally: `npm run dev`
2. Check TypeScript: `npm run build`
3. Review changes: `git diff`
4. Push: `git push origin main`

## Package Management

### Adding Dependencies
\`\`\`bash
npm install <package-name>
# Push updated package.json and package-lock.json
\`\`\`

### Updating Dependencies
\`\`\`bash
# Check outdated
npm outdated

# Update specific package
npm update <package-name>

# Update all (careful!)
npm update
\`\`\`

**Important:** Always test after updating packages

## Troubleshooting

### Port Already in Use
\`\`\`bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
\`\`\`

### Build Errors
\`\`\`bash
# Clear Next.js cache
rm -rf .next
npm run dev
\`\`\`

### Type Errors
\`\`\`bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
