import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Update privacy settings
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
    const { visibilityMode, isVisible } = body

    // Validate visibilityMode if provided
    if (visibilityMode && !['all', 'matched_only', 'hidden'].includes(visibilityMode)) {
      return NextResponse.json(
        { error: 'Invalid visibility mode' },
        { status: 400 }
      )
    }

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Update profile privacy settings
    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        visibilityMode: visibilityMode || undefined,
        isVisible: typeof isVisible === 'boolean' ? isVisible : undefined
      }
    })

    return NextResponse.json({
      message: 'Privacy settings updated successfully',
      profile: {
        visibilityMode: updatedProfile.visibilityMode,
        isVisible: updatedProfile.isVisible
      }
    })
  } catch (error) {
    console.error('Error updating privacy settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
