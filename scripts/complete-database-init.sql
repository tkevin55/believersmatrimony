-- ============================================================================
-- COMPLETE DATABASE INITIALIZATION SCRIPT
-- Run this in Neon SQL Editor to create all missing tables and columns
-- ============================================================================

-- This script is idempotent - safe to run multiple times
-- All CREATE statements use IF NOT EXISTS
-- All ALTER TABLE statements check for existence first

-- Add missing columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);

-- Add missing columns to Profile table
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "favoriteVerse" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "isComplete" BOOLEAN NOT NULL DEFAULT false;

-- Create UserInterest table if it doesn't exist
CREATE TABLE IF NOT EXISTS "UserInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "interestOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserInterest_interestOptionId_fkey" FOREIGN KEY ("interestOptionId") REFERENCES "InterestOption"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserInterest_userId_interestOptionId_key" UNIQUE ("userId", "interestOptionId")
);

-- Create InterestOption table if it doesn't exist
CREATE TABLE IF NOT EXISTS "InterestOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Prompt table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PromptCategory') THEN
        CREATE TYPE "PromptCategory" AS ENUM (
            'FAITH_AND_BELIEF',
            'PERSONALITY_AND_DAILY_LIFE',
            'RELATIONSHIP_AND_MARRIAGE',
            'LIFESTYLE_AND_MISSION',
            'CREATIVITY_AND_FUN'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Prompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" "PromptCategory" NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create PromptAnswer table if it doesn't exist
CREATE TABLE IF NOT EXISTS "PromptAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PromptAnswer_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PromptAnswer_userId_promptId_key" UNIQUE ("userId", "promptId")
);

