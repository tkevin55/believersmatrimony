import { prisma } from '@/lib/prisma'

interface ProfileWithUser {
  [key: string]: any
  user: {
    [key: string]: any
    photos: any[]
  }
}

interface MatchScore {
  userId: string
  score: number
  breakdown: {
    interests: number
    location: number
    age: number
    education: number
    lifestyle: number
  }
}

/**
 * Calculate the distance between two users based on their location
 * Simple implementation - in production, use proper geolocation
 */
function calculateLocationScore(
  userCity?: string | null,
  userState?: string | null,
  matchCity?: string | null,
  matchState?: string | null
): number {
  if (!userCity || !matchCity) return 0

  // Exact city match
  if (userCity.toLowerCase() === matchCity.toLowerCase()) {
    return 100
  }

  // Same state
  if (userState && matchState && userState.toLowerCase() === matchState.toLowerCase()) {
    return 60
  }

  // Different state
  return 30
}

/**
 * Calculate interest overlap score (Kaapi Connect)
 * Measures how many interests two users have in common
 */
function calculateInterestOverlap(
  userInterests: string[] = [],
  matchInterests: string[] = [],
  preferredInterests?: string[]
): number {
  if (userInterests.length === 0 || matchInterests.length === 0) {
    return 50 // Neutral score if no interests specified
  }

  // Calculate overlap
  const commonInterests = userInterests.filter(interest =>
    matchInterests.includes(interest)
  )

  const overlapPercentage = (commonInterests.length / Math.max(userInterests.length, matchInterests.length)) * 100

  // Bonus if match has preferred interests
  let score = overlapPercentage
  if (preferredInterests && preferredInterests.length > 0) {
    const hasPreferredInterests = preferredInterests.some(interest =>
      matchInterests.includes(interest)
    )
    if (hasPreferredInterests) {
      score = Math.min(100, score + 20) // Bonus for having preferred interests
    }
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Calculate age compatibility score
 */
function calculateAgeScore(
  userAge: number,
  matchAge: number,
  preferredAgeMin?: number | null,
  preferredAgeMax?: number | null
): number {
  // Check if within preferred range
  if (preferredAgeMin && preferredAgeMax) {
    if (matchAge >= preferredAgeMin && matchAge <= preferredAgeMax) {
      return 100
    }
  }

  // Calculate age difference
  const ageDiff = Math.abs(userAge - matchAge)

  if (ageDiff <= 2) return 100
  if (ageDiff <= 5) return 80
  if (ageDiff <= 10) return 60
  if (ageDiff <= 15) return 40

  return 20
}

/**
 * Calculate education level compatibility score
 */
function calculateEducationScore(
  userEducation?: string | null,
  matchEducation?: string | null,
  preferredEducationLevels?: string[]
): number {
  if (!userEducation || !matchEducation) return 50

  // Check if in preferred education levels
  if (preferredEducationLevels && preferredEducationLevels.includes(matchEducation)) {
    return 100
  }

  // Same education level
  if (userEducation === matchEducation) {
    return 90
  }

  // Education level hierarchy
  const educationHierarchy: { [key: string]: number } = {
    HIGH_SCHOOL: 1,
    ASSOCIATE: 2,
    BACHELOR: 3,
    MASTER: 4,
    DOCTORATE: 5,
    PROFESSIONAL: 5,
  }

  const userLevel = educationHierarchy[userEducation] || 0
  const matchLevel = educationHierarchy[matchEducation] || 0
  const diff = Math.abs(userLevel - matchLevel)

  if (diff === 0) return 90
  if (diff === 1) return 75
  if (diff === 2) return 60

  return 40
}

/**
 * Calculate lifestyle compatibility score
 */
function calculateLifestyleScore(
  userProfile: any,
  matchProfile: any
): number {
  let score = 0
  let factors = 0

  // Drinking
  if (userProfile.drinking && matchProfile.drinking) {
    factors++
    if (userProfile.drinking === matchProfile.drinking) {
      score += 100
    } else if (
      (userProfile.drinking === 'never' || matchProfile.drinking === 'never') &&
      userProfile.drinking !== matchProfile.drinking
    ) {
      score += 30
    } else {
      score += 60
    }
  }

  // Smoking
  if (userProfile.smoking && matchProfile.smoking) {
    factors++
    if (userProfile.smoking === matchProfile.smoking) {
      score += 100
    } else if (
      (userProfile.smoking === 'never' || matchProfile.smoking === 'never') &&
      userProfile.smoking !== matchProfile.smoking
    ) {
      score += 30
    } else {
      score += 60
    }
  }

  // Body type (less important)
  if (userProfile.bodyType && matchProfile.bodyType) {
    factors++
    score += 70 // Neutral score, body type shouldn't heavily influence match
  }

  return factors > 0 ? score / factors : 50
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Calculate match percentage between two profiles
 */
export async function calculateMatchPercentage(
  userId: string,
  matchUserId: string
): Promise<MatchScore | null> {
  try {
    // Fetch both profiles with preferences
    const [userProfile, matchProfile, userPreferences] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId },
      }),
      prisma.profile.findUnique({
        where: { userId: matchUserId },
      }),
      prisma.partnerPreferences.findUnique({
        where: { userId },
      }),
    ])

    if (!userProfile || !matchProfile) {
      return null
    }

    const userAge = calculateAge(userProfile.dateOfBirth)
    const matchAge = calculateAge(matchProfile.dateOfBirth)

    // Calculate individual scores (Kaapi Connect - secular)
    const interestScore = calculateInterestOverlap(
      userProfile.interestTags || [],
      matchProfile.interestTags || [],
      userPreferences?.preferredInterests
    )

    const locationScore = calculateLocationScore(
      userProfile.city,
      userProfile.state,
      matchProfile.city,
      matchProfile.state
    )

    const ageScore = calculateAgeScore(
      userAge,
      matchAge,
      userPreferences?.ageMin,
      userPreferences?.ageMax
    )

    const educationScore = calculateEducationScore(
      userProfile.educationLevel,
      matchProfile.educationLevel,
      userPreferences?.educationLevels
    )

    const lifestyleScore = calculateLifestyleScore(userProfile, matchProfile)

    // Calculate weighted total score (Kaapi Connect weights)
    const totalScore = Math.round(
      interestScore * 0.40 +   // 40% - interests are most important
      ageScore * 0.30 +         // 30% - age compatibility
      locationScore * 0.20 +    // 20% - location proximity
      educationScore * 0.10     // 10% - education level
    )

    return {
      userId: matchUserId,
      score: totalScore,
      breakdown: {
        interests: Math.round(interestScore),
        location: Math.round(locationScore),
        age: Math.round(ageScore),
        education: Math.round(educationScore),
        lifestyle: Math.round(lifestyleScore),
      },
    }
  } catch (error) {
    console.error('Error calculating match percentage:', error)
    return null
  }
}

