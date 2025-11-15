import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch user's activity feed
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const filter = searchParams.get('filter') || 'all' // 'all', 'views', 'likes', 'interests'

    // Build filter condition
    let whereCondition: any = {
      OR: [
        { userId: session.user.id },
        { targetUserId: session.user.id }
      ]
    }

    // Apply specific filters
    if (filter === 'views') {
      whereCondition.type = 'PROFILE_VIEW'
      whereCondition = { targetUserId: session.user.id, type: 'PROFILE_VIEW' }
    } else if (filter === 'likes') {
      whereCondition.type = { in: ['LIKE_RECEIVED', 'SUPERLIKE_RECEIVED'] }
      whereCondition = { targetUserId: session.user.id, type: { in: ['LIKE_RECEIVED', 'SUPERLIKE_RECEIVED'] } }
    } else if (filter === 'interests') {
      whereCondition.type = { in: ['INTEREST_RECEIVED', 'INTEREST_ACCEPTED'] }
      whereCondition = {
        OR: [
          { userId: session.user.id, type: { in: ['INTEREST_SENT', 'INTEREST_ACCEPTED', 'INTEREST_DECLINED'] } },
          { targetUserId: session.user.id, type: { in: ['INTEREST_RECEIVED', 'INTEREST_ACCEPTED', 'INTEREST_DECLINED'] } }
        ]
      }
    }

    const activities = await prisma.activity.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            profile: {
              select: {
                gender: true,
                city: true,
                state: true,
                interestTags: true,
                homeDistrict: true,
              }
            },
            photos: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true }
            }
          }
        },
        targetUser: {
          select: {
            id: true,
            name: true,
            image: true,
            profile: {
              select: {
                gender: true,
                city: true,
                state: true,
                interestTags: true,
                homeDistrict: true,
              }
            },
            photos: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Format activities (Kaapi Connect - secular)
    const formattedActivities = activities.map((activity: any) => ({
      id: activity.id,
      type: activity.type,
      user: {
        id: activity.user.id,
        name: activity.user.name,
        photo: activity.user.photos[0]?.url || activity.user.image,
        city: activity.user.profile?.city,
        state: activity.user.profile?.state,
        interestTags: activity.user.profile?.interestTags || [],
        homeDistrict: activity.user.profile?.homeDistrict,
      },
      targetUser: activity.targetUser ? {
        id: activity.targetUser.id,
        name: activity.targetUser.name,
        photo: activity.targetUser.photos[0]?.url || activity.targetUser.image,
        city: activity.targetUser.profile?.city,
        state: activity.targetUser.profile?.state,
        interestTags: activity.targetUser.profile?.interestTags || [],
        homeDistrict: activity.targetUser.profile?.homeDistrict,
      } : null,
      metadata: activity.metadata,
      createdAt: activity.createdAt,
      isCurrentUser: activity.userId === session.user.id,
    }))

    return NextResponse.json({
      activities: formattedActivities,
      hasMore: activities.length === limit,
      offset: offset + activities.length,
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

// POST - Log a new activity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, targetUserId, metadata } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Activity type is required' },
        { status: 400 }
      )
    }

    // Prevent duplicate activities within a short time window (5 minutes)
    if (targetUserId) {
      const recentActivity = await prisma.activity.findFirst({
        where: {
          userId: session.user.id,
          targetUserId,
          type,
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
          }
        }
      })

      if (recentActivity) {
        // Activity already logged recently, skip
        return NextResponse.json({
          message: 'Activity already logged',
          activity: recentActivity
        })
      }
    }

    const activity = await prisma.activity.create({
      data: {
        userId: session.user.id,
        type,
        targetUserId: targetUserId || null,
        metadata: metadata || null,
      }
    })

    return NextResponse.json({
      message: 'Activity logged successfully',
      activity,
    })
  } catch (error) {
    console.error('Error logging activity:', error)
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    )
  }
}
