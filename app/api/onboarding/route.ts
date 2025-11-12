import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateProfileCompletion } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, profile, partnerPreferences } = body

    // Verify the userId matches the session
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId }
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 400 }
      )
    }

    // Create profile and partner preferences in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create profile
      const newProfile = await tx.profile.create({
        data: {
          userId,
          dateOfBirth: new Date(profile.dateOfBirth),
          gender: profile.gender,
          aboutMe: profile.aboutMe,
          denomination: profile.denomination,
          churchName: profile.churchName,
          yearsAsBeliever: profile.yearsAsBeliever || 0,
          isBaptized: profile.isBaptized,
          height: profile.height,
          educationLevel: profile.educationLevel,
          fieldOfStudy: profile.fieldOfStudy,
          occupation: profile.occupation,
          incomeRange: profile.incomeRange,
          parentsOccupation: profile.parentsOccupation,
          siblingsCount: profile.siblingsCount,
          familyType: profile.familyType,
          familyValues: profile.familyValues,
          drinking: profile.drinking,
          smoking: profile.smoking,
          dietPreference: profile.dietPreference,
          hobbies: profile.hobbies,
          district: profile.district,
          state: profile.state,
          country: profile.country,
          openToRelocate: profile.openToRelocate,
          isVisible: true,
          completionPercentage: 0, // Will be calculated below
        }
      })

      // Calculate and update profile completion
      const completion = calculateProfileCompletion(newProfile)
      await tx.profile.update({
        where: { id: newProfile.id },
        data: { completionPercentage: completion }
      })

      // Create partner preferences
      const preferences = await tx.partnerPreferences.create({
        data: {
          userId,
          ageMin: partnerPreferences.ageMin,
          ageMax: partnerPreferences.ageMax,
          heightMin: partnerPreferences.heightMin,
          heightMax: partnerPreferences.heightMax,
          denominations: partnerPreferences.denominations || [],
          locations: partnerPreferences.locations || [],
        }
      })

      // Mark onboarding as completed
      await tx.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true }
      })

      return { profile: newProfile, preferences }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Profile created successfully',
        data: result
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'An error occurred while creating your profile' },
      { status: 500 }
    )
  }
}
