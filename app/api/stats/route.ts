import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch user stats for dashboard
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Fetch all stats in parallel for better performance
    const [profile, interestsReceived, matchesCount, likesReceived] = await Promise.all([
      // Get profile for views count and completion percentage
      prisma.profile.findUnique({
        where: { userId }
      }),

      // Count interests received
      prisma.interest.count({
        where: {
          receiverId: userId,
          status: 'PENDING'
        }
      }),

      // Count matches
      prisma.match.count({
        where: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      }),

      // Count likes received
      prisma.like.count({
        where: { likedId: userId }
      })
    ])

    return NextResponse.json({
      profileViews: profile?.profileViews || 0,
      interestsReceived,
      matchesCount,
      likesReceived,
      profileCompletionPercentage: profile?.completionPercentage || 0
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
