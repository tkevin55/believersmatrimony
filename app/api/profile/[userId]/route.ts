import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/profile/[userId] - Get user's public profile
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { userId } = params

    // Check if user is blocked by or has blocked the viewer
    if (session?.user?.id) {
      const block = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: session.user.id, blockedId: userId },
            { blockerId: userId, blockedId: session.user.id }
          ]
        }
      })

      if (block) {
        return NextResponse.json(
          { error: 'Profile not accessible' },
          { status: 403 }
        )
      }
    }

    // Fetch user profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: false, // Don't expose email
            image: true,
            phoneNumber: false, // Don't expose phone
            createdAt: true,
            lastActive: true,
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check visibility settings
    if (!profile.isVisible || profile.visibilityMode === 'hidden') {
      // Only allow owner to view hidden profile
      if (session?.user?.id !== userId) {
        return NextResponse.json(
          { error: 'Profile not visible' },
          { status: 403 }
        )
      }
    }

    // If visibility mode is matched_only, check if there's a match
    if (profile.visibilityMode === 'matched_only' && session?.user?.id && session.user.id !== userId) {
      const match = await prisma.match.findFirst({
        where: {
          OR: [
            { user1Id: session.user.id, user2Id: userId },
            { user1Id: userId, user2Id: session.user.id }
          ]
        }
      })

      if (!match) {
        return NextResponse.json(
          { error: 'Profile only visible to matched users' },
          { status: 403 }
        )
      }
    }

    // Fetch user's photos
    const photos = await prisma.photo.findMany({
      where: { userId },
      orderBy: [
        { isPrimary: 'desc' },
        { order: 'asc' }
      ]
    })

    // Check if viewer has sent/received interest
    let interestStatus = null
    if (session?.user?.id && session.user.id !== userId) {
      const sentInterest = await prisma.interest.findFirst({
        where: {
          senderId: session.user.id,
          receiverId: userId
        }
      })

      const receivedInterest = await prisma.interest.findFirst({
        where: {
          senderId: userId,
          receiverId: session.user.id
        }
      })

      interestStatus = {
        sent: sentInterest ? sentInterest.status : null,
        received: receivedInterest ? receivedInterest.status : null
      }

      // Increment profile view count (only if not owner)
      await prisma.profile.update({
        where: { userId },
        data: { profileViews: { increment: 1 } }
      })
    }

    // Check if there's a match
    let isMatched = false
    if (session?.user?.id && session.user.id !== userId) {
      const match = await prisma.match.findFirst({
        where: {
          OR: [
            { user1Id: session.user.id, user2Id: userId },
            { user1Id: userId, user2Id: session.user.id }
          ]
        }
      })
      isMatched = !!match
    }

    // Check verification status
    const verifications = await prisma.verification.findMany({
      where: {
        userId,
        status: 'APPROVED'
      },
      select: {
        type: true
      }
    })

    return NextResponse.json({
      profile,
      photos,
      interestStatus,
      isMatched,
      verifications: verifications.map((v: any) => v.type)
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
