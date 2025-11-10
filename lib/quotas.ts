import { prisma } from './prisma'

// Quota limits for different tiers
export const QUOTA_LIMITS = {
  FREE: {
    daily_likes: 10,
    weekly_super_likes: 5,
    weekly_interests: 15,
  },
  PREMIUM: {
    daily_likes: Infinity,
    weekly_super_likes: Infinity,
    weekly_interests: Infinity,
  },
  PREMIUM_PLUS: {
    daily_likes: Infinity,
    weekly_super_likes: Infinity,
    weekly_interests: Infinity,
  },
}

// Get user's subscription tier
export async function getUserTier(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  // Check if subscription is active and not expired
  if (subscription) {
    if (subscription.status === 'ACTIVE' || subscription.status === 'TRIAL') {
      if (!subscription.endDate || subscription.endDate > new Date()) {
        return subscription.tier
      }
    }
  }

  return 'FREE'
}

// Get or create today's quota for a user
async function getTodayQuota(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let quota = await prisma.dailyQuota.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  })

  if (!quota) {
    quota = await prisma.dailyQuota.create({
      data: {
        userId,
        date: today,
        likesUsed: 0,
        superLikesUsed: 0,
        interestsUsed: 0,
        profileViewsUsed: 0,
      },
    })
  }

  return quota
}

// Get week's quota for super likes and interests
async function getWeekQuota(userId: string) {
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const quotas = await prisma.dailyQuota.findMany({
    where: {
      userId,
      date: {
        gte: startOfWeek,
      },
    },
  })

  const weeklyStats = {
    superLikesUsed: quotas.reduce((sum, q) => sum + q.superLikesUsed, 0),
    interestsUsed: quotas.reduce((sum, q) => sum + q.interestsUsed, 0),
  }

  return weeklyStats
}

// Check if user can perform an action
export async function checkQuota(
  userId: string,
  action: 'like' | 'superlike' | 'interest'
): Promise<{ allowed: boolean; reason?: string; suggestPremium?: boolean }> {
  const tier = await getUserTier(userId)
  const limits = QUOTA_LIMITS[tier]

  // Premium users have no limits
  if (tier !== 'FREE') {
    return { allowed: true }
  }

  if (action === 'like') {
    const todayQuota = await getTodayQuota(userId)
    if (todayQuota.likesUsed >= limits.daily_likes) {
      return {
        allowed: false,
        reason: `Daily limit of ${limits.daily_likes} likes reached. Upgrade to Premium for unlimited likes!`,
        suggestPremium: true,
      }
    }
  } else if (action === 'superlike') {
    const weekQuota = await getWeekQuota(userId)
    if (weekQuota.superLikesUsed >= limits.weekly_super_likes) {
      return {
        allowed: false,
        reason: `Weekly limit of ${limits.weekly_super_likes} super likes reached. Upgrade to Premium for unlimited super likes!`,
        suggestPremium: true,
      }
    }
  } else if (action === 'interest') {
    const weekQuota = await getWeekQuota(userId)
    if (weekQuota.interestsUsed >= limits.weekly_interests) {
      return {
        allowed: false,
        reason: `Weekly limit of ${limits.weekly_interests} interests reached. Upgrade to Premium for unlimited interests!`,
        suggestPremium: true,
      }
    }
  }

  return { allowed: true }
}

// Increment quota usage
export async function incrementQuota(
  userId: string,
  action: 'like' | 'superlike' | 'interest'
): Promise<void> {
  const todayQuota = await getTodayQuota(userId)

  const updateData: any = {}

  if (action === 'like') {
    updateData.likesUsed = todayQuota.likesUsed + 1
  } else if (action === 'superlike') {
    updateData.superLikesUsed = todayQuota.superLikesUsed + 1
  } else if (action === 'interest') {
    updateData.interestsUsed = todayQuota.interestsUsed + 1
  }

  await prisma.dailyQuota.update({
    where: { id: todayQuota.id },
    data: updateData,
  })
}

// Get user's remaining quotas
export async function getRemainingQuotas(userId: string) {
  const tier = await getUserTier(userId)
  const limits = QUOTA_LIMITS[tier]

  if (tier !== 'FREE') {
    return {
      tier,
      likes: {
        used: 0,
        limit: Infinity,
        remaining: Infinity,
      },
      superLikes: {
        used: 0,
        limit: Infinity,
        remaining: Infinity,
      },
      interests: {
        used: 0,
        limit: Infinity,
        remaining: Infinity,
      },
    }
  }

  const todayQuota = await getTodayQuota(userId)
  const weekQuota = await getWeekQuota(userId)

  return {
    tier,
    likes: {
      used: todayQuota.likesUsed,
      limit: limits.daily_likes,
      remaining: Math.max(0, limits.daily_likes - todayQuota.likesUsed),
    },
    superLikes: {
      used: weekQuota.superLikesUsed,
      limit: limits.weekly_super_likes,
      remaining: Math.max(0, limits.weekly_super_likes - weekQuota.superLikesUsed),
    },
    interests: {
      used: weekQuota.interestsUsed,
      limit: limits.weekly_interests,
      remaining: Math.max(0, limits.weekly_interests - weekQuota.interestsUsed),
    },
  }
}