-- Create PaymentLog table if it doesn't exist
CREATE TABLE IF NOT EXISTS "PaymentLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "tier" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'RAZORPAY',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "refundId" TEXT,
    "refundAmount" DOUBLE PRECISION,
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes if they don't exist
DO $$
BEGIN
    -- User indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_resetToken_key') THEN
        CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");
    END IF;

    -- UserInterest indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'UserInterest_userId_idx') THEN
        CREATE INDEX "UserInterest_userId_idx" ON "UserInterest"("userId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'UserInterest_interestOptionId_idx') THEN
        CREATE INDEX "UserInterest_interestOptionId_idx" ON "UserInterest"("interestOptionId");
    END IF;

    -- InterestOption indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'InterestOption_category_idx') THEN
        CREATE INDEX "InterestOption_category_idx" ON "InterestOption"("category");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'InterestOption_isActive_idx') THEN
        CREATE INDEX "InterestOption_isActive_idx" ON "InterestOption"("isActive");
    END IF;

    -- Prompt indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Prompt_category_idx') THEN
        CREATE INDEX "Prompt_category_idx" ON "Prompt"("category");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Prompt_isActive_idx') THEN
        CREATE INDEX "Prompt_isActive_idx" ON "Prompt"("isActive");
    END IF;

    -- PromptAnswer indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'PromptAnswer_userId_idx') THEN
        CREATE INDEX "PromptAnswer_userId_idx" ON "PromptAnswer"("userId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'PromptAnswer_promptId_idx') THEN
        CREATE INDEX "PromptAnswer_promptId_idx" ON "PromptAnswer"("promptId");
    END IF;

    -- PaymentLog indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'PaymentLog_userId_idx') THEN
        CREATE INDEX "PaymentLog_userId_idx" ON "PaymentLog"("userId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'PaymentLog_orderId_idx') THEN
        CREATE INDEX "PaymentLog_orderId_idx" ON "PaymentLog"("orderId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'PaymentLog_paymentId_idx') THEN
        CREATE INDEX "PaymentLog_paymentId_idx" ON "PaymentLog"("paymentId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'PaymentLog_status_idx') THEN
        CREATE INDEX "PaymentLog_status_idx" ON "PaymentLog"("status");
    END IF;
END $$;

-- Seed initial Interest Options (if table is empty)
INSERT INTO "InterestOption" (id, name, emoji, category, "order", "isActive")
SELECT * FROM (VALUES
    ('int_' || gen_random_uuid()::text, 'Reading', '📚', 'HOBBIES', 1, true),
    ('int_' || gen_random_uuid()::text, 'Traveling', '✈️', 'HOBBIES', 2, true),
    ('int_' || gen_random_uuid()::text, 'Cooking', '🍳', 'HOBBIES', 3, true),
    ('int_' || gen_random_uuid()::text, 'Music', '🎵', 'HOBBIES', 4, true),
    ('int_' || gen_random_uuid()::text, 'Sports', '⚽', 'HOBBIES', 5, true),
    ('int_' || gen_random_uuid()::text, 'Bible Study', '📖', 'FAITH', 6, true),
    ('int_' || gen_random_uuid()::text, 'Prayer', '🙏', 'FAITH', 7, true),
    ('int_' || gen_random_uuid()::text, 'Worship', '🎶', 'FAITH', 8, true),
    ('int_' || gen_random_uuid()::text, 'Ministry', '⛪', 'FAITH', 9, true),
    ('int_' || gen_random_uuid()::text, 'Missions', '🌍', 'FAITH', 10, true)
) AS v(id, name, emoji, category, "order", "isActive")
WHERE NOT EXISTS (SELECT 1 FROM "InterestOption" LIMIT 1);

-- Seed initial Prompts (if table is empty)
INSERT INTO "Prompt" (id, category, text, "order", "isActive")
SELECT * FROM (VALUES
    ('prompt_' || gen_random_uuid()::text, 'FAITH_AND_BELIEF'::\"PromptCategory\", 'What Bible verse or passage has had the biggest impact on your life, and why?', 1, true),
    ('prompt_' || gen_random_uuid()::text, 'FAITH_AND_BELIEF'::\"PromptCategory\", 'How do you incorporate your faith into your daily routine?', 2, true),
    ('prompt_' || gen_random_uuid()::text, 'PERSONALITY_AND_DAILY_LIFE'::\"PromptCategory\", 'What are your top 3 hobbies or interests?', 3, true),
    ('prompt_' || gen_random_uuid()::text, 'RELATIONSHIP_AND_MARRIAGE'::\"PromptCategory\", 'What does a Christ-centered relationship look like to you?', 4, true),
    ('prompt_' || gen_random_uuid()::text, 'LIFESTYLE_AND_MISSION'::\"PromptCategory\", 'Describe your perfect Sunday', 5, true),
    ('prompt_' || gen_random_uuid()::text, 'CREATIVITY_AND_FUN'::\"PromptCategory\", 'If you could travel anywhere for a mission trip, where would you go?', 6, true)
) AS v(id, category, text, "order", "isActive")
WHERE NOT EXISTS (SELECT 1 FROM "Prompt" LIMIT 1);

-- Mark migrations as applied (if they exist in _prisma_migrations table)
UPDATE "_prisma_migrations"
SET finished_at = COALESCE(finished_at, CURRENT_TIMESTAMP),
    applied_steps_count = 1
WHERE migration_name IN (
    '20251112003032_add_payment_log',
    '20251112104907_add_missing_profile_and_user_fields'
)
AND finished_at IS NULL;

-- Final verification
SELECT '=== VERIFICATION COMPLETE ===' as status;

SELECT 'Missing columns added:' as check_type, COUNT(*) as count
FROM information_schema.columns
WHERE table_name IN ('User', 'Profile')
  AND column_name IN ('resetToken', 'resetTokenExpiry', 'firstName', 'lastName', 'favoriteVerse', 'isComplete');

SELECT 'Tables created:' as check_type, COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('UserInterest', 'InterestOption', 'Prompt', 'PromptAnswer', 'PaymentLog');

SELECT 'Interest options seeded:' as check_type, COUNT(*) as count
FROM "InterestOption";

SELECT 'Prompts seeded:' as check_type, COUNT(*) as count
FROM "Prompt";
