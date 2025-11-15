import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Profile update schema (Kaapi Connect - secular)
const profileUpdateSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  aboutMe: z.string().optional(),
  // Kaapi Connect fields
  interestTags: z.array(z.string()).optional(),
  politicalLeaning: z.string().optional(),
  socialValues: z.array(z.string()).optional(),
  socialStyle: z.string().optional(),
  relationshipTimeline: z.string().optional(),
  wantChildren: z.string().optional(),
  livingArrangementPreference: z.string().optional(),
  relocationFlexibility: z.string().optional(),
  weekendPreference: z.array(z.string()).optional(),
  communicationStyle: z.string().optional(),
  homeDistrict: z.string().optional(),
  diasporaLocation: z.string().optional(),
  keralaConnection: z.string().optional(),
  languagePreference: z.string().optional(),
  // Physical & other attributes
  height: z.number().optional(),
  bodyType: z.enum(['SLIM', 'AVERAGE', 'ATHLETIC', 'CURVY', 'PLUS_SIZE']).optional(),
  educationLevel: z.enum(['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'PROFESSIONAL']).optional(),
  fieldOfStudy: z.string().optional(),
  occupation: z.string().optional(),
  incomeRange: z.string().optional(),
  parentsOccupation: z.string().optional(),
  siblingsCount: z.number().optional(),
  birthOrder: z.string().optional(),
  familyType: z.enum(['NUCLEAR', 'JOINT', 'SINGLE_PARENT']).optional(),
  familyValues: z.string().optional(),
  drinking: z.string().optional(),
  smoking: z.string().optional(),
  dietPreference: z.string().optional(),
  hobbies: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  openToRelocate: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  visibilityMode: z.string().optional(),
})

// Calculate profile completion percentage (Kaapi Connect)
function calculateProfileCompletion(profile: any): number {
  const fields = [
    'dateOfBirth', 'gender', 'aboutMe', 'interestTags', 'politicalLeaning',
    'homeDistrict', 'height', 'bodyType', 'educationLevel', 'fieldOfStudy',
    'occupation', 'incomeRange', 'parentsOccupation', 'siblingsCount',
    'familyType', 'familyValues', 'hobbies', 'city', 'state', 'country'
  ]

  const filledFields = fields.filter(field => {
    const value = profile[field]
    if (Array.isArray(value)) {
      return value.length > 0
    }
    return value !== null && value !== undefined && value !== ''
  }).length

  return Math.round((filledFields / fields.length) * 100)
}

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phoneNumber: true,
            createdAt: true,
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get user's photos
    const photos = await prisma.photo.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isPrimary: 'desc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json({
      profile,
      photos
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validatedData = profileUpdateSchema.parse(body)

    // Convert dateOfBirth string to Date if present
    const updateData: any = { ...validatedData }
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth)
    }

    // Update profile
    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: updateData
    })

    // Calculate and update completion percentage
    const completionPercentage = calculateProfileCompletion(profile)

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: { completionPercentage }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// DELETE /api/profile - Soft delete account
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Soft delete by updating user status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { status: 'DELETED' }
    })

    // Hide profile
    await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        isVisible: false,
        visibilityMode: 'hidden'
      }
    })

    return NextResponse.json({
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