/**
 * Get curated matches for a user (10-20 profiles)
 * Now with LESS strict filtering - prioritizes showing profiles over perfect matches
 */
export async function getCuratedMatches(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<(ProfileWithUser & { matchScore: number })[]> {
  try {
    // Get user's profile and preferences
    const [userProfile, userPreferences, user] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId },
      }),
      prisma.partnerPreferences.findUnique({
        where: { userId },
      }),
      prisma.user.findUnique({
        where: { id: userId },
      }),
    ])

    if (!userProfile) {
      return []
    }

    // Check if user has completed onboarding
    if (!user?.onboardingCompleted) {
      return []
    }

    // Get users already interacted with (liked, passed, blocked)
    const [likedUsers, blockedByUser, blockedUser] = await Promise.all([
      prisma.like.findMany({
        where: { likerId: userId },
        select: { likedId: true },
      }),
      prisma.block.findMany({
        where: { blockerId: userId },
        select: { blockedId: true },
      }),
      prisma.block.findMany({
        where: { blockedId: userId },
        select: { blockerId: true },
      }),
    ])

    const excludedUserIds = [
      userId,
      ...likedUsers.map((l: any) => l.likedId),
      ...blockedByUser.map((b: any) => b.blockedId),
      ...blockedUser.map((b: any) => b.blockerId),
    ]

    // Build query filters
    const userAge = calculateAge(userProfile.dateOfBirth)
    const oppositeGender = userProfile.gender === 'MALE' ? 'FEMALE' : 'MALE'

    // BASIC filters (always apply)
    const baseWhereClause: any = {
      userId: {
        notIn: excludedUserIds,
      },
      gender: oppositeGender,
      isVisible: true,
      user: {
        status: 'ACTIVE',
        onboardingCompleted: true,
      },
    }

    // Try with PREFERRED filters first
    let whereClause: any = { ...baseWhereClause }
    let potentialMatches: any[] = []

    // Apply preferences if they exist (but not as hard requirements)
    if (userPreferences) {
      const preferredFilters: any = {}

      // Age filter (with some flexibility - add 5 years buffer)
      if (userPreferences.ageMin || userPreferences.ageMax) {
        const today = new Date()
        if (userPreferences.ageMax) {
          const minBirthDate = new Date(
            today.getFullYear() - (userPreferences.ageMax + 5) - 1,
            today.getMonth(),
            today.getDate()
          )
          preferredFilters.dateOfBirth = { ...preferredFilters.dateOfBirth, gte: minBirthDate }
        }
        if (userPreferences.ageMin) {
          const maxBirthDate = new Date(
            today.getFullYear() - Math.max(userPreferences.ageMin - 5, 18),
            today.getMonth(),
            today.getDate()
          )
          preferredFilters.dateOfBirth = { ...preferredFilters.dateOfBirth, lte: maxBirthDate }
        }
      }

      // Try with preferred filters first
      whereClause = { ...baseWhereClause, ...preferredFilters }

      potentialMatches = await prisma.profile.findMany({
        where: whereClause,
        include: {
          user: {
            include: {
              photos: true,
            },
          },
          personalityPrompts: {
            select: {
              id: true,
              prompt: true,
              answer: true,
              order: true,
            },
            orderBy: { order: 'asc' },
            take: 3,
          },
        },
        take: limit * 3,
      })
    }

    // If no matches with preferences, try with ONLY basic filters (opposite gender, active, completed onboarding)
    if (potentialMatches.length === 0) {
      console.log('No matches with preferences, trying with basic filters only')
      potentialMatches = await prisma.profile.findMany({
        where: baseWhereClause,
        include: {
          user: {
            include: {
              photos: true,
            },
          },
          personalityPrompts: {
            select: {
              id: true,
              prompt: true,
              answer: true,
              order: true,
            },
            orderBy: { order: 'asc' },
            take: 3,
          },
        },
        take: limit * 3,
      })
    }

    // If still no matches, return empty array
    if (potentialMatches.length === 0) {
      return []
    }

    // Calculate match scores for each profile
    const matchesWithScores = await Promise.all(
      potentialMatches.map(async (profile) => {
        const matchScore = await calculateMatchPercentage(userId, profile.userId)
        return {
          ...profile,
          matchScore: matchScore?.score || 50,
        }
      })
    )

    // Sort by match score and return top matches
    const sortedMatches = matchesWithScores
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(offset, offset + limit)

    return sortedMatches
  } catch (error) {
    console.error('Error getting curated matches:', error)
    return []
  }
}

