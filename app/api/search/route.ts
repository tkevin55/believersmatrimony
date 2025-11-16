import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateMatchPercentage } from '@/lib/matching'
import { calculateAge, formatHeight } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Age filter
    const ageMin = searchParams.get('ageMin') ? parseInt(searchParams.get('ageMin')!) : null
    const ageMax = searchParams.get('ageMax') ? parseInt(searchParams.get('ageMax')!) : null

    // Height filter (in cm)
    const heightMin = searchParams.get('heightMin') ? parseInt(searchParams.get('heightMin')!) : null
    const heightMax = searchParams.get('heightMax') ? parseInt(searchParams.get('heightMax')!) : null

    // Interest tags filter (Kaapi Connect)
    const interestTagsParam = searchParams.get('interestTags')
    const interestTags = interestTagsParam ? interestTagsParam.split(',') : []

    // Political leaning filter (Kaapi Connect)
    const politicalLeaningsParam = searchParams.get('politicalLeanings')
    const politicalLeanings = politicalLeaningsParam ? politicalLeaningsParam.split(',') : []

    // Kerala district filter (Kaapi Connect)
    const keralaDistrictsParam = searchParams.get('keralaDistricts')
    const keralaDistricts = keralaDistrictsParam ? keralaDistrictsParam.split(',') : []

    // Location filter
    const locationsParam = searchParams.get('locations')
    const locations = locationsParam ? locationsParam.split(',') : []

    // Education filter
    const educationLevelsParam = searchParams.get('educationLevels')
    const educationLevels = educationLevelsParam ? educationLevelsParam.split(',') : []

    // Occupation filter
    const occupation = searchParams.get('occupation') || null

    // Income range filter
    const incomeRange = searchParams.get('incomeRange') || null

    // Lifestyle filters
    const drinking = searchParams.get('drinking') || null
    const smoking = searchParams.get('smoking') || null

    // Special filters
    const withPhotoOnly = searchParams.get('withPhotoOnly') === 'true'
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true'
    const onlineOnly = searchParams.get('onlineOnly') === 'true'

    // Sort by
    const sortBy = searchParams.get('sortBy') || 'relevance' // relevance, recently_active, newest, distance

    // Validate parameters
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      )
    }

    // Get current user's profile
    const userProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get blocked users
    const [blockedByUser, blockedUser] = await Promise.all([
      prisma.block.findMany({
        where: { blockerId: session.user.id },
        select: { blockedId: true },
      }),
      prisma.block.findMany({
        where: { blockedId: session.user.id },
        select: { blockerId: true },
      }),
    ])

    const excludedUserIds = [
      session.user.id,
      ...blockedByUser.map((b: { blockedId: string }) => b.blockedId),
      ...blockedUser.map((b: { blockerId: string }) => b.blockerId),
    ]

    // Build query filters
    const oppositeGender = userProfile.gender === 'MALE' ? 'FEMALE' : 'MALE'
    const whereClause: any = {
      userId: {
        notIn: excludedUserIds,
      },
      gender: oppositeGender,
      isVisible: true,
      user: {
        status: 'ACTIVE',
      },
    }

    // Age filter - convert to date of birth range
    if (ageMin || ageMax) {
      const today = new Date()
      if (ageMax) {
        const minBirthDate = new Date(
          today.getFullYear() - ageMax - 1,
          today.getMonth(),
          today.getDate()
        )
        whereClause.dateOfBirth = { ...whereClause.dateOfBirth, gte: minBirthDate }
      }
      if (ageMin) {
        const maxBirthDate = new Date(
          today.getFullYear() - ageMin,
          today.getMonth(),
          today.getDate()
        )
        whereClause.dateOfBirth = { ...whereClause.dateOfBirth, lte: maxBirthDate }
      }
    }

    // Height filter
    if (heightMin) {
      whereClause.height = { ...whereClause.height, gte: heightMin }
    }
    if (heightMax) {
      whereClause.height = { ...whereClause.height, lte: heightMax }
    }

    // Interest tags filter (Kaapi Connect)
    if (interestTags.length > 0) {
      whereClause.interestTags = {
        hasSome: interestTags,
      }
    }

    // Political leaning filter (Kaapi Connect)
    if (politicalLeanings.length > 0) {
      whereClause.politicalLeaning = {
        in: politicalLeanings,
      }
    }

    // Kerala district filter (Kaapi Connect)
    if (keralaDistricts.length > 0) {
      whereClause.homeDistrict = {
        in: keralaDistricts,
      }
    }

    // Location filter
    if (locations.length > 0) {
      whereClause.OR = [
        { city: { in: locations } },
        { state: { in: locations } },
      ]
    }

    // Education level filter
    if (educationLevels.length > 0) {
      whereClause.educationLevel = {
        in: educationLevels,
      }
    }

    // Occupation filter (case-insensitive contains)
    if (occupation) {
      whereClause.occupation = {
        contains: occupation,
        mode: 'insensitive',
      }
    }

    // Income range filter
    if (incomeRange) {
      whereClause.incomeRange = incomeRange
    }

    // Drinking filter
    if (drinking) {
      whereClause.drinking = drinking
    }

    // Smoking filter
    if (smoking) {
      whereClause.smoking = smoking
    }

    // With photo only filter
    if (withPhotoOnly) {
      whereClause.user = {
        ...whereClause.user,
        photos: {
          some: {},
        },
      }
    }

    // Verified only filter
    if (verifiedOnly) {
      whereClause.user = {
        ...whereClause.user,
        verifications: {
          some: {
            status: 'APPROVED',
          },
        },
      }
    }

    // Online only filter (active in last 15 minutes)
    if (onlineOnly) {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
      whereClause.user = {
        ...whereClause.user,
        lastActive: {
          gte: fifteenMinutesAgo,
        },
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.profile.count({
      where: whereClause,
    })

    // Determine order by clause based on sort option
    let orderBy: any = {}

    switch (sortBy) {
      case 'recently_active':
        orderBy = { user: { lastActive: 'desc' } }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'distance':
        // For simplicity, order by city match first, then state
        // In production, use proper geolocation
        orderBy = { city: 'asc' }
        break
      case 'relevance':
      default:
        // Will sort by match percentage after fetching
        orderBy = { createdAt: 'desc' }
        break
    }

    // Fetch matching profiles
    const profiles = await prisma.profile.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
            },
            verifications: {
              where: { status: 'APPROVED' },
              take: 1,
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
        },
      },
      orderBy,
      take: sortBy === 'relevance' ? limit * 2 : limit, // Fetch more for relevance sorting
      skip: offset,
    })

    // Calculate match percentages and format results
    const resultsWithMatches = await Promise.all(
      profiles.map(async (profile: any) => {
        const age = calculateAge(profile.dateOfBirth)
        const primaryPhoto = profile.user.photos.find((p: any) => p.isPrimary) || profile.user.photos[0]
        const matchScore = await calculateMatchPercentage(session.user.id, profile.userId)
        const isVerified = profile.user.verifications.length > 0

        // Check if user is online (active in last 15 minutes)
        const isOnline = profile.user.lastActive
          ? (Date.now() - new Date(profile.user.lastActive).getTime()) < 15 * 60 * 1000
          : false

        return {
          id: profile.userId,
          name: profile.user.name,
          age,
          gender: profile.gender,
          location: [profile.city, profile.state].filter(Boolean).join(', '),
          interestTags: profile.interestTags || [],
          politicalLeaning: profile.politicalLeaning,
          homeDistrict: profile.homeDistrict,
          educationLevel: profile.educationLevel,
          occupation: profile.occupation,
          height: profile.height ? formatHeight(profile.height) : null,
          aboutMe: profile.aboutMe,
          primaryPhoto: primaryPhoto?.url || null,
          matchPercentage: matchScore?.score || 50,
          isVerified,
          isOnline,
          lastActive: profile.user.lastActive,
          // Personality prompts (max 3)
          personalityPrompts: profile.user.personalityPrompts || [],
        }
      })
    )

    // Sort by match percentage if relevance sort
    let finalResults = resultsWithMatches
    if (sortBy === 'relevance') {
      finalResults = resultsWithMatches
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, limit)
    }

    return NextResponse.json({
      results: finalResults,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + finalResults.length < totalCount,
      },
    })
  } catch (error) {
    console.error('Error searching profiles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
