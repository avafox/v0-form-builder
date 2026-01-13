# NPM Security Best Practices

**Alert Context:** Industry-wide npm supply chain attack (Shai-Hulud 2.0) affecting hundreds of packages and thousands of repositories.

## 🔒 Security Measures Implemented

### 1. Exact Version Pinning
All dependencies in `package.json` now use **exact versions** (no `^` or `~`):
- ✅ Before: `"next": "^15.2.4"` → After: `"next": "15.2.4"`
- ✅ Before: `"react": "^19"` → After: `"react": "19.0.0"`
- ✅ Before: `"jspdf": "latest"` → After: `"jspdf": "2.5.2"`

### 2. Package Lock File
- `package-lock.json` is now tracked in git for reproducible builds
- Ensures exact dependency tree across all environments
- Prevents unauthorized package substitution

### 3. Automated Security Audits
Added npm scripts for security monitoring:
```bash
npm run audit              # Check for vulnerabilities (moderate+)
npm run audit:fix          # Auto-fix vulnerabilities where possible
npm run security-check     # Audit + outdated package report
```

### 4. Build-Time Security Checks
Amplify builds now:
- Use `npm ci` for integrity checks (falls back to `npm install` if needed)
- Run `npm audit` before every build
- Alert on moderate+ vulnerabilities

## 📋 Ongoing Security Practices

### Weekly Tasks
- [ ] Run `npm audit` and review results
- [ ] Check Snyk dashboard: https://skyglobal.sharepoint.com/sites/GroupCyberSecurity10/SitePages/Software-Security.aspx
- [ ] Review Amplify build logs for security warnings

### Before Installing New Packages
1. Verify package authenticity on npm registry
2. Check package download stats and GitHub stars
3. Review recent commit history and maintainers
4. Scan with `npm audit` after installation
5. Update this document if new dependencies added

### Monthly Tasks
- [ ] Review and update outdated packages using `npm outdated`
- [ ] Test major version upgrades in development first
- [ ] Document breaking changes in CHANGELOG.md

## 🚨 Incident Response

### If Malware Detected
1. **DO NOT** run npm commands that might trigger malware
2. Immediately disconnect from network
3. Contact Sky Cyber Security team
4. Preserve logs from:
   - Amplify build logs
   - npm audit output
   - GitHub Actions (if applicable)
5. Follow Sky incident response procedures

### Signs of Compromise
Watch for:
- Unexpected postinstall/preinstall scripts
- Packages with obfuscated code (base64, eval, Function constructor)
- Network requests to unknown domains
- File system operations outside node_modules
- Unauthorized git commits

## 🔍 Current Dependency Risk Assessment

### Low Risk (Official/Well-Maintained)
- Next.js 15.2.4
- React 19.0.0
- NextAuth 4.24.11
- Radix UI components
- Vercel packages

### Monitor Closely
- @upstash/redis 1.36.1 - Third-party service
- nodemailer 7.0.10 - Email functionality
- jspdf 2.5.2 - PDF generation

### Upgrade to Silver Tier
Consider upgrading Snyk tier for:
- Enhanced vulnerability detection
- Automated fix PRs
- License compliance scanning
- Container security

## 📚 Resources

- Sky Cyber Security Portal: https://skyglobal.sharepoint.com/sites/GroupCyberSecurity10/SitePages/Software-Security.aspx
- npm Security Best Practices: https://docs.npmjs.com/security-best-practices
- OWASP Dependency Check: https://owasp.org/www-project-dependency-check/
- Snyk Vulnerability Database: https://security.snyk.io/

## ✅ Compliance Checklist

- [x] All dependencies use exact versions
- [x] package-lock.json committed to repository
- [x] npm audit integrated into CI/CD pipeline
- [x] Security documentation created
- [ ] Team trained on security practices
- [ ] Snyk dashboard monitored weekly
- [ ] Incident response plan tested
