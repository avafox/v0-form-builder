# Common Issues & Solutions

## Email Sending Issues

### Problem: "Failed to send email" Error

**Possible Causes:**

1. **Environment Variables Not Set**
\`\`\`bash
# Check in Amplify Console → Environment variables
# Must have: SES_ACCESS_KEY_ID, SES_SECRET_ACCESS_KEY, SES_REGION, SES_FROM_EMAIL
\`\`\`

2. **SES Sender Not Verified**
\`\`\`bash
# AWS Console → SES → Verified identities
# Verify: cti-gpe-communications@sky.uk
\`\`\`

3. **SES in Sandbox Mode + Recipient Not Verified**
\`\`\`bash
# If in sandbox, verify recipient email too
# Or request production access: SES Console → Account dashboard
\`\`\`

4. **Wrong IAM Permissions**
\`\`\`bash
# IAM user must have AmazonSESFullAccess policy
# Or custom policy with ses:SendEmail permission
\`\`\`

**Debug Steps:**
1. Check browser console for `[v0]` logs
2. Check Amplify logs: Monitoring → Logs
3. Test SES directly with AWS CLI

---

## Authentication Issues

### Problem: Login Redirect Loop

**Solution:**
1. Check `NEXTAUTH_URL` matches actual Amplify URL
2. Verify Azure AD redirect URI is correct
3. Check `NEXTAUTH_SECRET` is set and not empty

### Problem: "Access Denied" After Login

**Solution:**
1. Verify user has @sky.uk email domain
2. Check Azure AD group membership requirements
3. Check middleware.ts isn't blocking the route

---

## Deployment Issues

### Problem: Build Fails in Amplify

**Check Build Logs:**
\`\`\`
Amplify Console → Deployments → Click deployment → Expand "Build"
\`\`\`

**Common Fixes:**

1. **Missing package-lock.json**
\`\`\`bash
npm install  # Generates package-lock.json
git add package-lock.json
git commit -m "Add package-lock.json"
git push
\`\`\`

2. **Node.js Version Mismatch**
\`\`\`yaml
# In amplify.yml, ensure:
preBuild:
  commands:
    - nvm install 20
    - nvm use 20
\`\`\`

3. **TypeScript Errors**
\`\`\`bash
# Fix locally first
npm run build
# Then push
\`\`\`

### Problem: 403 CloudFront Error After Successful Build

**Solutions:**

1. **Clear Cache**
\`\`\`
Amplify Console → Actions → Invalidate cache
\`\`\`

2. **Check baseDirectory**
\`\`\`yaml
# In amplify.yml:
baseDirectory: .next
# NOT .next/standalone
\`\`\`

3. **Verify Environment Variables Loaded**
\`\`\`
Redeploy: Actions → Redeploy this version
\`\`\`

---

## Database Issues

### Problem: Supabase Connection Error

**Solutions:**

1. **Check Environment Variables**
\`\`\`
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
\`\`\`

2. **Check RLS Policies**
\`\`\`sql
-- Supabase dashboard → SQL Editor
-- Verify policies allow authenticated users to access data
\`\`\`

3. **Check Connection String**
\`\`\`typescript
// Verify in lib/supabase-client.ts
// Should use environment variables, not hardcoded values
\`\`\`

---

## Performance Issues

### Problem: Slow Page Loads

**Solutions:**

1. **Enable Redis Caching**
\`\`\`typescript
// Check that Upstash Redis is configured
// Cache frequently accessed data
\`\`\`

2. **Optimize Images**
\`\`\`typescript
// Use Next.js Image component
import Image from 'next/image'
\`\`\`

3. **Check Database Queries**
\`\`\`typescript
// Add indexes to frequently queried columns
// Limit query results with .limit()
\`\`\`

---

## Local Development Issues

### Problem: Can't Login Locally

**Solution:**
Add localhost redirect URI to Azure AD:
\`\`\`
http://localhost:3000/api/auth/callback/azure-ad
\`\`\`

### Problem: Environment Variables Not Loading

**Solution:**
\`\`\`bash
# Restart dev server
npm run dev

# Check .env.local exists and has correct values
# Check variable names match exactly (case-sensitive)
\`\`\`

---

## When to Contact Support

Contact AWS Support if:
- SES sending limits reached
- Need production access for SES
- Amplify platform issues

Contact Azure AD Admin if:
- Need group membership changes
- App registration issues
- Permissions not working

Contact Supabase Support if:
- Database performance issues
- RLS policy questions
- Upgrade/billing questions
