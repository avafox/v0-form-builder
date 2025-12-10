# Troubleshooting AWS Amplify Deployment

## Common Build Errors and Solutions

### Error: `npm ci` requires package-lock.json

**Error Message:**
\`\`\`
npm error The `npm ci` command can only install with an existing package-lock.json
\`\`\`

**Cause:** Your repository doesn't have a `package-lock.json` file.

**Solution 1: Automatic (Recommended)**
The `amplify.yml` now automatically generates `package-lock.json` if missing:
\`\`\`yaml
- |
  if [ ! -f package-lock.json ]; then
    echo "No package-lock.json found, generating..."
    npm install --package-lock-only --legacy-peer-deps
  fi
\`\`\`

**Solution 2: Manual**
Generate the lock file locally and commit it:
\`\`\`bash
# In your local repository
npm install --package-lock-only --legacy-peer-deps

# Commit the lock file
git add package-lock.json
git commit -m "chore: add package-lock.json for Amplify"
git push
\`\`\`

---

### Error: Peer dependency conflicts

**Error Message:**
\`\`\`
npm ERR! ERESOLVE unable to resolve dependency tree
\`\`\`

**Solution:** The `--legacy-peer-deps` flag is already included in `amplify.yml`:
\`\`\`yaml
- npm ci --legacy-peer-deps
\`\`\`

If you still see this error, try:
1. Delete `package-lock.json` locally
2. Run `npm install --legacy-peer-deps`
3. Commit the new `package-lock.json`
4. Push to trigger new build

---

### Error: Node version mismatch

**Error Message:**
\`\`\`
The engine "node" is incompatible with this module
\`\`\`

**Solution:** Update Node.js version in Amplify:
1. Go to Amplify Console
2. App Settings → Build settings
3. Build image settings → Edit
4. Set Node.js version: **18.x** or **20.x**
5. Save

Or add to `amplify.yml`:
\`\`\`yaml
frontend:
  phases:
    preBuild:
      commands:
        - nvm install 20
        - nvm use 20
\`\`\`

---

### Error: Build timeout

**Error Message:**
\`\`\`
Build timed out after 15 minutes
\`\`\`

**Solution:**
1. Go to Amplify Console
2. App Settings → Build settings
3. Build timeout: Increase to **30 minutes**
4. Save

---

### Error: Environment variables not found

**Error Message:**
\`\`\`
Error: AWS_REGION is not defined
\`\`\`

**Solution:**
1. Go to Amplify Console
2. App Settings → Environment variables
3. Add all required variables (see ENVIRONMENT_VARIABLES.md)
4. Redeploy

**Required variables:**
- AWS_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_SES_FROM_EMAIL
- AWS_SES_FROM_NAME
- MICROSOFT_CLIENT_ID
- MICROSOFT_TENANT_ID
- MICROSOFT_CLIENT_SECRET
- NEXTAUTH_SECRET
- NEXTAUTH_URL

---

### Error: Module not found

**Error Message:**
\`\`\`
Module not found: Can't resolve '@aws-sdk/client-ses'
\`\`\`

**Cause:** Dependencies not installed correctly.

**Solution:**
1. Clear cache in Amplify:
   \`\`\`
   App Settings → Build settings → Clear cache
   \`\`\`
2. Redeploy

Or add to `amplify.yml`:
\`\`\`yaml
preBuild:
  commands:
    - rm -rf node_modules
    - npm ci --legacy-peer-deps
\`\`\`

---

### Error: Next.js build failed

**Error Message:**
\`\`\`
Error: Failed to compile
\`\`\`

**Solution:**
1. Check the build logs for specific errors
2. Test locally first:
   \`\`\`bash
   npm run build
   \`\`\`
3. Fix any TypeScript or build errors
4. Commit and push

**Common causes:**
- Missing environment variables
- TypeScript errors
- Import errors

---

### Error: Deployment timeout

**Error Message:**
\`\`\`
Deployment timed out
\`\`\`

**Solution:**
1. Check Amplify service limits
2. Reduce bundle size:
   \`\`\`javascript
   // next.config.mjs
   export default {
     output: 'standalone',
     experimental: {
       outputFileTracingExcludes: {
         '*': ['**swc+core**', '**esbuild**']
       }
     }
   }
   \`\`\`

---

## Debugging Steps

### Step 1: Check Build Logs
\`\`\`
Amplify Console → Your App → Main branch → View details
\`\`\`

Look for:
- Red error messages
- Failed commands
- Missing dependencies

### Step 2: Test Locally
\`\`\`bash
# Install dependencies
npm ci --legacy-peer-deps

# Build the app
npm run build

# Run the app
npm start
\`\`\`

If it works locally but fails in Amplify, it's likely:
- Environment variable issue
- Node version mismatch
- Build configuration issue

### Step 3: Verify Environment Variables
\`\`\`
Amplify Console → App Settings → Environment variables
\`\`\`

Make sure all variables are:
- Spelled correctly
- Have values set
- No extra spaces

### Step 4: Clear Cache and Rebuild
\`\`\`
Amplify Console → App Settings → Build settings → Clear cache
\`\`\`

Then trigger a new deployment.

---

## Getting Help

### Check Build Output
Download full build logs:
\`\`\`
Amplify Console → Your App → Build → Download logs
\`\`\`

### Amplify Console Logs
Enable detailed logging in `amplify.yml`:
\`\`\`yaml
frontend:
  phases:
    preBuild:
      commands:
        - set -x  # Enable verbose logging
        - npm ci --legacy-peer-deps
\`\`\`

### Contact Support
If issues persist:
1. Check AWS Amplify documentation
2. Search AWS Support forums
3. Contact AWS Support (if you have a support plan)

---

## Quick Fixes Checklist

- [ ] `package-lock.json` exists in repository
- [ ] Node.js version is 18.x or higher
- [ ] All environment variables are set
- [ ] `amplify.yml` is in repository root
- [ ] Build timeout is adequate (30+ minutes)
- [ ] Cache is cleared
- [ ] Local build works (`npm run build`)
- [ ] No TypeScript errors
- [ ] All imports are correct

---

## Prevention Tips

1. **Always test locally first**
   \`\`\`bash
   npm ci --legacy-peer-deps
   npm run build
   \`\`\`

2. **Commit package-lock.json**
   \`\`\`bash
   git add package-lock.json
   git commit -m "chore: update lock file"
   \`\`\`

3. **Pin exact versions** (already done in package.json)
   - No `^` or `~` in dependencies
   - Ensures consistent builds

4. **Use Amplify preview deployments**
   - Test branches before merging to main
   - Catch issues early

5. **Monitor build times**
   - Optimize if builds take >10 minutes
   - Consider next.config.mjs optimizations

---

For more help, see:
- [AWS_AMPLIFY_DEPLOYMENT.md](./AWS_AMPLIFY_DEPLOYMENT.md)
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
- [DEPLOY_FROM_REPO.md](./DEPLOY_FROM_REPO.md)
