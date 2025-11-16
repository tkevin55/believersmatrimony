/**
 * Kaapi Connect Onboarding Migration Script
 *
 * PURPOSE:
 * Marks existing users as onboardingCompleted = true if their profiles are
 * "complete enough" to be eligible for Discover feed matching.
 *
 * CRITERIA FOR "COMPLETE ENOUGH":
 * - User status = ACTIVE
 * - User onboardingCompleted = false (not already completed)
 * - Has a Profile record
 * - Profile.gender IS NOT NULL
 * - Profile.dateOfBirth IS NOT NULL
 * - Profile has location (city OR homeDistrict IS NOT NULL)
 *
 * USAGE:
 *
 * DRY RUN (default - shows what would be updated without making changes):
 *   npx tsx scripts/migrate-onboarding-kaapi.ts
 *
 * REAL RUN (actually updates the database):
 *   DRY_RUN=false npx tsx scripts/migrate-onboarding-kaapi.ts
 *
 * REQUIREMENTS:
 * - DATABASE_URL environment variable must be set (Neon Postgres connection)
 * - Run from project root
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface MigrationStats {
  totalUsers: number
  alreadyOnboarded: number
  candidatesFound: number
  candidatesUpdated: number
}

async function migrateOnboardingStatus() {
  const isDryRun = process.env.DRY_RUN !== 'false'

  console.log('=' .repeat(80))
  console.log('KAAPI CONNECT - ONBOARDING MIGRATION')
  console.log('=' .repeat(80))
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (no changes will be made)' : '⚠️  REAL RUN (database will be updated)'}`)
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'NOT CONFIGURED'}`)
  console.log()

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set')
    console.error('   Please set DATABASE_URL to your Neon Postgres connection string')
    process.exit(1)
  }

  const stats: MigrationStats = {
    totalUsers: 0,
    alreadyOnboarded: 0,
    candidatesFound: 0,
    candidatesUpdated: 0,
  }

  try {
    // Step 1: Get total users count
    stats.totalUsers = await prisma.user.count()
    console.log(`📊 Total users in database: ${stats.totalUsers}`)

    // Step 2: Get already onboarded count
    stats.alreadyOnboarded = await prisma.user.count({
      where: { onboardingCompleted: true },
    })
    console.log(`✅ Already onboarded: ${stats.alreadyOnboarded}`)
    console.log(`❌ Not yet onboarded: ${stats.totalUsers - stats.alreadyOnboarded}`)
    console.log()

    // Step 3: Find candidate users who should be marked as onboarded
    console.log('🔍 Searching for candidates with "complete enough" profiles...')
    console.log()

    const candidates = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        onboardingCompleted: false,
        profile: {
          AND: [
            { gender: { not: null } },
            { dateOfBirth: { not: null } },
            {
              OR: [
                { city: { not: null } },
                { homeDistrict: { not: null } },
              ],
            },
          ],
        },
      },
      include: {
        profile: {
          select: {
            id: true,
            gender: true,
            dateOfBirth: true,
            city: true,
            homeDistrict: true,
            interestTags: true,
            politicalLeaning: true,
            isVisible: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    stats.candidatesFound = candidates.length

    console.log(`📋 Found ${stats.candidatesFound} candidate(s) to update`)
    console.log()

    if (stats.candidatesFound === 0) {
      console.log('✅ No candidates found. All eligible users are already onboarded.')
      console.log()
      return stats
    }

    // Step 4: Show sample of candidates
    const sampleSize = Math.min(10, candidates.length)
    console.log(`📝 Sample of ${sampleSize} candidate(s):`)
    console.log('-'.repeat(80))

    candidates.slice(0, sampleSize).forEach((user, index) => {
      console.log(`\n[${index + 1}] User ID: ${user.id}`)
      console.log(`    Email: ${user.email}`)
      console.log(`    Name: ${user.name || 'N/A'}`)
      console.log(`    Status: ${user.status}`)
      console.log(`    Profile:`)
      console.log(`      Gender: ${user.profile?.gender || 'N/A'}`)
      console.log(`      DOB: ${user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toLocaleDateString() : 'N/A'}`)
      console.log(`      City: ${user.profile?.city || 'N/A'}`)
      console.log(`      Home District: ${user.profile?.homeDistrict || 'N/A'}`)
      console.log(`      Interest Tags: ${user.profile?.interestTags?.length || 0} tags`)
      console.log(`      Political Leaning: ${user.profile?.politicalLeaning || 'N/A'}`)
      console.log(`      Visible: ${user.profile?.isVisible ? 'Yes' : 'No'}`)
    })

    if (candidates.length > sampleSize) {
      console.log(`\n... and ${candidates.length - sampleSize} more candidate(s)`)
    }

    console.log()
    console.log('-'.repeat(80))
    console.log()

    // Step 5: Update candidates (only if NOT dry run)
    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - No changes made to database')
      console.log()
      console.log('To perform the actual migration, run:')
      console.log('  DRY_RUN=false npx tsx scripts/migrate-onboarding-kaapi.ts')
      console.log()
    } else {
      console.log('⚠️  REAL RUN MODE - Updating database...')
      console.log()

      const updateResult = await prisma.user.updateMany({
        where: {
          status: 'ACTIVE',
          onboardingCompleted: false,
          profile: {
            AND: [
              { gender: { not: null } },
              { dateOfBirth: { not: null } },
              {
                OR: [
                  { city: { not: null } },
                  { homeDistrict: { not: null } },
                ],
              },
            ],
          },
        },
        data: {
          onboardingCompleted: true,
        },
      })

      stats.candidatesUpdated = updateResult.count

      console.log(`✅ Successfully updated ${stats.candidatesUpdated} user(s)`)
      console.log()

      // Verify the update
      const newOnboardedCount = await prisma.user.count({
        where: { onboardingCompleted: true },
      })

      console.log('📊 Post-migration stats:')
      console.log(`   Before: ${stats.alreadyOnboarded} onboarded`)
      console.log(`   After:  ${newOnboardedCount} onboarded`)
      console.log(`   Change: +${newOnboardedCount - stats.alreadyOnboarded}`)
      console.log()
    }

    return stats
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateOnboardingStatus()
  .then((stats) => {
    console.log('=' .repeat(80))
    console.log('MIGRATION SUMMARY')
    console.log('=' .repeat(80))
    console.log(`Total users:           ${stats.totalUsers}`)
    console.log(`Already onboarded:     ${stats.alreadyOnboarded}`)
    console.log(`Candidates found:      ${stats.candidatesFound}`)
    console.log(`Candidates updated:    ${stats.candidatesUpdated}`)
    console.log('=' .repeat(80))
    console.log()
    console.log('✅ Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed with error:', error)
    process.exit(1)
  })
