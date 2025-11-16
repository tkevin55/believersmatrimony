/**
 * Database Inspection Script for Kaapi Connect
 *
 * READ-ONLY analysis of the Neon database to:
 * 1. Understand current state of users/profiles
 * 2. Diagnose why Discover returns 0 profiles
 * 3. Check old Believers fields vs new Kaapi fields
 *
 * Run with: npx tsx scripts/inspect-db-kaapi.ts
 */

import { Client } from 'pg'

// Environment variables should be loaded from .env automatically by Next.js

interface QueryResult {
  title: string
  data: any[]
}

async function inspectDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('✅ Connected to Neon database\n')
    console.log('=' .repeat(80))
    console.log('DATABASE REALITY CHECK - KAAPI CONNECT')
    console.log('=' .repeat(80))
    console.log()

    // ============================================================================
    // 1. TOTAL COUNTS
    // ============================================================================
    console.log('📊 SECTION 1: TOTAL COUNTS')
    console.log('-'.repeat(80))

    const totalUsers = await client.query('SELECT COUNT(*) AS count FROM "User"')
    console.log(`Total Users: ${totalUsers.rows[0].count}`)

    const totalProfiles = await client.query('SELECT COUNT(*) AS count FROM "Profile"')
    console.log(`Total Profiles: ${totalProfiles.rows[0].count}`)

    const totalPhotos = await client.query('SELECT COUNT(*) AS count FROM "Photo"')
    console.log(`Total Photos: ${totalPhotos.rows[0].count}`)

    const totalLikes = await client.query('SELECT COUNT(*) AS count FROM "Like"')
    console.log(`Total Likes: ${totalLikes.rows[0].count}`)

    const totalMatches = await client.query('SELECT COUNT(*) AS count FROM "Match"')
    console.log(`Total Matches: ${totalMatches.rows[0].count}`)

    const totalPrompts = await client.query('SELECT COUNT(*) AS count FROM "PersonalityPrompt"')
    console.log(`Total Personality Prompts: ${totalPrompts.rows[0].count}`)

    console.log()

    // ============================================================================
    // 2. ONBOARDING STATUS
    // ============================================================================
    console.log('📋 SECTION 2: ONBOARDING STATUS')
    console.log('-'.repeat(80))

    const onboardingStatus = await client.query(`
      SELECT
        "onboardingCompleted",
        COUNT(*) AS count
      FROM "User"
      GROUP BY "onboardingCompleted"
      ORDER BY "onboardingCompleted"
    `)
    console.log('User Onboarding Status:')
    onboardingStatus.rows.forEach(row => {
      console.log(`  ${row.onboardingCompleted ? '✅ Completed' : '❌ Not Completed'}: ${row.count}`)
    })

    const profileVisibility = await client.query(`
      SELECT
        "isVisible",
        COUNT(*) AS count
      FROM "Profile"
      GROUP BY "isVisible"
      ORDER BY "isVisible" DESC
    `)
    console.log('\nProfile Visibility:')
    profileVisibility.rows.forEach(row => {
      console.log(`  ${row.isVisible ? '👁️  Visible' : '🔒 Hidden'}: ${row.count}`)
    })

    const userStatus = await client.query(`
      SELECT
        "status",
        COUNT(*) AS count
      FROM "User"
      GROUP BY "status"
      ORDER BY "status"
    `)
    console.log('\nUser Status:')
    userStatus.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`)
    })

    console.log()

    // ============================================================================
    // 3. DISCOVER ELIGIBILITY
    // ============================================================================
    console.log('🔍 SECTION 3: DISCOVER ELIGIBILITY (CRITICAL FILTERS)')
    console.log('-'.repeat(80))

    // Profiles that meet ALL basic requirements for Discover
    const discoverEligible = await client.query(`
      SELECT COUNT(*) AS count
      FROM "Profile" p
      INNER JOIN "User" u ON p."userId" = u.id
      WHERE p."isVisible" = true
        AND u."status" = 'ACTIVE'
        AND u."onboardingCompleted" = true
    `)
    console.log(`Profiles eligible for Discover: ${discoverEligible.rows[0].count}`)

    // Breakdown by gender
    const genderBreakdown = await client.query(`
      SELECT
        p."gender",
        COUNT(*) AS count
      FROM "Profile" p
      INNER JOIN "User" u ON p."userId" = u.id
      WHERE p."isVisible" = true
        AND u."status" = 'ACTIVE'
        AND u."onboardingCompleted" = true
      GROUP BY p."gender"
      ORDER BY p."gender"
    `)
    console.log('\nEligible Profiles by Gender:')
    genderBreakdown.rows.forEach(row => {
      console.log(`  ${row.gender}: ${row.count}`)
    })

    console.log()

    // ============================================================================
    // 4. KAAPI CONNECT FIELDS (NEW)
    // ============================================================================
    console.log('🌟 SECTION 4: KAAPI CONNECT FIELDS POPULATION')
    console.log('-'.repeat(80))

    const kaapiFields = await client.query(`
      SELECT
        COUNT(*) FILTER (WHERE "interestTags" IS NOT NULL AND CARDINALITY("interestTags") > 0) AS profiles_with_interests,
        COUNT(*) FILTER (WHERE "homeDistrict" IS NOT NULL) AS profiles_with_home_district,
        COUNT(*) FILTER (WHERE "diasporaLocation" IS NOT NULL) AS profiles_with_diaspora,
        COUNT(*) FILTER (WHERE "keralaConnection" IS NOT NULL) AS profiles_with_kerala_connection,
        COUNT(*) FILTER (WHERE "politicalLeaning" IS NOT NULL) AS profiles_with_politics,
        COUNT(*) FILTER (WHERE "socialValues" IS NOT NULL AND CARDINALITY("socialValues") > 0) AS profiles_with_social_values,
        COUNT(*) FILTER (WHERE "weekendPreference" IS NOT NULL AND CARDINALITY("weekendPreference") > 0) AS profiles_with_weekend_pref
      FROM "Profile"
    `)
    const kaapiData = kaapiFields.rows[0]
    console.log(`Interest Tags: ${kaapiData.profiles_with_interests} profiles`)
    console.log(`Home District: ${kaapiData.profiles_with_home_district} profiles`)
    console.log(`Diaspora Location: ${kaapiData.profiles_with_diaspora} profiles`)
    console.log(`Kerala Connection: ${kaapiData.profiles_with_kerala_connection} profiles`)
    console.log(`Political Leaning: ${kaapiData.profiles_with_politics} profiles`)
    console.log(`Social Values: ${kaapiData.profiles_with_social_values} profiles`)
    console.log(`Weekend Preference: ${kaapiData.profiles_with_weekend_pref} profiles`)

    console.log()

    // ============================================================================
    // 5. LEGACY BELIEVERS FIELDS (OLD)
    // ============================================================================
    console.log('⛪ SECTION 5: LEGACY BELIEVERS FIELDS (CHECK IF STILL PRESENT)')
    console.log('-'.repeat(80))

    try {
      const believersFields = await client.query(`
        SELECT
          COUNT(*) FILTER (WHERE "denomination" IS NOT NULL) AS profiles_with_denomination,
          COUNT(*) FILTER (WHERE "churchName" IS NOT NULL) AS profiles_with_church
        FROM "Profile"
      `)
      const believersData = believersFields.rows[0]
      console.log(`Denomination: ${believersData.profiles_with_denomination} profiles (legacy field)`)
      console.log(`Church Name: ${believersData.profiles_with_church} profiles (legacy field)`)
    } catch (error: any) {
      if (error.message.includes('does not exist')) {
        console.log('✅ Legacy Believers fields (denomination, churchName) have been removed from schema')
      } else {
        console.log(`⚠️  Error checking legacy fields: ${error.message}`)
      }
    }

    console.log()

    // ============================================================================
    // 6. SAMPLE PROFILES
    // ============================================================================
    console.log('👤 SECTION 6: SAMPLE PROFILES (10 MOST RECENT)')
    console.log('-'.repeat(80))

    const sampleProfiles = await client.query(`
      SELECT
        p.id,
        p."userId",
        u.name,
        p."dateOfBirth",
        EXTRACT(YEAR FROM AGE(p."dateOfBirth")) AS age,
        p.gender,
        p."homeDistrict",
        p."diasporaLocation",
        p."keralaConnection",
        p."interestTags",
        p."politicalLeaning",
        p."isVisible",
        u."onboardingCompleted",
        u.status,
        p.city,
        p.state
      FROM "Profile" p
      INNER JOIN "User" u ON p."userId" = u.id
      ORDER BY p."createdAt" DESC
      LIMIT 10
    `)

    sampleProfiles.rows.forEach((profile, index) => {
      console.log(`\n[${index + 1}] Profile ID: ${profile.id}`)
      console.log(`    Name: ${profile.name || 'N/A'}`)
      console.log(`    Age: ${profile.age} | Gender: ${profile.gender}`)
      console.log(`    Location: ${profile.city || 'N/A'}, ${profile.state || 'N/A'}`)
      console.log(`    Home District: ${profile.homeDistrict || 'N/A'}`)
      console.log(`    Diaspora: ${profile.diasporaLocation || 'N/A'}`)
      console.log(`    Kerala Connection: ${profile.keralaConnection || 'N/A'}`)
      console.log(`    Interest Tags: ${profile.interestTags?.length || 0} tags`)
      console.log(`    Political Leaning: ${profile.politicalLeaning || 'N/A'}`)
      console.log(`    Visible: ${profile.isVisible ? 'Yes' : 'No'} | Onboarding: ${profile.onboardingCompleted ? 'Yes' : 'No'} | Status: ${profile.status}`)
    })

    console.log()

    // ============================================================================
    // 7. PERSONALITY PROMPTS
    // ============================================================================
    console.log('💬 SECTION 7: PERSONALITY PROMPTS')
    console.log('-'.repeat(80))

    const promptsPerUser = await client.query(`
      SELECT
        COUNT(DISTINCT "userId") AS users_with_prompts,
        COUNT(*) AS total_prompts,
        AVG(prompts_count) AS avg_prompts_per_user
      FROM (
        SELECT "userId", COUNT(*) AS prompts_count
        FROM "PersonalityPrompt"
        GROUP BY "userId"
      ) AS user_prompts
    `)
    const promptData = promptsPerUser.rows[0]
    console.log(`Users with prompts: ${promptData.users_with_prompts}`)
    console.log(`Total prompts: ${promptData.total_prompts}`)
    console.log(`Average prompts per user: ${parseFloat(promptData.avg_prompts_per_user).toFixed(2)}`)

    console.log()

    // ============================================================================
    // 8. DIAGNOSE: WHY 0 PROFILES IN DISCOVER?
    // ============================================================================
    console.log('🔬 SECTION 8: DIAGNOSIS - WHY DISCOVER SHOWS 0 PROFILES')
    console.log('-'.repeat(80))

    // Pick a random eligible user to simulate Discover query
    const testUser = await client.query(`
      SELECT u.id, u.name, p.gender
      FROM "User" u
      INNER JOIN "Profile" p ON u.id = p."userId"
      WHERE u."onboardingCompleted" = true
        AND u."status" = 'ACTIVE'
        AND p."isVisible" = true
      LIMIT 1
    `)

    if (testUser.rows.length === 0) {
      console.log('❌ NO ELIGIBLE USERS FOUND')
      console.log('   Root Cause: No users have completed onboarding AND have visible profiles')
      console.log('   Fix: Run seed script or manually set onboardingCompleted = true for test users')
    } else {
      const user = testUser.rows[0]
      const oppositeGender = user.gender === 'MALE' ? 'FEMALE' : 'MALE'

      console.log(`Testing with user: ${user.name} (${user.id})`)
      console.log(`Looking for: ${oppositeGender} profiles\n`)

      // Simulate Discover query
      const potentialMatches = await client.query(`
        SELECT COUNT(*) AS count
        FROM "Profile" p
        INNER JOIN "User" u ON p."userId" = u.id
        WHERE p."userId" != $1
          AND p.gender = $2
          AND p."isVisible" = true
          AND u."status" = 'ACTIVE'
          AND u."onboardingCompleted" = true
      `, [user.id, oppositeGender])

      console.log(`Potential matches for this user: ${potentialMatches.rows[0].count}`)

      if (parseInt(potentialMatches.rows[0].count) === 0) {
        console.log('\n❌ ROOT CAUSE IDENTIFIED:')
        console.log(`   No ${oppositeGender} profiles exist that meet ALL criteria:`)
        console.log('   - isVisible = true')
        console.log('   - status = ACTIVE')
        console.log('   - onboardingCompleted = true')
      } else {
        console.log('\n✅ Matches SHOULD be available. Checking for other issues...')

        // Check if user has liked everyone
        const likesCount = await client.query(`
          SELECT COUNT(*) AS count FROM "Like" WHERE "likerId" = $1
        `, [user.id])
        console.log(`   User has liked: ${likesCount.rows[0].count} profiles`)

        if (parseInt(likesCount.rows[0].count) >= parseInt(potentialMatches.rows[0].count)) {
          console.log('   ⚠️  User may have already liked all available profiles')
        }
      }
    }

    console.log()
    console.log('=' .repeat(80))
    console.log('END OF DATABASE INSPECTION')
    console.log('=' .repeat(80))

  } catch (error) {
    console.error('❌ Database inspection failed:', error)
    throw error
  } finally {
    await client.end()
    console.log('\n✅ Database connection closed')
  }
}

// Run the inspection
inspectDatabase().catch(console.error)
