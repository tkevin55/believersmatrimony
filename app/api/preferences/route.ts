import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch partner preferences
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await prisma.partnerPreferences.findUnique({
      where: { userId: session.user.id },
    })

    if (!preferences) {
      // Return default preferences
      return NextResponse.json({
        ageMin: 21,
        ageMax: 35,
        heightMin: 152,
        heightMax: 183,
        educationLevels: [],
        denominations: [],
        locations: [],
        incomeRange: null,
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// PUT - Update partner preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ageMin, ageMax, heightMin, heightMax, educationLevels, denominations, locations, incomeRange } = body

    // Validate ranges
    if (ageMin && ageMax && ageMin > ageMax) {
      return NextResponse.json(
        { error: 'Minimum age cannot be greater than maximum age' },
        { status: 400 }
      )
    }

    if (heightMin && heightMax && heightMin > heightMax) {
      return NextResponse.json(
        { error: 'Minimum height cannot be greater than maximum height' },
        { status: 400 }
      )
    }

    // Upsert preferences
    const preferences = await prisma.partnerPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        ageMin: ageMin || null,
        ageMax: ageMax || null,
        heightMin: heightMin || null,
        heightMax: heightMax || null,
        educationLevels: educationLevels || [],
        denominations: denominations || [],
        locations: locations || [],
        incomeRange: incomeRange || null,
      },
      create: {
        userId: session.user.id,
        ageMin: ageMin || null,
        ageMax: ageMax || null,
        heightMin: heightMin || null,
        heightMax: heightMax || null,
        educationLevels: educationLevels || [],
        denominations: denominations || [],
        locations: locations || [],
        incomeRange: incomeRange || null,
      },
    })

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences,
    })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
