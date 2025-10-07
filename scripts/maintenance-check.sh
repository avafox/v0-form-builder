#!/bin/bash

# Repository Maintenance Health Check Script
# Run this monthly to check repository health

set -e

echo "🔍 GPE Communications Tool - Maintenance Check"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "Current: $NODE_VERSION"
echo "Required: v20.x or higher"
echo ""

# Check for outdated packages
echo "📚 Checking for outdated packages..."
npm outdated || echo "Some packages are outdated"
echo ""

# Security audit
echo "🔒 Running security audit..."
npm audit --audit-level=moderate
echo ""

# Check for unused dependencies
echo "🧹 Checking for unused dependencies..."
npx depcheck || echo "Install depcheck: npm install -g depcheck"
echo ""

# Check TypeScript compilation
echo "📝 Checking TypeScript compilation..."
npx tsc --noEmit
echo -e "${GREEN}✓ TypeScript check passed${NC}"
echo ""

# Check build
echo "🏗️  Testing build..."
npm run build
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Check for TODO/FIXME comments
echo "📋 Checking for TODO/FIXME comments..."
TODO_COUNT=$(grep -r "TODO\|FIXME" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | wc -l)
echo "Found $TODO_COUNT TODO/FIXME comments"
if [ $TODO_COUNT -gt 0 ]; then
    echo -e "${YELLOW}Consider addressing these items${NC}"
fi
echo ""

# Check documentation freshness
echo "📖 Checking documentation..."
DOCS_MODIFIED=$(find docs -name "*.md" -mtime +90 | wc -l)
if [ $DOCS_MODIFIED -gt 0 ]; then
    echo -e "${YELLOW}Warning: $DOCS_MODIFIED documentation files haven't been updated in 90+ days${NC}"
else
    echo -e "${GREEN}✓ Documentation is up to date${NC}"
fi
echo ""

# Check for large files
echo "📊 Checking for large files..."
find . -type f -size +1M -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./.git/*"
echo ""

# Check environment variables
echo "🔐 Checking environment variables..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓ .env.example exists${NC}"
else
    echo -e "${RED}✗ .env.example missing${NC}"
fi
echo ""

# Summary
echo "=============================================="
echo "✅ Maintenance check complete!"
echo ""
echo "Next steps:"
echo "1. Review outdated packages and update"
echo "2. Address security vulnerabilities"
echo "3. Remove unused dependencies"
echo "4. Update documentation if needed"
echo "5. Address TODO/FIXME comments"
echo ""
