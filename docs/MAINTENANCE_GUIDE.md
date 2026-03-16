# Repository Maintenance Guide

## Overview

This guide outlines the maintenance procedures for the GPE Communications Tool to prevent bit rot and ensure long-term health.

---

## Monthly Maintenance Checklist

### Week 1: Dependencies & Security

- [ ] Review Dependabot PRs
- [ ] Run `npm outdated` and review major version updates
- [ ] Run `npm audit` and fix security vulnerabilities
- [ ] Update `package.json` with any manual dependency changes
- [ ] Test application thoroughly after updates

### Week 2: Code Quality

- [ ] Run `scripts/maintenance-check.sh`
- [ ] Review and address TODO/FIXME comments
- [ ] Check TypeScript strict mode compliance
- [ ] Review and update ESLint rules if needed
- [ ] Run bundle size analysis

### Week 3: Documentation

- [ ] Review and update README.md
- [ ] Update ARCHITECTURE.md with any changes
- [ ] Review API documentation
- [ ] Update ACCESS_CONTROL_SETUP.md if auth changes
- [ ] Check for broken links in documentation

### Week 4: Infrastructure & Monitoring

- [ ] Review AWS Amplify logs for errors
- [ ] Check Upstash Redis usage and performance
- [ ] Review Microsoft Graph API usage
- [ ] Check ServiceNow integration health
- [ ] Review and rotate secrets if needed

---

## Automated Maintenance

### GitHub Actions Workflows

**1. Dependency Updates** (`dependency-updates.yml`)
- Runs: Every Monday at 9 AM UTC
- Actions:
  - Checks for outdated packages
  - Runs security audit
  - Updates patch versions
  - Creates PR with changes

**2. Dependabot** (`dependabot.yml`)
- Runs: Weekly on Monday
- Actions:
  - Creates PRs for dependency updates
  - Groups minor/patch updates
  - Ignores major version updates (manual review)

**3. Health Check** (`health-check.yml`)
- Runs: Daily at 2 AM UTC
- Actions:
  - Verifies build succeeds
  - Runs TypeScript checks
  - Checks for broken links
  - Monitors bundle size

---

## Dependency Update Strategy

### Patch Updates (x.x.X)
- **Frequency**: Weekly (automated via Dependabot)
- **Risk**: Low
- **Action**: Auto-merge after CI passes

### Minor Updates (x.X.x)
- **Frequency**: Bi-weekly (automated PR, manual review)
- **Risk**: Medium
- **Action**: Review changelog, test, then merge

### Major Updates (X.x.x)
- **Frequency**: Quarterly (manual)
- **Risk**: High
- **Action**: 
  1. Review breaking changes
  2. Create feature branch
  3. Update code for compatibility
  4. Thorough testing
  5. Update documentation

---

## Critical Dependencies to Monitor

### Framework & Core
- `next` - Next.js framework
- `react` & `react-dom` - React library
- `typescript` - TypeScript compiler

### Authentication
- `next-auth` - Authentication library
- `@microsoft/microsoft-graph-client` - Microsoft Graph API

### Database & Caching
- `@upstash/redis` - Redis client
- `@supabase/supabase-js` - Supabase client (if used)

### UI Components
- `@radix-ui/*` - UI primitives
- `tailwindcss` - CSS framework

---

## Security Best Practices

