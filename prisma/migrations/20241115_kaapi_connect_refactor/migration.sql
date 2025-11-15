-- Kaapi Connect Migration: Phase 1-7 Comprehensive Schema Update
-- Adds all Kaapi Connect fields and removes old faith-based fields

-- ============================================
-- Create New Enums for Kaapi Connect
-- ============================================

-- Political Leaning Enum
DO $$ BEGIN
 CREATE TYPE "PoliticalLeaning" AS ENUM ('PROGRESSIVE', 'LIBERAL', 'MODERATE', 'CONSERVATIVE', 'APOLITICAL', 'PREFER_NOT_TO_SAY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Kerala District Enum
DO $$ BEGIN
 CREATE TYPE "KeralaDistrict" AS ENUM ('THIRUVANANTHAPURAM', 'KOLLAM', 'PATHANAMTHITTA', 'ALAPPUZHA', 'KOTTAYAM', 'IDUKKI', 'ERNAKULAM', 'THRISSUR', 'PALAKKAD', 'MALAPPURAM', 'KOZHIKODE', 'WAYANAD', 'KANNUR', 'KASARAGOD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Diaspora Location Enum
DO $$ BEGIN
 CREATE TYPE "DiasporaLocation" AS ENUM ('NONE', 'GULF_UAE', 'GULF_SAUDI', 'GULF_QATAR', 'GULF_KUWAIT', 'GULF_OMAN', 'GULF_BAHRAIN', 'USA', 'UK', 'AUSTRALIA', 'CANADA', 'EUROPE', 'SINGAPORE', 'OTHER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Kerala Connection Enum
DO $$ BEGIN
 CREATE TYPE "KeralaConnection" AS ENUM ('VERY_STRONG', 'MODERATE', 'WEAK');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Social Style Enum
DO $$ BEGIN
 CREATE TYPE "SocialStyle" AS ENUM ('INTROVERTED', 'EXTROVERTED', 'AMBIVERT', 'PREFER_NOT_TO_SAY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Update Profile Table - Add Kaapi Connect Fields
-- ============================================

-- Interests & Values (replaces faith fields)
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "interestTags" TEXT[] DEFAULT '{}';
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "politicalLeaning" "PoliticalLeaning";
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "socialValues" TEXT[] DEFAULT '{}';
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "socialStyle" "SocialStyle";

-- Relationship Goals
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "relationshipTimeline" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "wantChildren" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "livingArrangementPreference" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "relocationFlexibility" TEXT;

-- Communication & Personality
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "weekendPreference" TEXT[] DEFAULT '{}';
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "communicationStyle" TEXT;

-- Physical - Add default to languages if it doesn't have one
ALTER TABLE "Profile" ALTER COLUMN "languages" SET DEFAULT '{}';

-- Kerala Connection (location context)
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "homeDistrict" "KeralaDistrict";
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "diasporaLocation" "DiasporaLocation";
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "keralaConnection" "KeralaConnection";
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "languagePreference" TEXT;

-- ============================================
-- Update Profile Table - Remove Old Faith Fields
-- ============================================

-- Remove old faith-based columns (if they exist)
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "denomination";
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "churchName";
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "yearsAsBeliever";
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "isBaptized";
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "churchInvolvementLevel";
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "faithTestimony";

-- ============================================
-- Update PartnerPreferences Table - Add Kaapi Connect Fields
-- ============================================

-- Add defaults to existing array fields
ALTER TABLE "PartnerPreferences" ALTER COLUMN "educationLevels" SET DEFAULT '{}';
ALTER TABLE "PartnerPreferences" ALTER COLUMN "locations" SET DEFAULT '{}';

-- Interest & Values Preferences (replaces denominations)
ALTER TABLE "PartnerPreferences" ADD COLUMN IF NOT EXISTS "preferredInterests" TEXT[] DEFAULT '{}';
ALTER TABLE "PartnerPreferences" ADD COLUMN IF NOT EXISTS "preferredPoliticalLeanings" TEXT[] DEFAULT '{}';
ALTER TABLE "PartnerPreferences" ADD COLUMN IF NOT EXISTS "preferredSocialValues" TEXT[] DEFAULT '{}';
ALTER TABLE "PartnerPreferences" ADD COLUMN IF NOT EXISTS "preferredKeralaDistricts" TEXT[] DEFAULT '{}';
ALTER TABLE "PartnerPreferences" ADD COLUMN IF NOT EXISTS "okayWithDiaspora" BOOLEAN;

-- ============================================
-- Remove Old Faith Fields from PartnerPreferences
-- ============================================

-- Remove denominations array (replaced with preferredInterests)
ALTER TABLE "PartnerPreferences" DROP COLUMN IF EXISTS "denominations";

-- ============================================
-- Create Indexes for Kaapi Connect Fields
-- ============================================

-- Create indexes for filtering by Kaapi Connect fields
CREATE INDEX IF NOT EXISTS "Profile_homeDistrict_idx" ON "Profile"("homeDistrict");
CREATE INDEX IF NOT EXISTS "Profile_politicalLeaning_idx" ON "Profile"("politicalLeaning");

-- ============================================
-- Migration Complete
-- ============================================
-- This migration transforms the database from Believers Matrimony (faith-based)
-- to Kaapi Connect (secular, Kerala-first, interest-based matching).
