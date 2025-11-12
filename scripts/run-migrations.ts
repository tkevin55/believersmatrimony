/**
 * Manual Migration Runner
 *
 * Run this script to manually apply Prisma migrations to your database
 * Useful when migrations didn't run automatically during deployment
 *
 * Usage: npx tsx scripts/run-migrations.ts
 */

import { execSync } from 'child_process'

async function runMigrations() {
  console.log('🔄 Starting manual migration process...\n')

  try {
    // Step 1: Check database connection
    console.log('1️⃣ Checking database connection...')
    if (!process.env.DATABASE_URL) {
      throw new Error('❌ DATABASE_URL environment variable not set!')
    }
    console.log('✅ Database URL found\n')

    // Step 2: Generate Prisma Client
    console.log('2️⃣ Generating Prisma Client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    console.log('✅ Prisma Client generated\n')

    // Step 3: Check migration status
    console.log('3️⃣ Checking migration status...')
    try {
      execSync('npx prisma migrate status', { stdio: 'inherit' })
    } catch (error) {
      console.log('⚠️  Some migrations need to be applied\n')
    }

    // Step 4: Apply migrations
    console.log('4️⃣ Applying pending migrations...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    console.log('✅ Migrations applied successfully\n')

    // Step 5: Verify
    console.log('5️⃣ Verifying database schema...')
    execSync('npx prisma validate', { stdio: 'inherit' })
    console.log('✅ Database schema is valid\n')

    console.log('🎉 SUCCESS! All migrations completed.')
    console.log('\nYour database is now up to date with your Prisma schema.')
    console.log('\nNext steps:')
    console.log('  - Test your application')
    console.log('  - Run seed script if needed: npm run seed:test')

  } catch (error: any) {
    console.error('\n❌ Migration failed!')
    console.error('Error:', error.message)
    console.error('\nTroubleshooting:')
    console.error('  1. Check DATABASE_URL is correct')
    console.error('  2. Ensure database is accessible')
    console.error('  3. Check Prisma schema for errors')
    console.error('  4. Try: npx prisma migrate status')
    process.exit(1)
  }
}

runMigrations()
