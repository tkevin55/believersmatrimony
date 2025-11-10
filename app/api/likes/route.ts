import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkMutualInterest, checkExistingMatch } from '@/lib/matching'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { likedUserId, message } = body

    if (!likedUserId) {
      return NextResponse.json(
        { error: 'likedUserId is required' },
        { status: 400 }
      )
    }

    // Check if user is trying to like themselves
    if (likedUserId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot like yourself' },
        { status: 400 }
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

    // Check if already liked
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
        { error: 'Cannot like this user' },
        { status: 400 }
      )
    }

    // Create the like
    await prisma.like.create({
      data: {
        likerId: session.user.id,
        likedId: likedUserId,
      },
    })

    // Check if mutual like exists
    const isMutualLike = await checkMutualInterest(session.user.id, likedUserId)

    let match = null
    let interest = null

    if (isMutualLike) {
      // Check if match already exists
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
        const [interest1, interest2] = await Promise.all([
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

        interest = interest1

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
      // No mutual like yet, just send a notification to the liked user
      await prisma.notification.create({
        data: {
          userId: likedUserId,
          type: 'PROFILE_LIKE',
          title: 'Someone liked your profile!',
          content: `${session.user.name} liked your profile`,
          link: `/profile/${session.user.id}`,
        },
      })
    }

    // Get current user info for match response
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        photos: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      isMatch: isMutualLike,
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
    console.error('Error creating like:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
