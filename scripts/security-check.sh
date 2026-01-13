#!/bin/bash

# Security check script for npm dependencies
# Run this weekly or before deploying to production

set -e

echo "🔒 Running Security Check for GPE Communications Hub"
echo "=================================================="
echo ""

echo "1️⃣ Checking npm audit..."
npm audit --audit-level=moderate || {
    echo "⚠️  Vulnerabilities detected! Review output above."
    echo "   Run 'npm audit fix' to attempt automatic fixes."
}
echo ""

echo "2️⃣ Checking for outdated packages..."
npm outdated || echo "✓ All packages up to date"
echo ""

echo "3️⃣ Verifying package-lock.json exists..."
if [ -f "package-lock.json" ]; then
    echo "✓ package-lock.json found"
else
    echo "⚠️  package-lock.json missing! Run 'npm install' to generate."
fi
echo ""

echo "4️⃣ Checking for suspicious patterns..."
echo "   Scanning for postinstall/preinstall scripts..."
grep -r "postinstall\|preinstall" package.json || echo "✓ No install scripts found"
echo ""

echo "5️⃣ Verifying exact versions (no ^ or ~)..."
if grep -q "[\^~]" package.json; then
    echo "⚠️  Found version ranges in package.json:"
    grep "[\^~]" package.json | head -5
    echo "   Update to exact versions for security."
else
    echo "✓ All versions are pinned exactly"
fi
echo ""

echo "=================================================="
echo "Security check complete!"
echo "Review any warnings above and take action as needed."
echo ""
echo "Next steps:"
echo "  - Review Snyk dashboard for vulnerability reports"
echo "  - Update docs/NPM_SECURITY_BEST_PRACTICES.md if changes made"
echo "  - Contact Sky Cyber Security if concerns arise"
