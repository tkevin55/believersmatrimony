#!/bin/bash
set -e

echo "🔧 Preparing database connections for build..."

# If DIRECT_DATABASE_URL is not set, derive it from DATABASE_URL
if [ -z "$DIRECT_DATABASE_URL" ]; then
  echo "📝 DIRECT_DATABASE_URL not set, deriving from DATABASE_URL..."

  # Remove -pooler from the hostname to get direct connection
  export DIRECT_DATABASE_URL="${DATABASE_URL//-pooler/}"

  echo "✅ Using derived DIRECT_DATABASE_URL for migrations"
else
  echo "✅ Using existing DIRECT_DATABASE_URL"
fi

echo ""
echo "🔨 Step 1: Generate Prisma Client..."
npx prisma generate

echo ""
echo "🔨 Step 2: Deploy migrations to database..."
npx prisma migrate deploy

echo ""
echo "🔨 Step 3: Build Next.js application..."
next build

echo ""
echo "✅ Build completed successfully!"
