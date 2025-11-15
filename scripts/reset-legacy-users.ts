// Dev-only script to wipe all legacy users & related data for Kaapi Connect migration.
// This ensures no old faith-based user data remains in the database.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetLegacyUsers() {
  console.log('🗑️  Starting legacy user data reset for Kaapi Connect migration...\n')

  try {
    // Use a transaction to ensure all-or-nothing deletion
    await prisma.$transaction(async (tx) => {
      // Delete in order to avoid foreign key constraint issues

      console.log('Deleting Messages...')
      const messagesDeleted = await tx.message.deleteMany({})
      console.log(`✓ ${messagesDeleted.count} messages deleted`)

      console.log('Deleting Activities...')
      const activitiesDeleted = await tx.activity.deleteMany({})
      console.log(`✓ ${activitiesDeleted.count} activities deleted`)

      console.log('Deleting Notifications...')
      const notificationsDeleted = await tx.notification.deleteMany({})
      console.log(`✓ ${notificationsDeleted.count} notifications deleted`)

      console.log('Deleting Reports...')
      const reportsDeleted = await tx.report.deleteMany({})
      console.log(`✓ ${reportsDeleted.count} reports deleted`)

      console.log('Deleting Blocks...')
      const blocksDeleted = await tx.block.deleteMany({})
      console.log(`✓ ${blocksDeleted.count} blocks deleted`)

      console.log('Deleting Likes...')
      const likesDeleted = await tx.like.deleteMany({})
      console.log(`✓ ${likesDeleted.count} likes deleted`)

      console.log('Deleting Matches...')
      const matchesDeleted = await tx.match.deleteMany({})
      console.log(`✓ ${matchesDeleted.count} matches deleted`)

      console.log('Deleting Interests...')
      const interestsDeleted = await tx.interest.deleteMany({})
      console.log(`✓ ${interestsDeleted.count} interests deleted`)

      console.log('Deleting Daily Quotas...')
      const quotasDeleted = await tx.dailyQuota.deleteMany({})
      console.log(`✓ ${quotasDeleted.count} daily quotas deleted`)

      console.log('Deleting Subscriptions...')
      const subscriptionsDeleted = await tx.subscription.deleteMany({})
      console.log(`✓ ${subscriptionsDeleted.count} subscriptions deleted`)

      console.log('Deleting Verifications...')
      const verificationsDeleted = await tx.verification.deleteMany({})
      console.log(`✓ ${verificationsDeleted.count} verifications deleted`)

      console.log('Deleting Photos...')
      const photosDeleted = await tx.photo.deleteMany({})
      console.log(`✓ ${photosDeleted.count} photos deleted`)

      console.log('Deleting Partner Preferences...')
      const preferencesDeleted = await tx.partnerPreferences.deleteMany({})
      console.log(`✓ ${preferencesDeleted.count} partner preferences deleted`)

      console.log('Deleting Profiles...')
      const profilesDeleted = await tx.profile.deleteMany({})
      console.log(`✓ ${profilesDeleted.count} profiles deleted`)

      console.log('Deleting Sessions...')
      const sessionsDeleted = await tx.session.deleteMany({})
      console.log(`✓ ${sessionsDeleted.count} sessions deleted`)

      console.log('Deleting Accounts...')
      const accountsDeleted = await tx.account.deleteMany({})
      console.log(`✓ ${accountsDeleted.count} accounts deleted`)

      console.log('Deleting all non-admin Users...')
      const usersDeleted = await tx.user.deleteMany({
        where: {
          role: {
            not: 'ADMIN'
          }
        }
      })
      console.log(`✓ ${usersDeleted.count} users deleted (admins preserved)`)
    })

    console.log('\n✅ Legacy user data reset complete!')
    console.log('The database is now clean and ready for Kaapi Connect users only.\n')

    // Final verification
    const remainingUsers = await prisma.user.count()
    const remainingProfiles = await prisma.profile.count()

    console.log(`Final counts:`)
    console.log(`- Users: ${remainingUsers} (admins only)`)
    console.log(`- Profiles: ${remainingProfiles}`)

  } catch (error) {
    console.error('❌ Error during legacy user reset:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the reset
resetLegacyUsers()
  .then(() => {
    console.log('Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
