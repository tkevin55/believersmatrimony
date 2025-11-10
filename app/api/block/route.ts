import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Block user schema
const blockUserSchema = z.object({
  blockedId: z.string(),
  reason: z.string().optional(),
})

// GET /api/block - Get list of blocked users
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const blockedUsers = await prisma.block.findMany({
      where: { blockerId: session.user.id },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            image: true,
            profile: {
              select: {
                city: true,
                state: true,
                gender: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ blockedUsers })
  } catch (error) {
    console.error('Error fetching blocked users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocked users' },
      { status: 500 }
    )
  }
}

// POST /api/block - Block a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = blockUserSchema.parse(body)

    // Prevent self-blocking
    if (validatedData.blockedId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 }
      )
    }

    // Check if user to be blocked exists
    const userToBlock = await prisma.user.findUnique({
      where: { id: validatedData.blockedId }
    })

    if (!userToBlock) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already blocked
    const existingBlock = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId: validatedData.blockedId
        }
      }
    })

    if (existingBlock) {
      return NextResponse.json(
        { error: 'User already blocked' },
        { status: 400 }
      )
    }

    // Create block
    const block = await prisma.block.create({
      data: {
        blockerId: session.user.id,
        blockedId: validatedData.blockedId,
        reason: validatedData.reason,
      },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })

    // Delete any existing matches between the users
    await prisma.match.deleteMany({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: validatedData.blockedId },
          { user1Id: validatedData.blockedId, user2Id: session.user.id },
        ]
      }
    })

    // Delete any pending interests
    await prisma.interest.deleteMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: validatedData.blockedId },
          { senderId: validatedData.blockedId, receiverId: session.user.id },
        ]
      }
    })

    return NextResponse.json({
      message: 'User blocked successfully',
      block
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error blocking user:', error)
    return NextResponse.json(
      { error: 'Failed to block user' },
      { status: 500 }
    )
  }
}

// DELETE /api/block - Unblock a user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const blockedId = searchParams.get('blockedId')

    if (!blockedId) {
      return NextResponse.json(
        { error: 'Blocked user ID is required' },
        { status: 400 }
      )
    }

    // Find and delete the block
    const block = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId
        }
      }
    })

    if (!block) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      )
    }

    await prisma.block.delete({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId
        }
      }
    })

    return NextResponse.json({
      message: 'User unblocked successfully'
    })
  } catch (error) {
    console.error('Error unblocking user:', error)
    return NextResponse.json(
      { error: 'Failed to unblock user' },
      { status: 500 }
    )
  }
}