/**
 * Get standout profiles (top 5 most compatible)
 */
export async function getStandoutProfiles(
  userId: string
): Promise<(ProfileWithUser & { matchScore: number })[]> {
  try {
    const allMatches = await getCuratedMatches(userId, 50)

    // Get top 5 matches with score >= 80
    const standouts = allMatches
      .filter((match) => match.matchScore >= 80)
      .slice(0, 5)

    return standouts
  } catch (error) {
    console.error('Error getting standout profiles:', error)
    return []
  }
}

/**
 * Check if two users have mutual interest
 */
export async function checkMutualInterest(
  userId1: string,
  userId2: string
): Promise<boolean> {
  try {
    const [like1, like2] = await Promise.all([
      prisma.like.findUnique({
        where: {
          likerId_likedId: {
            likerId: userId1,
            likedId: userId2,
          },
        },
      }),
      prisma.like.findUnique({
        where: {
          likerId_likedId: {
            likerId: userId2,
            likedId: userId1,
          },
        },
      }),
    ])

    return !!(like1 && like2)
  } catch (error) {
    console.error('Error checking mutual interest:', error)
    return false
  }
}

/**
 * Check if a match already exists between two users
 */
export async function checkExistingMatch(
  userId1: string,
  userId2: string
): Promise<boolean> {
  try {
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: userId1, user2Id: userId2 },
          { user1Id: userId2, user2Id: userId1 },
        ],
      },
    })

    return !!match
  } catch (error) {
    console.error('Error checking existing match:', error)
    return false
  }
}
