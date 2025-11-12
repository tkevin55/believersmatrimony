#!/bin/bash
set -e

echo "🔧 Preparing database connections for build..."
echo ""

# If DIRECT_DATABASE_URL is not set, derive it from DATABASE_URL
if [ -z "$DIRECT_DATABASE_URL" ]; then
  echo "📝 DIRECT_DATABASE_URL not set, attempting to derive from DATABASE_URL..."

  if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set!"
    exit 1
  fi

  # Remove -pooler from the hostname to get direct connection
  export DIRECT_DATABASE_URL="${DATABASE_URL//-pooler/}"

  echo "Original DATABASE_URL contains: $(echo $DATABASE_URL | grep -o 'ep-[^.]*')"
  echo "Derived DIRECT_DATABASE_URL contains: $(echo $DIRECT_DATABASE_URL | grep -o 'ep-[^.]*')"
  echo "✅ Using derived DIRECT_DATABASE_URL for migrations"
else
  echo "✅ Using pre-configured DIRECT_DATABASE_URL"
fi

echo ""
echo "🔨 Step 1: Generate Prisma Client..."
npx prisma generate

echo ""
echo "🔨 Step 2: Deploy migrations to database..."
echo "Connecting to database for migrations..."

# Try to deploy migrations
if ! npx prisma migrate deploy 2>&1 | tee /tmp/migrate-output.log; then
  echo "⚠️  Migration deployment failed, checking error type..."

  # Check if it's a failed migration error (P3009)
  if grep -q "P3009" /tmp/migrate-output.log; then
    echo "Detected failed migration in database. This requires manual intervention."
    echo ""
    echo "❌ DEPLOYMENT FAILED: A previous migration failed and must be fixed manually."
    echo ""
    echo "To fix this:"
    echo "1. Check which migration failed"
    echo "2. Manually apply the migration SQL to the database"
    echo "3. Mark it as resolved: npx prisma migrate resolve --applied <migration-name>"
    echo "4. Then redeploy"
    echo ""
    exit 1
  else
    echo "Migration failed for unknown reason. Check logs above."
    exit 1
  fi
fi

echo "✅ All migrations applied successfully"

echo ""
echo "🔨 Step 3: Build Next.js application..."
next build

echo ""
echo "✅ Build completed successfully!"
