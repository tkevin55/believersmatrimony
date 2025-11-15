#!/bin/bash
# Automated Vercel Deployment Monitor
# Checks deployment status and provides detailed error logs

set -e

REPO="tkevin55/believersmatrimony"
BRANCH="claude/kaapi-connect-phase-1-analysis-01JvwQU12mFt3VUe7TYbmm4z"
MAX_WAIT=600  # 10 minutes
CHECK_INTERVAL=15  # Check every 15 seconds

echo "🔍 Vercel Deployment Monitor"
echo "================================"
echo "Repository: $REPO"
echo "Branch: $BRANCH"
echo ""

# Get latest commit SHA
echo "→ Getting latest commit..."
COMMIT_SHA=$(git rev-parse HEAD)
SHORT_SHA=$(git rev-parse --short HEAD)
echo "✓ Monitoring commit: $SHORT_SHA ($COMMIT_SHA)"
echo ""

# Function to check deployment status
check_deployment_status() {
  local sha=$1

  # Get check runs for this commit using GitHub API
  local response=$(gh api \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "/repos/$REPO/commits/$sha/check-runs" 2>/dev/null || echo "")

  if [ -z "$response" ]; then
    echo "error"
    return
  fi

  # Extract Vercel check run status
  local vercel_status=$(echo "$response" | grep -o '"name":"Vercel"' -A 20 | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
  local vercel_conclusion=$(echo "$response" | grep -o '"name":"Vercel"' -A 20 | grep -o '"conclusion":"[^"]*"' | head -1 | cut -d'"' -f4)
  local vercel_url=$(echo "$response" | grep -o '"name":"Vercel"' -A 30 | grep -o '"details_url":"[^"]*"' | head -1 | cut -d'"' -f4)

  # Store URL for later use
  echo "$vercel_url" > /tmp/vercel_deployment_url.txt

  if [ "$vercel_status" = "completed" ]; then
    echo "$vercel_conclusion"
  elif [ "$vercel_status" = "in_progress" ] || [ "$vercel_status" = "queued" ]; then
    echo "in_progress"
  else
    echo "unknown"
  fi
}

# Function to get deployment logs
get_deployment_logs() {
  echo ""
  echo "📋 Fetching Vercel Deployment Logs..."
  echo "================================"

  # Try to get logs from Vercel deployment URL
  local deployment_url=$(cat /tmp/vercel_deployment_url.txt 2>/dev/null || echo "")

  if [ -n "$deployment_url" ]; then
    echo "Deployment URL: $deployment_url"
  fi

  # Get check run details for more error info
  local response=$(gh api \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "/repos/$REPO/commits/$COMMIT_SHA/check-runs" 2>/dev/null || echo "")

  # Extract error output if available
  local output=$(echo "$response" | grep -o '"name":"Vercel"' -A 100 | grep -o '"text":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -n "$output" ]; then
    echo ""
    echo "Error Output:"
    echo "$output" | sed 's/\\n/\n/g'
  fi

  echo ""
  echo "💡 Suggested next steps:"
  echo "1. Check the Vercel dashboard: https://vercel.com/tkevin55/believersmatrimony/deployments"
  echo "2. Review build logs at: $deployment_url"
  echo "3. Common fixes:"
  echo "   - Migration errors: Check DATABASE_URL in Vercel env vars"
  echo "   - Build errors: Check package.json scripts"
  echo "   - Runtime errors: Check Next.js server logs"
}

# Monitor deployment with timeout
echo "⏳ Waiting for deployment to start..."
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
  STATUS=$(check_deployment_status "$COMMIT_SHA")

  case "$STATUS" in
    "success")
      echo ""
      echo "✅ Deployment SUCCEEDED!"
      echo "================================"
      DEPLOYMENT_URL=$(cat /tmp/vercel_deployment_url.txt 2>/dev/null || echo "")
      if [ -n "$DEPLOYMENT_URL" ]; then
        echo "🔗 View deployment: $DEPLOYMENT_URL"
      fi
      echo ""
      echo "🎉 Your app is live! You can now test the changes."
      rm -f /tmp/vercel_deployment_url.txt
      exit 0
      ;;

    "failure")
      echo ""
      echo "❌ Deployment FAILED"
      echo "================================"
      get_deployment_logs
      rm -f /tmp/vercel_deployment_url.txt
      exit 1
      ;;

    "in_progress")
      printf "\r⏳ Deployment in progress... (${ELAPSED}s elapsed)"
      sleep $CHECK_INTERVAL
      ELAPSED=$((ELAPSED + CHECK_INTERVAL))
      ;;

    "unknown"|"error")
      echo ""
      echo "⚠️  Could not determine deployment status"
      echo "Please check manually: https://vercel.com/tkevin55/believersmatrimony/deployments"
      rm -f /tmp/vercel_deployment_url.txt
      exit 1
      ;;
  esac
done

echo ""
echo "⏱️  Timeout reached (${MAX_WAIT}s)"
echo "Deployment is taking longer than expected."
echo "Check status manually: https://vercel.com/tkevin55/believersmatrimony/deployments"
rm -f /tmp/vercel_deployment_url.txt
exit 1
