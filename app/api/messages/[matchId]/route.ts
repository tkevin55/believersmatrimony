import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/messages/[matchId] - Fetch message history for a match
export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { matchId } = params

    // Get pagination params
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            image: true,
            lastActive: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            image: true,
            lastActive: true,
          },
        },
      },
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found or unauthorized' },
        { status: 404 }
      )
    }

    // Get the other user
    const otherUser = match.user1Id === userId ? match.user2 : match.user1

    // Check if user is online (active in last 5 minutes)
    const isOnline = otherUser.lastActive
      ? new Date().getTime() - new Date(otherUser.lastActive).getTime() < 5 * 60 * 1000
      : false

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: {
        matchId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      skip: offset,
      take: limit,
    })

    // Get total count
    const totalCount = await prisma.message.count({
      where: {
        matchId,
      },
    })

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        matchId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({
      match: {
        id: match.id,
        user: {
          id: otherUser.id,
          name: otherUser.name,
          image: otherUser.image,
          isOnline,
        },
      },
      messages,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + messages.length < totalCount,
      },
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
