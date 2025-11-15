#!/bin/bash
# Deploy and Monitor - Automated deployment workflow
# Usage: ./scripts/deploy-and-monitor.sh "commit message"

set -e

COMMIT_MSG="${1:-Update codebase}"

echo "🚀 Automated Deploy & Monitor Workflow"
echo "======================================="
echo ""

# Step 1: Git status
echo "📊 Git Status:"
git status --short
echo ""

# Step 2: Stage and commit
echo "→ Staging changes..."
git add -A

if git diff --staged --quiet; then
  echo "⚠️  No changes to commit"
  echo ""
  echo "Checking current deployment status anyway..."
  ./scripts/monitor-deployment.sh
  exit 0
fi

echo "→ Creating commit..."
git commit -m "$COMMIT_MSG"
COMMIT_SHA=$(git rev-parse --short HEAD)
echo "✓ Created commit: $COMMIT_SHA"
echo ""

# Step 3: Push with retry logic
echo "→ Pushing to remote..."
MAX_RETRIES=4
RETRY_COUNT=0
RETRY_DELAY=2

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if git push -u origin claude/kaapi-connect-phase-1-analysis-01JvwQU12mFt3VUe7TYbmm4z; then
    echo "✓ Push successful"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "⚠️  Push failed, retrying in ${RETRY_DELAY}s... (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)"
      sleep $RETRY_DELAY
      RETRY_DELAY=$((RETRY_DELAY * 2))
    else
      echo "❌ Push failed after $MAX_RETRIES attempts"
      exit 1
    fi
  fi
done

echo ""
echo "✓ Code pushed successfully!"
echo ""

# Step 4: Monitor deployment
echo "→ Starting deployment monitor..."
echo ""
node scripts/check-vercel-status.js
