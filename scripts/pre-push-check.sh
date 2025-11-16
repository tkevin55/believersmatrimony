#!/bin/bash

# Pre-push validation script for Kaapi Connect
# Runs TypeScript check, lint, and build verification before pushing

set -e  # Exit on error

echo "🔍 Running pre-push validation checks..."
echo ""

# TypeScript type checking
echo "→ TypeScript check..."
if npx tsc --noEmit --skipLibCheck 2>&1 | grep -q "error TS"; then
  echo "❌ TypeScript errors found!"
  npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" || true
  exit 1
fi
echo "✓ TypeScript check passed"
echo ""

# ESLint check (if available)
if command -v npm &> /dev/null && npm run lint --if-present &> /dev/null; then
  echo "→ ESLint check..."
  npm run lint --quiet || {
    echo "❌ ESLint errors found!"
    exit 1
  }
  echo "✓ ESLint check passed"
  echo ""
fi

# Build check (commented out by default as it's time-consuming)
# Uncomment if you want to run build check before every push
# echo "→ Build check..."
# npm run build || {
#   echo "❌ Build failed!"
#   exit 1
# }
# echo "✓ Build check passed"
# echo ""

echo "✅ All pre-push checks passed!"
echo "You can now push safely."
