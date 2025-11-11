import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Profile update schema
const profileUpdateSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  aboutMe: z.string().optional(),
  denomination: z.enum([
    'BAPTIST', 'METHODIST', 'PRESBYTERIAN', 'PENTECOSTAL',
    'NON_DENOMINATIONAL', 'LUTHERAN', 'ANGLICAN', 'EPISCOPAL',
    'REFORMED', 'EVANGELICAL', 'OTHER'
  ]).optional(),
  churchName: z.string().optional(),
  yearsAsBeliever: z.number().optional(),
  isBaptized: z.boolean().optional(),
  churchInvolvementLevel: z.string().optional(),
  height: z.number().optional(),
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
  district: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  openToRelocate: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  visibilityMode: z.string().optional(),
})

// Calculate profile completion percentage
function calculateProfileCompletion(profile: any): number {
  const fields = [
    'dateOfBirth', 'gender', 'aboutMe', 'denomination', 'churchName',
    'yearsAsBeliever', 'isBaptized', 'churchInvolvementLevel',
    'height', 'educationLevel', 'fieldOfStudy',
    'occupation', 'incomeRange', 'parentsOccupation', 'siblingsCount',
    'familyType', 'familyValues', 'hobbies', 'district', 'state', 'country'
  ]

  const filledFields = fields.filter(field => {
    const value = profile[field]
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
