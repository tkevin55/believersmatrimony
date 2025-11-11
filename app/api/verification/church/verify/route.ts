import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Pastor verifies the church membership (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, action, message } = body // action: 'approve' or 'reject'

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Find verification request by token
    const verification = await prisma.churchVerification.findUnique({
      where: { verificationToken: token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (verification.status === 'VERIFIED') {
      return NextResponse.json(
        { error: 'This verification has already been completed' },
        { status: 400 }
      )
    }

    // Check if expired
    if (verification.expiresAt < new Date()) {
      await prisma.churchVerification.update({
        where: { id: verification.id },
        data: { status: 'EXPIRED' },
      })

      return NextResponse.json(
        { error: 'This verification link has expired' },
        { status: 400 }
      )
    }

    // Update verification status
    const newStatus = action === 'approve' ? 'VERIFIED' : 'REJECTED'
    const updatedVerification = await prisma.churchVerification.update({
      where: { id: verification.id },
      data: {
        status: newStatus,
        verifiedAt: action === 'approve' ? new Date() : null,
        verificationMessage: message || null,
      },
    })

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: verification.userId,
        type: 'PROFILE_VIEW', // We can add a new notification type later
        title: action === 'approve' ? '✓ Church Verified!' : 'Verification Request Declined',
        content: action === 'approve'
          ? `Your church verification has been confirmed by ${verification.pastorName}. You now have a verified badge on your profile!`
          : `Your church verification request was declined by ${verification.pastorName}. ${message ? `Reason: ${message}` : ''}`,
        link: '/dashboard?tab=settings',
      },
    })

    return NextResponse.json({
      success: true,
      message: action === 'approve'
        ? 'Church membership verified successfully'
        : 'Verification request declined',
      verification: updatedVerification,
    })
  } catch (error) {
    console.error('Error verifying church membership:', error)
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 500 }
    )
  }
}

// GET - Get verification details by token (for pastor to see details before verifying)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const verification = await prisma.churchVerification.findUnique({
      where: { verificationToken: token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                denomination: true,
                churchName: true,
              },
            },
          },
        },
      },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 404 }
      )
    }

    // Check if expired
    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This verification link has expired', expired: true },
        { status: 400 }
      )
    }

    // Check if already processed
    if (verification.status === 'VERIFIED' || verification.status === 'REJECTED') {
      return NextResponse.json(
        {
          error: 'This verification has already been processed',
          status: verification.status,
          alreadyProcessed: true,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      verification: {
        userName: verification.user.name,
        userEmail: verification.user.email,
        churchName: verification.churchName,
        churchAddress: verification.churchAddress,
        denomination: verification.user.profile?.denomination,
        pastorName: verification.pastorName,
        requestedAt: verification.requestedAt,
        expiresAt: verification.expiresAt,
      },
    })
  } catch (error) {
    console.error('Error fetching verification details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification details' },
      { status: 500 }
    )
  }
}