### 1. Regular Security Audits
\`\`\`bash
# Run weekly
npm audit

# Fix automatically (review changes)
npm audit fix

# For high/critical only
npm audit fix --audit-level=high
\`\`\`

### 2. Dependency Scanning
- Enable GitHub Dependabot alerts
- Use Snyk for continuous monitoring
- Review security advisories

### 3. Secret Management
- Rotate secrets every 90 days
- Use AWS Secrets Manager or similar
- Never commit secrets to repository
- Audit secret access logs

### 4. Access Control
- Review user group memberships monthly
- Audit admin access quarterly
- Remove inactive users
- Review API permissions

---

## Performance Monitoring

### Metrics to Track

**Build Performance**
\`\`\`bash
# Check build time
time npm run build

# Analyze bundle size
npx @next/bundle-analyzer
\`\`\`

**Runtime Performance**
- Monitor Amplify CloudWatch metrics
- Track API response times
- Monitor Redis cache hit rates
- Review ServiceNow API latency

**User Experience**
- Core Web Vitals (LCP, FID, CLS)
- Time to Interactive (TTI)
- First Contentful Paint (FCP)

---

## Documentation Maintenance

### Keep Updated
- [ ] README.md - Project overview and setup
- [ ] ARCHITECTURE.md - System design decisions
- [ ] API documentation - Endpoint changes
- [ ] Environment variables - New/changed vars
- [ ] Deployment guides - Infrastructure changes

### Review Quarterly
- Architecture diagrams
- Cost estimates
- Integration documentation
- Troubleshooting guides

---

## Testing Strategy

### Automated Tests
\`\`\`bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test -- auth
\`\`\`

### Manual Testing Checklist
- [ ] Authentication flow (Microsoft login)
- [ ] Access control (different user groups)
- [ ] Communications form submission
- [ ] ServiceNow data display (when implemented)
- [ ] Admin dashboard functionality
- [ ] Mobile responsiveness

---

## Rollback Procedures

### If Update Breaks Production

**1. Immediate Rollback**
\`\`\`bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback in Amplify Console
# Amplify Console → Deployments → Redeploy previous version
\`\`\`

**2. Investigate**
- Check Amplify logs
- Review error messages
- Test locally with same versions

**3. Fix Forward**
- Create hotfix branch
- Fix issue
- Test thoroughly
- Deploy fix

---

## Long-term Health Indicators

### Green Flags ✅
- All CI/CD checks passing
- No security vulnerabilities
- Dependencies < 6 months old
- Documentation up to date
- Active maintenance commits
- Fast build times (< 2 minutes)

### Yellow Flags ⚠️
- Some dependencies 6-12 months old
- Minor security vulnerabilities
- Documentation slightly outdated
- Build time increasing
- TODO comments accumulating

### Red Flags 🚨
- Dependencies > 12 months old
- High/critical security vulnerabilities
- Build failing
- Documentation severely outdated
- No commits in 3+ months
- Performance degradation

---

## Useful Commands

\`\`\`bash
# Check for outdated packages
npm outdated

# Update all patch versions
npm update

# Update specific package
npm update package-name

# Check security vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for unused dependencies
npx depcheck

# Analyze bundle size
npx @next/bundle-analyzer

# Run maintenance check
./scripts/maintenance-check.sh

# Check TypeScript
npx tsc --noEmit

# Format code
npm run format

# Lint code
npm run lint
\`\`\`

---

## Emergency Contacts

- **AWS Support**: [AWS Support Center](https://console.aws.amazon.com/support)
- **GitHub Support**: support@github.com
- **Upstash Support**: support@upstash.com
- **Microsoft Support**: [Azure Support](https://azure.microsoft.com/support)

---

## Maintenance Schedule

| Task | Frequency | Owner | Automation |
|------|-----------|-------|------------|
| Dependency updates (patch) | Weekly | Dependabot | ✅ Automated |
| Security audit | Weekly | GitHub Actions | ✅ Automated |
| Health check | Daily | GitHub Actions | ✅ Automated |
| Major version updates | Quarterly | Team | ❌ Manual |
| Documentation review | Monthly | Team | ❌ Manual |
| Secret rotation | Quarterly | Team | ❌ Manual |
| Performance audit | Monthly | Team | ❌ Manual |
| Access control review | Monthly | Team | ❌ Manual |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-10 | Initial maintenance guide |

---

**Last Updated**: January 2025  
**Next Review**: April 2025
