import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET user's selected interests
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userInterests = await prisma.userInterest.findMany({
      where: { userId: session.user.id },
      include: {
        interestOption: true
      }
    })

    return NextResponse.json({
      interests: userInterests.map(ui => ui.interestOption)
    })
  } catch (error) {
    console.error('Error fetching user interests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interests' },
      { status: 500 }
    )
  }
}

// POST add new interest
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { interestOptionId } = await request.json()

    // Check if user already has 5 interests
    const existingCount = await prisma.userInterest.count({
      where: { userId: session.user.id }
    })

    if (existingCount >= 5) {
      return NextResponse.json(
        { error: 'You can only select up to 5 interests' },
        { status: 400 }
      )
    }

    const userInterest = await prisma.userInterest.create({
      data: {
        userId: session.user.id,
        interestOptionId
      },
      include: {
        interestOption: true
      }
    })

    return NextResponse.json({ interest: userInterest.interestOption }, { status: 201 })
  } catch (error: any) {
    console.error('Error adding user interest:', error)

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already selected this interest' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add interest' },
      { status: 500 }
    )
  }
}

// DELETE remove interest
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const interestOptionId = searchParams.get('interestOptionId')

    if (!interestOptionId) {
      return NextResponse.json(
        { error: 'Interest ID is required' },
        { status: 400 }
      )
    }

    await prisma.userInterest.deleteMany({
      where: {
        userId: session.user.id,
        interestOptionId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user interest:', error)
    return NextResponse.json(
      { error: 'Failed to remove interest' },
      { status: 500 }
    )
  }
}
