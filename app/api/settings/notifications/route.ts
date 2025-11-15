export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Update notification preferences
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      emailNotifications,
      matchNotifications,
      messageNotifications,
      interestNotifications
    } = body

    // In a real application, you would store these preferences in a separate
    // NotificationPreferences table. For now, we'll just return success.
    // You can extend the User model or create a new model to store these preferences.

    // TODO: Store notification preferences in database
    // Example:
    // await prisma.notificationPreferences.upsert({
    //   where: { userId: session.user.id },
    //   update: {
    //     emailNotifications,
    //     matchNotifications,
    //     messageNotifications,
    //     interestNotifications
    //   },
    //   create: {
    //     userId: session.user.id,
    //     emailNotifications,
    //     matchNotifications,
    //     messageNotifications,
    //     interestNotifications
    //   }
    // })

    return NextResponse.json({
      message: 'Notification preferences updated successfully',
      preferences: {
        emailNotifications,
        matchNotifications,
        messageNotifications,
        interestNotifications
      }
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Fetch notification preferences
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Fetch from database when NotificationPreferences model is created
    // For now, return default values
    return NextResponse.json({
      emailNotifications: true,
      matchNotifications: true,
      messageNotifications: true,
      interestNotifications: true
    })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
