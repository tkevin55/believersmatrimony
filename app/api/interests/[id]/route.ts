import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Update interest status (accept/decline)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await req.json()
    const { status } = body

    if (!status || !['ACCEPTED', 'DECLINED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACCEPTED or DECLINED' },
        { status: 400 }
      )
    }

    // Find the interest
    const interest = await prisma.interest.findUnique({
      where: { id },
      include: {
        sender: true,
        receiver: true
      }
    })

    if (!interest) {
      return NextResponse.json(
        { error: 'Interest not found' },
        { status: 404 }
      )
    }

    // Only the receiver can update the interest status
    if (interest.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only respond to interests sent to you' },
        { status: 403 }
      )
    }

    // Cannot update if already accepted or declined
    if (interest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Interest has already been responded to' },
        { status: 400 }
      )
    }

    // Update the interest status
    const updatedInterest = await prisma.interest.update({
      where: { id },
      data: { status },
      include: {
        sender: {
          include: {
            profile: true,
            photos: {
              where: { isPrimary: true },
              take: 1
            }
          }
        },
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
    })

    // If accepted, create a match
    if (status === 'ACCEPTED') {
      // Check if match already exists (in either direction)
      const existingMatch = await prisma.match.findFirst({
        where: {
          OR: [
            { user1Id: interest.senderId, user2Id: interest.receiverId },
            { user1Id: interest.receiverId, user2Id: interest.senderId }
          ]
        }
      })

      if (!existingMatch) {
        await prisma.match.create({
          data: {
            user1Id: interest.senderId,
            user2Id: interest.receiverId
          }
        })
      }

      // Create a notification for the sender
      await prisma.notification.create({
        data: {
          userId: interest.senderId,
          type: 'INTEREST_ACCEPTED',
          title: 'Interest Accepted!',
          content: `${session.user.name || 'Someone'} has accepted your interest!`,
          link: `/dashboard?tab=matches`
        }
      })
    }

    return NextResponse.json(updatedInterest)
  } catch (error) {
    console.error('Error updating interest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
