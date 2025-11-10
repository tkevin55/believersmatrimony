import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/super-likes
 * Get remaining super likes count for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or create super like quota
    let quota = await prisma.superLikeQuota.findUnique({
      where: { userId: session.user.id },
    })

    if (!quota) {
      // Create initial quota
      quota = await prisma.superLikeQuota.create({
        data: {
          userId: session.user.id,
          remainingLikes: 3,
          weekStartDate: new Date(),
        },
      })
    } else {
      // Check if week has passed and reset if needed
      const weekInMs = 7 * 24 * 60 * 60 * 1000
      const timeSinceReset = Date.now() - quota.weekStartDate.getTime()

      if (timeSinceReset >= weekInMs) {
        quota = await prisma.superLikeQuota.update({
          where: { userId: session.user.id },
          data: {
            remainingLikes: 3,
            weekStartDate: new Date(),
          },
        })
      }
    }

    return NextResponse.json({
      remainingLikes: quota.remainingLikes,
      weekStartDate: quota.weekStartDate,
      nextResetDate: new Date(quota.weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    })
  } catch (error) {
    console.error('Error fetching super like quota:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/super-likes
 * Create a super like
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { likedUserId, message } = body

    if (!likedUserId) {
      return NextResponse.json(
        { error: 'likedUserId is required' },
        { status: 400 }
      )
    }

    // Check if user is trying to super like themselves
    if (likedUserId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot super like yourself' },
        { status: 400 }
      )
    }

    // Get or create super like quota
    let quota = await prisma.superLikeQuota.findUnique({
      where: { userId: session.user.id },
    })

    if (!quota) {
      quota = await prisma.superLikeQuota.create({
        data: {
          userId: session.user.id,
          remainingLikes: 3,
          weekStartDate: new Date(),
        },
      })
    } else {
      // Check if week has passed and reset if needed
      const weekInMs = 7 * 24 * 60 * 60 * 1000
      const timeSinceReset = Date.now() - quota.weekStartDate.getTime()

      if (timeSinceReset >= weekInMs) {
        quota = await prisma.superLikeQuota.update({
          where: { userId: session.user.id },
          data: {
            remainingLikes: 3,
            weekStartDate: new Date(),
          },
        })
      }
    }

    // Check if user has remaining super likes
    if (quota.remainingLikes <= 0) {
      return NextResponse.json(
        {
          error: 'No super likes remaining',
          remainingLikes: 0,
          nextResetDate: new Date(quota.weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        { status: 429 }
      )
    }

    // Check if the liked user exists and is active
    const likedUser = await prisma.user.findUnique({
      where: { id: likedUserId },
      include: {
        profile: true,
        photos: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    })

    if (!likedUser || likedUser.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already liked (regular or super)
    const existingLike = await prisma.like.findUnique({
      where: {
        likerId_likedId: {
          likerId: session.user.id,
          likedId: likedUserId,
        },
      },
    })

    if (existingLike) {
      return NextResponse.json(
        { error: 'Already liked this user' },
        { status: 400 }
      )
    }

    // Check if blocked
    const [blockedByUser, blockedUser] = await Promise.all([
      prisma.block.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: session.user.id,
            blockedId: likedUserId,
          },
        },
      }),
      prisma.block.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: likedUserId,
            blockedId: session.user.id,
          },
        },
      }),
    ])

    if (blockedByUser || blockedUser) {
      return NextResponse.json(
        { error: 'Cannot super like this user' },
        { status: 400 }
      )
    }

    // Create the super like and decrement quota in a transaction
    const [like, updatedQuota] = await prisma.$transaction([
      prisma.like.create({
        data: {
          likerId: session.user.id,
          likedId: likedUserId,
          isSuperLike: true,
        },
      }),
      prisma.superLikeQuota.update({
        where: { userId: session.user.id },
        data: {
          remainingLikes: quota.remainingLikes - 1,
        },
      }),
    ])

    // Check if mutual like exists
    const { checkMutualInterest } = await import('@/lib/matching')
    const isMutualLike = await checkMutualInterest(session.user.id, likedUserId)

    let match = null

    if (isMutualLike) {
      // Check if match already exists
      const { checkExistingMatch } = await import('@/lib/matching')
      const existingMatch = await checkExistingMatch(session.user.id, likedUserId)

      if (!existingMatch) {
        // Create match
        match = await prisma.match.create({
          data: {
            user1Id: session.user.id,
            user2Id: likedUserId,
          },
        })

        // Create interest records for both users
        await Promise.all([
          prisma.interest.upsert({
            where: {
              senderId_receiverId: {
                senderId: session.user.id,
                receiverId: likedUserId,
              },
            },
            update: {
              status: 'ACCEPTED',
              message,
            },
            create: {
              senderId: session.user.id,
              receiverId: likedUserId,
              status: 'ACCEPTED',
              message,
            },
          }),
          prisma.interest.upsert({
            where: {
              senderId_receiverId: {
                senderId: likedUserId,
                receiverId: session.user.id,
              },
            },
            update: {
              status: 'ACCEPTED',
            },
            create: {
              senderId: likedUserId,
              receiverId: session.user.id,
              status: 'ACCEPTED',
            },
          }),
        ])

        // Create notifications for both users
        await Promise.all([
          prisma.notification.create({
            data: {
              userId: likedUserId,
              type: 'NEW_MATCH',
              title: 'It\'s a Match!',
              content: `You matched with ${session.user.name}!`,
              link: `/matches/${match.id}`,
            },
          }),
          prisma.notification.create({
            data: {
              userId: session.user.id,
              type: 'NEW_MATCH',
              title: 'It\'s a Match!',
              content: `You matched with ${likedUser.name}!`,
              link: `/matches/${match.id}`,
            },
          }),
        ])
      }
    } else {
      // Send special super like notification
      await prisma.notification.create({
        data: {
          userId: likedUserId,
          type: 'SUPER_LIKE',
          title: 'You got a Super Like!',
          content: `${session.user.name} super liked your profile!`,
          link: `/profile/${session.user.id}`,
        },
      })
    }

    // Get current user info for match response
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        photos: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      isSuperLike: true,
      isMatch: isMutualLike,
      remainingLikes: updatedQuota.remainingLikes,
      match: match ? {
        id: match.id,
        matchedAt: match.matchedAt,
        user: {
          id: likedUser.id,
          name: likedUser.name,
          photo: likedUser.photos[0]?.url || null,
        },
        currentUser: {
          id: currentUser?.id,
          name: currentUser?.name,
          photo: currentUser?.photos[0]?.url || null,
        },
      } : null,
    })
  } catch (error) {
    console.error('Error creating super like:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
