import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Verification request schema
const verificationRequestSchema = z.object({
  type: z.enum(['EMAIL', 'PHONE', 'PHOTO']),
  data: z.string().optional(), // Photo URL or verification code
})

// POST /api/verification - Request verification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = verificationRequestSchema.parse(body)

    // Check if there's already a pending verification of this type
    const existingVerification = await prisma.verification.findFirst({
      where: {
        userId: session.user.id,
        type: validatedData.type as string,
        status: 'PENDING'
      }
    })

    if (existingVerification) {
      return NextResponse.json(
        { error: `You already have a pending ${validatedData.type.toLowerCase()} verification request` },
        { status: 400 }
      )
    }

    // Create verification request
    const verification = await prisma.verification.create({
      data: {
        userId: session.user.id,
        type: validatedData.type as string,
        data: validatedData.data,
        status: 'PENDING',
      }
    })

    // Get all admin users for notification
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'MODERATOR'] },
        status: 'ACTIVE'
      },
      select: { id: true }
    })

    // Get user name for notification
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true }
    })

    // Create notifications for all admins
    const adminNotifications = admins.map((admin: any) => ({
      userId: admin.id,
      type: 'NEW_MESSAGE' as const,
      title: 'New Verification Request',
      content: `${user?.name || 'A user'} requested ${validatedData.type.toLowerCase()} verification`,
      link: `/admin/verifications/${verification.id}`,
      isRead: false,
    }))

    if (adminNotifications.length > 0) {
      await prisma.notification.createMany({
        data: adminNotifications
      })
    }

    return NextResponse.json({
      message: 'Verification request submitted successfully',
      verification: {
        id: verification.id,
        type: verification.type,
        status: verification.status,
        createdAt: verification.createdAt,
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating verification request:', error)
    return NextResponse.json(
      { error: 'Failed to submit verification request' },
      { status: 500 }
    )
  }
}

// GET /api/verification - Get user's verifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: any = { userId: session.user.id }
    if (type) {
      where.type = type
    }

    const verifications = await prisma.verification.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ verifications })
  } catch (error) {
    console.error('Error fetching verifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verifications' },
      { status: 500 }
    )
  }
}

// PUT /api/verification - Update verification status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or moderator
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { verificationId, status, note } = body

    if (!verificationId || !status) {
      return NextResponse.json(
        { error: 'Verification ID and status are required' },
        { status: 400 }
      )
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update verification
    const verification = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status,
        verifiedBy: session.user.id,
        verifiedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    // If photo verification is approved, mark the photo as verified
    if (verification.type === 'PHOTO' && status === 'APPROVED' && verification.data) {
      await prisma.photo.updateMany({
        where: {
          userId: verification.userId,
          url: verification.data
        },
        data: { isVerified: true }
      })
    }

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: verification.userId,
        type: 'NEW_MESSAGE',
        title: `Verification ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
        content: `Your ${verification.type.toLowerCase()} verification has been ${status.toLowerCase()}${note ? `: ${note}` : ''}`,
        isRead: false,
      }
    })

    return NextResponse.json({
      message: 'Verification updated successfully',
      verification
    })
  } catch (error) {
    console.error('Error updating verification:', error)
    return NextResponse.json(
      { error: 'Failed to update verification' },
      { status: 500 }
    )
  }
}
