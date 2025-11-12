-- ============================================================================
-- COMPREHENSIVE DATABASE FIX AND VERIFICATION SCRIPT
-- Run this entire script in Neon SQL Editor
-- ============================================================================

-- STEP 1: Check what columns currently exist
-- ============================================================================
SELECT '=== CURRENT PROFILE COLUMNS ===' as step;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'Profile'
  AND column_name IN ('firstName', 'lastName', 'favoriteVerse', 'favoriteVerseReference', 'favoriteVerseWhy', 'isComplete')
ORDER BY column_name;

SELECT '=== CURRENT USER COLUMNS ===' as step;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'User'
  AND column_name IN ('resetToken', 'resetTokenExpiry')
ORDER BY column_name;

-- STEP 2: Add missing columns (IF NOT EXISTS prevents errors)
-- ============================================================================
SELECT '=== ADDING MISSING COLUMNS ===' as step;

ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "favoriteVerse" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "isComplete" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);

-- STEP 3: Add unique index if it doesn't exist
-- ============================================================================
SELECT '=== ADDING INDEX ===' as step;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'User_resetToken_key'
    ) THEN
        CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");
        RAISE NOTICE 'Created index User_resetToken_key';
    ELSE
        RAISE NOTICE 'Index User_resetToken_key already exists';
    END IF;
END $$;

-- STEP 4: Verify columns were added successfully
-- ============================================================================
SELECT '=== VERIFICATION: PROFILE COLUMNS ===' as step;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'Profile'
  AND column_name IN ('firstName', 'lastName', 'favoriteVerse', 'isComplete')
ORDER BY column_name;

SELECT '=== VERIFICATION: USER COLUMNS ===' as step;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'User'
  AND column_name IN ('resetToken', 'resetTokenExpiry')
ORDER BY column_name;

-- STEP 5: Check migration status
-- ============================================================================
SELECT '=== MIGRATION STATUS ===' as step;

SELECT
    migration_name,
    finished_at,
    rolled_back_at,
    CASE
        WHEN finished_at IS NOT NULL THEN 'COMPLETED'
        WHEN rolled_back_at IS NOT NULL THEN 'ROLLED_BACK'
        ELSE 'FAILED/PENDING'
    END as status
FROM "_prisma_migrations"
WHERE migration_name LIKE '%add_missing_profile_and_user_fields%'
ORDER BY started_at DESC;

-- STEP 6: Mark the migration as applied (this is safe now that we've manually run the SQL)
-- ============================================================================
SELECT '=== MARKING MIGRATION AS APPLIED ===' as step;

UPDATE "_prisma_migrations"
SET
    finished_at = CURRENT_TIMESTAMP,
    applied_steps_count = 1
WHERE migration_name = '20251112104907_add_missing_profile_and_user_fields'
  AND finished_at IS NULL;

-- STEP 7: Final verification - count rows
-- ============================================================================
SELECT '=== FINAL STATUS ===' as step;

SELECT
    'Profile' as table_name,
    COUNT(*) FILTER (WHERE column_name = 'firstName') as has_firstName,
    COUNT(*) FILTER (WHERE column_name = 'lastName') as has_lastName,
    COUNT(*) FILTER (WHERE column_name = 'favoriteVerse') as has_favoriteVerse,
    COUNT(*) FILTER (WHERE column_name = 'isComplete') as has_isComplete
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'Profile'
  AND column_name IN ('firstName', 'lastName', 'favoriteVerse', 'isComplete');

SELECT
    'User' as table_name,
    COUNT(*) FILTER (WHERE column_name = 'resetToken') as has_resetToken,
    COUNT(*) FILTER (WHERE column_name = 'resetTokenExpiry') as has_resetTokenExpiry
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'User'
  AND column_name IN ('resetToken', 'resetTokenExpiry');

SELECT '=== SCRIPT COMPLETE ===' as step;
