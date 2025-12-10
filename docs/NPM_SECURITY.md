# NPM Security Guidelines

Following Sky Cyber Security team recommendations after the npm ecosystem freeze incident.

---

## Security Practices Implemented

### 1. Exact Version Pinning

All dependencies use **exact versions** (no `^` or `~` prefixes):

\`\`\`json
"dependencies": {
  "next": "15.2.4",           // ✅ Exact version
  "react": "19.0.0",           // ✅ Exact version
  "@aws-sdk/client-ses": "3.922.0"  // ✅ Exact version
}
\`\`\`

**Why:** Prevents automatic updates that could introduce malicious code from compromised packages.

---

### 2. Package Lock File

**package-lock.json** ensures reproducible builds with integrity checks.

**Critical:** Always commit `package-lock.json` to version control.

---

### 3. Installation Commands

**Development:**
\`\`\`bash
npm ci
\`\`\`
- Uses exact versions from package-lock.json
- Performs integrity checks
- Reproducible builds
- Faster than npm install

**Production/Deployment:**
\`\`\`bash
npm ci --omit=dev
\`\`\`
- Installs only production dependencies
- Skips devDependencies

**Never use:**
\`\`\`bash
npm install  # ❌ Can modify package-lock.json
\`\`\`

---

### 4. Regular Security Audits

**Run audits regularly:**
\`\`\`bash
npm audit
\`\`\`

**Fix vulnerabilities:**
\`\`\`bash
npm audit fix
\`\`\`

**Fix breaking changes (carefully):**
\`\`\`bash
npm audit fix --force
\`\`\`

**Added npm scripts:**
\`\`\`bash
npm run audit        # Check for vulnerabilities
npm run audit:fix    # Auto-fix vulnerabilities
\`\`\`

---

### 5. Dependency Updates

**Before updating any package:**

1. **Check package reputation:**
   - npm downloads
   - GitHub stars/activity
   - Recent issues/vulnerabilities
   - Maintainer reputation

2. **Review changelog:**
   \`\`\`bash
   npm view <package-name> versions
   npm view <package-name>@<version> --json
   \`\`\`

3. **Update single package:**
   \`\`\`bash
   npm install <package-name>@<exact-version> --save-exact
   \`\`\`

4. **Test thoroughly:**
   - Run tests
   - Manual testing
   - Check for breaking changes

5. **Commit lock file:**
   \`\`\`bash
   git add package.json package-lock.json
   git commit -m "chore: update <package-name> to <version>"
   \`\`\`

---

### 6. Verified Sources Only

**Trusted package sources:**
- Official packages from known organizations
- High download counts (>100k weekly)
- Active maintenance (commits in last 3 months)
- Clear documentation and license

**Red flags:**
- New packages with no history
- Low download counts
- No GitHub repository
- Suspicious maintainer names
- Typosquatting (similar names to popular packages)

---

### 7. Node Version Management

**Specified in package.json:**
\`\`\`json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
\`\`\`

**Use .nvmrc for consistency:**
\`\`\`bash
echo "18.20.0" > .nvmrc
nvm use
\`\`\`

---

## Current Dependency Status

### Production Dependencies (33)

All using exact versions:
- **Framework:** Next.js 15.2.4, React 19.0.0
- **UI Components:** Radix UI (exact versions)
- **Email:** AWS SES 3.922.0, Nodemailer 7.0.10
- **Auth:** next-auth 4.24.11
- **Database:** Supabase 2.47.10

### Dev Dependencies (8)

All using exact versions:
- **Build Tools:** TypeScript 5.7.2, Tailwind 4.1.9
- **Type Definitions:** Latest stable versions

---

## Incident Response

### If Compromise Detected

1. **Stop deployments immediately**
2. **Run security audit:**
   \`\`\`bash
   npm audit
   npm outdated
   \`\`\`
3. **Check package-lock.json for unexpected changes**
4. **Review recent commits to dependencies**
5. **Contact Sky Cyber Security team**
6. **Rollback to last known good version**

---

## Deployment Checklist

Before deploying to production:

- [ ] Run `npm audit` - no high/critical vulnerabilities
- [ ] Verify package-lock.json is committed
- [ ] Use `npm ci` for installation
- [ ] Test in staging environment
- [ ] Review dependency changes in PR
- [ ] Confirm all versions are exact (no `^` or `~`)

---

## Automated Checks

Consider adding to CI/CD pipeline:

\`\`\`yaml
# .github/workflows/security.yml
name: Security Audit

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm audit --audit-level=high
\`\`\`

---

## Contact

**Questions about npm security:**
- Sky Cyber Security Team
- Internal Security Portal

**Package vulnerability reports:**
- npm security team: security@npmjs.com
- Sky incident response

---

**Last Updated:** December 2025  
**Policy Version:** 1.0  
**Compliance:** Sky npm Security Standards
