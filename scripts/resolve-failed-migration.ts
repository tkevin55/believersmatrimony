/**
 * Resolve Failed Migration
 *
 * This script resolves a failed migration by marking it as rolled back
 * and then reapplying it manually.
 */

import { PrismaClient } from '@prisma/client'

async function resolveFailedMigration() {
  const prisma = new PrismaClient()

  try {
    console.log('🔧 Resolving failed migration...\n')

    // Step 1: Mark the failed migration as rolled back
    console.log('1️⃣ Marking failed migration as rolled back...')
    await prisma.$executeRawUnsafe(`
      UPDATE "_prisma_migrations"
      SET rolled_back_at = NOW()
      WHERE migration_name = '20251112104907_add_missing_profile_and_user_fields'
      AND finished_at IS NULL;
    `)
    console.log('✅ Failed migration marked as rolled back\n')

    // Step 2: Check which columns already exist
    console.log('2️⃣ Checking existing columns...')

    const userColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'User'
      AND column_name IN ('resetToken', 'resetTokenExpiry');
    `

    const profileColumns = await prisma.$queryRaw<any[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Profile'
      AND column_name IN ('firstName', 'lastName', 'favoriteVerse', 'isComplete');
    `

    console.log('User columns found:', userColumns.map(c => c.column_name))
    console.log('Profile columns found:', profileColumns.map(c => c.column_name))
    console.log('')

    // Step 3: Add missing columns
    console.log('3️⃣ Adding missing columns...')

    const existingUserCols = new Set(userColumns.map(c => c.column_name))
    const existingProfileCols = new Set(profileColumns.map(c => c.column_name))

    // Add User columns if they don't exist
    if (!existingUserCols.has('resetToken')) {
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN "resetToken" TEXT;')
      console.log('✅ Added User.resetToken')
    }
    if (!existingUserCols.has('resetTokenExpiry')) {
      await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);')
      console.log('✅ Added User.resetTokenExpiry')
    }

    // Add Profile columns if they don't exist
    if (!existingProfileCols.has('firstName')) {
      await prisma.$executeRawUnsafe('ALTER TABLE "Profile" ADD COLUMN "firstName" TEXT;')
      console.log('✅ Added Profile.firstName')
    }
    if (!existingProfileCols.has('lastName')) {
      await prisma.$executeRawUnsafe('ALTER TABLE "Profile" ADD COLUMN "lastName" TEXT;')
      console.log('✅ Added Profile.lastName')
    }
    if (!existingProfileCols.has('favoriteVerse')) {
      await prisma.$executeRawUnsafe('ALTER TABLE "Profile" ADD COLUMN "favoriteVerse" TEXT;')
      console.log('✅ Added Profile.favoriteVerse')
    }
    if (!existingProfileCols.has('isComplete')) {
      await prisma.$executeRawUnsafe('ALTER TABLE "Profile" ADD COLUMN "isComplete" BOOLEAN NOT NULL DEFAULT false;')
      console.log('✅ Added Profile.isComplete')
    }

    // Add unique index if it doesn't exist
    console.log('')
    console.log('4️⃣ Adding unique index...')
    try {
      await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");')
      console.log('✅ Added unique index on User.resetToken')
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        console.log('⚠️  Index already exists, skipping')
      } else {
        throw e
      }
    }

    console.log('')
    console.log('🎉 Migration resolved successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Run: npx prisma migrate resolve --applied 20251112104907_add_missing_profile_and_user_fields')
    console.log('  2. Or redeploy on Vercel')

  } catch (error: any) {
    console.error('❌ Error resolving migration:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resolveFailedMigration()
