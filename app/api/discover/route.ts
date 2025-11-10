import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCuratedMatches } from '@/lib/matching'
import { calculateAge, formatHeight } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate parameters
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      )
    }

    // Get curated matches
    const matches = await getCuratedMatches(session.user.id, limit, offset)

    // Format matches for response
    const formattedMatches = matches.map((match) => {
      const age = calculateAge(match.dateOfBirth)
      const primaryPhoto = match.user.photos.find((p) => p.isPrimary) || match.user.photos[0]

      return {
        id: match.userId,
        name: match.user.name,
        age,
        gender: match.gender,
        location: [match.city, match.state].filter(Boolean).join(', '),
        denomination: match.denomination,
        educationLevel: match.educationLevel,
        occupation: match.occupation,
        height: match.height ? formatHeight(match.height) : null,
        aboutMe: match.aboutMe,
        primaryPhoto: primaryPhoto?.url || null,
        matchPercentage: match.matchScore,
        profileViews: match.profileViews,
        churchName: match.churchName,
        yearsAsBeliever: match.yearsAsBeliever,
      }
    })

    return NextResponse.json({
      matches: formattedMatches,
      hasMore: matches.length === limit,
      offset: offset + matches.length,
    })
  } catch (error) {
    console.error('Error fetching discovery feed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
