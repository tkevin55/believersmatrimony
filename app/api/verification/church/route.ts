import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendVerificationSMS } from '@/lib/sms'

// GET - Fetch user's church verification status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const verification = await prisma.churchVerification.findUnique({
      where: { userId: session.user.id },
    })

    if (!verification) {
      return NextResponse.json({ verification: null })
    }

    return NextResponse.json({ verification })
  } catch (error) {
    console.error('Error fetching church verification:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    )
  }
}

// POST - Submit church verification request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { pastorName, pastorPhone, churchName, churchAddress } = body

    // Validate required fields
    if (!pastorName || !pastorPhone || !churchName) {
      return NextResponse.json(
        { error: 'Pastor name, phone, and church name are required' },
        { status: 400 }
      )
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{4,}$/
    if (!phoneRegex.test(pastorPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Check if verification already exists
    const existingVerification = await prisma.churchVerification.findUnique({
      where: { userId: session.user.id },
    })

    if (existingVerification) {
      // If pending or verified, don't allow resubmission
      if (existingVerification.status === 'VERIFIED') {
        return NextResponse.json(
          { error: 'Your profile is already church verified' },
          { status: 400 }
        )
      }

      if (existingVerification.status === 'PENDING' && existingVerification.expiresAt > new Date()) {
        return NextResponse.json(
          { error: 'A verification request is already pending. Please wait for your pastor to respond.' },
          { status: 400 }
        )
      }
    }

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create or update verification request
    const verification = await prisma.churchVerification.upsert({
      where: { userId: session.user.id },
      update: {
        pastorName,
        pastorPhone,
        churchName,
        churchAddress,
        status: 'PENDING',
        expiresAt,
        requestedAt: new Date(),
        verifiedAt: null,
        verificationMessage: null,
      },
      create: {
        userId: session.user.id,
        pastorName,
        pastorPhone,
        churchName,
        churchAddress,
        expiresAt,
      },
    })

    // Get user details for the message
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    })

    // Send verification SMS/WhatsApp to pastor
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/church/${verification.verificationToken}`

    const message = `Hello ${pastorName},

${user?.name || 'A member'} (${user?.email}) has requested church verification on Believers Matrimony - a Christian matrimonial platform helping believers find their life partner.

They have listed you as their church elder/pastor at ${churchName}.

Please verify if ${user?.name} is an active member of your church by clicking:
${verificationUrl}

This link expires in 7 days.

About Believers Matrimony:
We are a faith-based matrimonial platform connecting Christian believers for meaningful relationships. Church verification helps build trust in our community.

If you did not expect this message or have concerns, please ignore it.

- Believers Matrimony Team`

    try {
      // Send SMS (implementation depends on SMS provider)
      await sendVerificationSMS(pastorPhone, message, verificationUrl)

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'PROFILE_VIEW', // We can add a new notification type later
          title: 'Church Verification Requested',
          content: `We've sent a verification request to ${pastorName}. They have 7 days to respond.`,
          link: '/dashboard?tab=settings',
        },
      })

      return NextResponse.json({
        success: true,
        verification,
        message: 'Verification request sent successfully',
      })
    } catch (smsError) {
      console.error('Error sending verification SMS:', smsError)

      // Still return success but with a note about SMS
      return NextResponse.json({
        success: true,
        verification,
        message: 'Verification request created. SMS delivery may be delayed.',
        warning: 'SMS sending encountered an issue',
      })
    }
  } catch (error) {
    console.error('Error creating church verification:', error)
    return NextResponse.json(
      { error: 'Failed to submit verification request' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel verification request
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const verification = await prisma.churchVerification.findUnique({
      where: { userId: session.user.id },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'No verification request found' },
        { status: 404 }
      )
    }

    if (verification.status === 'VERIFIED') {
      return NextResponse.json(
        { error: 'Cannot delete verified church verification' },
        { status: 400 }
      )
    }

    await prisma.churchVerification.delete({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Verification request cancelled',
    })
  } catch (error) {
    console.error('Error deleting church verification:', error)
    return NextResponse.json(
      { error: 'Failed to cancel verification request' },
      { status: 500 }
    )
  }
}
