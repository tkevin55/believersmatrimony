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
      // Create profile (Kaapi Connect - secular)
      const newProfile = await tx.profile.create({
        data: {
          userId,
          dateOfBirth: new Date(profile.dateOfBirth),
          gender: profile.gender,
          aboutMe: profile.aboutMe,
          // Kaapi Connect fields
          interestTags: profile.interestTags || [],
          politicalLeaning: profile.politicalLeaning || null,
          socialValues: profile.socialValues || [],
          socialStyle: profile.socialStyle || null,
          relationshipTimeline: profile.relationshipTimeline || null,
          wantChildren: profile.wantChildren || null,
          livingArrangementPreference: profile.livingArrangementPreference || null,
          relocationFlexibility: profile.relocationFlexibility || null,
          weekendPreference: profile.weekendPreference || [],
          communicationStyle: profile.communicationStyle || null,
          homeDistrict: profile.homeDistrict || null,
          diasporaLocation: profile.diasporaLocation || null,
          keralaConnection: profile.keralaConnection || null,
          languagePreference: profile.languagePreference || null,
          // Physical & other attributes
          height: profile.height,
          bodyType: profile.bodyType,
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
          city: profile.city,
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

      // Create partner preferences (Kaapi Connect - secular)
      const preferences = await tx.partnerPreferences.create({
        data: {
          userId,
          ageMin: partnerPreferences.ageMin,
          ageMax: partnerPreferences.ageMax,
          heightMin: partnerPreferences.heightMin,
          heightMax: partnerPreferences.heightMax,
          locations: partnerPreferences.locations || [],
          educationLevels: partnerPreferences.educationLevels || [],
          // Kaapi Connect preferences
          preferredInterests: partnerPreferences.preferredInterests || [],
          preferredPoliticalLeanings: partnerPreferences.preferredPoliticalLeanings || [],
          preferredSocialValues: partnerPreferences.preferredSocialValues || [],
          preferredKeralaDistricts: partnerPreferences.preferredKeralaDistricts || [],
          okayWithDiaspora: partnerPreferences.okayWithDiaspora ?? null,
        }
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
