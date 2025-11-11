import { prisma } from '@/lib/prisma'

interface CreateNotificationParams {
  userId: string
  type: string
  title: string
  content: string
  link?: string
}

/**
 * Base function to create a notification
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        content: params.content,
        link: params.link,
        isRead: false,
      }
    })
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

/**
 * Create notification when users match
 */
export async function createMatchNotification(userId: string, matchedUserName: string, matchId: string) {
  return createNotification({
    userId,
    type: 'NEW_MATCH',
    title: 'New Match!',
    content: `You have a new match with ${matchedUserName}. Start a conversation now!`,
    link: `/matches/${matchId}`
  })
}

/**
 * Create notification when someone sends an interest
 */
export async function createInterestNotification(userId: string, senderName: string, senderId: string) {
  return createNotification({
    userId,
    type: 'INTEREST_RECEIVED',
    title: 'New Interest Received',
    content: `${senderName} sent you an interest. Check out their profile!`,
    link: `/profile/${senderId}`
  })
}

/**
 * Create notification when interest is accepted
 */
export async function createInterestAcceptedNotification(userId: string, acceptorName: string, matchId: string) {
  return createNotification({
    userId,
    type: 'INTEREST_ACCEPTED',
    title: 'Interest Accepted!',
    content: `${acceptorName} accepted your interest. You can now message each other!`,
    link: `/matches/${matchId}`
  })
}

/**
 * Create notification for new message
 */
export async function createMessageNotification(userId: string, senderName: string, matchId: string) {
  return createNotification({
    userId,
    type: 'NEW_MESSAGE',
    title: 'New Message',
    content: `${senderName} sent you a message`,
    link: `/matches/${matchId}`
  })
}

/**
 * Create notification when someone views your profile
 */
export async function createProfileViewNotification(userId: string, viewerName: string, viewerId: string) {
  return createNotification({
    userId,
    type: 'PROFILE_VIEW',
    title: 'Profile View',
    content: `${viewerName} viewed your profile`,
    link: `/profile/${viewerId}`
  })
}

/**
 * Create notification when someone likes your profile
 */
export async function createLikeNotification(userId: string, likerName: string, likerId: string) {
  return createNotification({
    userId,
    type: 'PROFILE_LIKE',
    title: 'New Like',
    content: `${likerName} liked your profile`,
    link: `/profile/${likerId}`
  })
}

/**
 * Create notification for super like
 */
export async function createSuperLikeNotification(userId: string, likerName: string, likerId: string) {
  return createNotification({
    userId,
    type: 'SUPER_LIKE',
    title: 'Super Like!',
    content: `${likerName} super liked your profile! They're really interested!`,
    link: `/profile/${likerId}`
  })
}

/**
 * Create notification for daily matches summary
 */
export async function createDailyMatchesNotification(userId: string, matchCount: number) {
  return createNotification({
    userId,
    type: 'DAILY_MATCHES',
    title: 'Daily Matches Ready',
    content: `You have ${matchCount} new potential matches today. Check them out!`,
    link: '/discover'
  })
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    })
    return count
  } catch (error) {
    console.error('Error getting unread notification count:', error)
    return 0
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

/**
 * Delete old notifications (older than 30 days)
 */
export async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
        isRead: true
      }
    })

    console.log(`Cleaned up ${result.count} old notifications`)
    return result.count
  } catch (error) {
    console.error('Error cleaning up old notifications:', error)
    throw error
  }
}
