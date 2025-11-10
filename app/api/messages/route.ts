import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateMessageContent } from '@/lib/profanity'

// GET /api/messages - Fetch all conversations with last message
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get all matches for the user
    const matches = await prisma.match.findMany({
      where: {
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
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        matchedAt: 'desc',
      },
    })

    // Format conversations
    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUser = match.user1Id === userId ? match.user2 : match.user1
        const lastMessage = match.messages[0] || null

        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            matchId: match.id,
            receiverId: userId,
            isRead: false,
          },
        })

        // Check if user is online (active in last 5 minutes)
        const isOnline = otherUser.lastActive
          ? new Date().getTime() - new Date(otherUser.lastActive).getTime() < 5 * 60 * 1000
          : false

        return {
          matchId: match.id,
          user: {
            id: otherUser.id,
            name: otherUser.name,
            image: otherUser.image,
            isOnline,
          },
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                senderId: lastMessage.senderId,
              }
            : null,
          unreadCount,
          matchedAt: match.matchedAt,
        }
      })
    )

    // Sort by last message time
    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.matchedAt
      const bTime = b.lastMessage?.createdAt || b.matchedAt
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send a message (fallback for non-Socket.io)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { matchId, receiverId, content, type = 'TEXT' } = body

    // Validate input
    if (!matchId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate message content
    const validation = validateMessageContent(content)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      )
    }

    // Verify match exists and user is part of it
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { user1Id: userId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: userId },
        ],
      },
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Invalid match or unauthorized' },
        { status: 403 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        matchId,
        senderId: userId,
        receiverId,
        content,
        type,
      },
      include: {
        sender: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'NEW_MESSAGE',
        title: 'New Message',
        content: `${message.sender.name || 'Someone'} sent you a message`,
        link: `/messages/${matchId}`,
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
