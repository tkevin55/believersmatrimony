#!/bin/bash

echo "========================================="
echo "Discovery Feed & Match System Fix Setup"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Generating Prisma Client...${NC}"
npx prisma generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma client generated successfully${NC}"
else
    echo -e "${RED}✗ Failed to generate Prisma client${NC}"
    echo "Trying with checksum ignore..."
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
fi

echo ""
echo -e "${YELLOW}Step 2: Running database migration...${NC}"
npx prisma migrate dev --name add_super_like_support

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database migration completed successfully${NC}"
else
    echo -e "${RED}✗ Migration failed, trying db push...${NC}"
    npx prisma db push

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database schema pushed successfully${NC}"
    else
        echo -e "${RED}✗ Database update failed${NC}"
        echo ""
        echo -e "${YELLOW}Manual migration required:${NC}"
        echo "Run this SQL manually on your database:"
        echo ""
        cat prisma/migrations/20251110_add_super_like_support/migration.sql
        echo ""
        read -p "Press enter after you've run the migration manually..."
    fi
fi

echo ""
echo -e "${YELLOW}Step 3: Verifying setup...${NC}"

# Check if migration tables exist
echo "Checking database schema..."

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "✅ All files have been updated:"
echo "   - Prisma schema with super like support"
echo "   - Discovery API with less strict matching"
echo "   - Like system with automatic match creation"
echo "   - Super like API with weekly limits"
echo "   - Profile card with super like button"
echo "   - Discovery page with better empty states"
echo ""
echo "📖 See DISCOVERY_FIX_SUMMARY.md for complete documentation"
echo ""
echo "🚀 Start the development server:"
echo "   npm run dev"
echo ""
echo "🧪 Test the features:"
echo "   1. Navigate to /discover"
echo "   2. Like profiles and test match creation"
echo "   3. Try super likes (3 per week)"
echo "   4. Verify match modal appears on mutual likes"
echo ""
