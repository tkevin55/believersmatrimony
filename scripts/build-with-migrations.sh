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
npx prisma migrate deploy

echo ""
echo "🔨 Step 3: Build Next.js application..."
next build

echo ""
echo "✅ Build completed successfully!"
