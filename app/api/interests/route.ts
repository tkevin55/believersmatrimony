import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch sent and received interests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all' // 'sent', 'received', or 'all'

    let sentInterests = []
    let receivedInterests = []

    if (type === 'sent' || type === 'all') {
      sentInterests = await prisma.interest.findMany({
        where: { senderId: session.user.id },
        include: {
          receiver: {
            include: {
              profile: true,
              photos: {
                where: { isPrimary: true },
                take: 1
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    if (type === 'received' || type === 'all') {
      receivedInterests = await prisma.interest.findMany({
        where: { receiverId: session.user.id },
        include: {
          sender: {
            include: {
              profile: true,
              photos: {
                where: { isPrimary: true },
                take: 1
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({
      sent: sentInterests,
      received: receivedInterests
    })
  } catch (error) {
    console.error('Error fetching interests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Send interest with optional message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { receiverId, message } = body

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      )
    }

    // Check if sender is trying to send to themselves
    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot send interest to yourself' },
        { status: 400 }
      )
    }

    // Check if receiver exists and has profile
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      include: { profile: true }
    })

    if (!receiver || !receiver.profile) {
      return NextResponse.json(
        { error: 'User not found or profile not complete' },
        { status: 404 }
      )
    }

    // Check if sender has profile
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true }
    })

    if (!sender || !sender.profile) {
      return NextResponse.json(
        { error: 'Please complete your profile before sending interests' },
        { status: 400 }
      )
    }

    // Check if blocked
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: session.user.id, blockedId: receiverId },
          { blockerId: receiverId, blockedId: session.user.id }
        ]
      }
    })

    if (isBlocked) {
      return NextResponse.json(
        { error: 'Cannot send interest to this user' },
        { status: 403 }
      )
    }

    // Check if interest already exists
    const existingInterest = await prisma.interest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: session.user.id,
          receiverId: receiverId
        }
      }
    })

    if (existingInterest) {
      return NextResponse.json(
        { error: 'Interest already sent to this user' },
        { status: 400 }
      )
    }

    // Validate message length if provided
    if (message && message.length > 500) {
      return NextResponse.json(
        { error: 'Message cannot exceed 500 characters' },
        { status: 400 }
      )
    }

    // Create the interest and log activities
    const [interest] = await prisma.$transaction([
      prisma.interest.create({
        data: {
          senderId: session.user.id,
          receiverId: receiverId,
          message: message || null,
          status: 'PENDING'
        },
        include: {
          receiver: {
            include: {
              profile: true,
              photos: {
                where: { isPrimary: true },
                take: 1
              }
            }
          }
        }
      }),
      // Log activity for sender
      prisma.activity.create({
        data: {
          userId: session.user.id,
          type: 'INTEREST_SENT',
          targetUserId: receiverId,
          metadata: { message: message || null }
        }
      }),
      // Log activity for receiver
      prisma.activity.create({
        data: {
          userId: receiverId,
          type: 'INTEREST_RECEIVED',
          targetUserId: session.user.id,
          metadata: { message: message || null }
        }
      }),
      // Create a notification for the receiver
      prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'INTEREST_RECEIVED',
          title: 'New Interest Received',
          content: `${session.user.name || 'Someone'} has sent you an interest!`,
          link: `/dashboard?tab=interests`
        }
      })
    ])

    return NextResponse.json(interest, { status: 201 })
  } catch (error) {
    console.error('Error sending interest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
