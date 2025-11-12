/**
 * Database Column Diagnostic Script
 *
 * This script checks which columns actually exist in the Profile and User tables
 */

import { PrismaClient } from '@prisma/client'

async function checkDatabaseColumns() {
  const prisma = new PrismaClient()

  try {
    console.log('🔍 Checking database columns...\n')

    // Check Profile table columns
    console.log('📋 Profile Table Columns:')
    const profileColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Profile'
      ORDER BY ordinal_position;
    `

    console.table(profileColumns)

    // Check User table columns
    console.log('\n📋 User Table Columns:')
    const userColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'User'
      ORDER BY ordinal_position;
    `

    console.table(userColumns)

    // Check for specific missing columns
    console.log('\n🔎 Checking for specific columns:')

    const requiredProfileColumns = ['firstName', 'lastName', 'favoriteVerse', 'isComplete']
    const requiredUserColumns = ['resetToken', 'resetTokenExpiry']

    const profileColumnNames = new Set(profileColumns.map(c => c.column_name))
    const userColumnNames = new Set(userColumns.map(c => c.column_name))

    console.log('\n❓ Profile columns:')
    requiredProfileColumns.forEach(col => {
      const exists = profileColumnNames.has(col)
      console.log(`  ${exists ? '✅' : '❌'} ${col}: ${exists ? 'EXISTS' : 'MISSING'}`)
    })

    console.log('\n❓ User columns:')
    requiredUserColumns.forEach(col => {
      const exists = userColumnNames.has(col)
      console.log(`  ${exists ? '✅' : '❌'} ${col}: ${exists ? 'EXISTS' : 'MISSING'}`)
    })

    // Check migration status
    console.log('\n📊 Migration Status:')
    const migrations = await prisma.$queryRaw<any[]>`
      SELECT migration_name, finished_at, rolled_back_at, applied_steps_count
      FROM "_prisma_migrations"
      ORDER BY started_at DESC
      LIMIT 5;
    `

    console.table(migrations)

  } catch (error: any) {
    console.error('❌ Error checking database:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseColumns()
