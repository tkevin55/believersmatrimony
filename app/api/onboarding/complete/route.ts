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
    const { userId, ...formData } = body

    // Verify the userId matches the session
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has already completed onboarding
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true }
    })

    if (user?.onboardingCompleted) {
      return NextResponse.json(
        { error: 'Onboarding already completed' },
        { status: 400 }
      )
    }

    // Perform the complete onboarding in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user with name and phone
      await tx.user.update({
        where: { id: userId },
        data: {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
        }
      })

      // Store church name with location
      const churchFullName = formData.churchLocation
        ? `${formData.churchName}, ${formData.churchLocation}`
        : formData.churchName

      // Upsert profile
      const profile = await tx.profile.upsert({
        where: { userId },
        update: {
          dateOfBirth: new Date(formData.dateOfBirth),
          gender: formData.gender,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          openToRelocate: formData.openToRelocate === 'yes',
          denomination: formData.denomination,
          churchName: churchFullName,
          yearsAsBeliever: parseInt(formData.yearsAsBeliever?.replace('+', '').split('-')[0] || '0'),
          isBaptized: formData.isBaptized === 'yes',
          churchInvolvementLevel: formData.churchInvolvement,
          faithTestimony: formData.faithTestimony,
          height: formData.height,
          bodyType: formData.bodyType,
          complexion: formData.complexion,
          languages: formData.languages || [],
          educationLevel: formData.educationLevel,
          fieldOfStudy: formData.fieldOfStudy,
          occupation: formData.occupation,
          incomeRange: formData.incomeRange,
          parentsOccupation: `Father: ${formData.fatherOccupation}, Mother: ${formData.motherOccupation}`,
          siblingsCount: formData.siblingsCount,
          birthOrder: formData.birthOrder,
          familyType: formData.familyType,
          familyValues: formData.familyValues,
          drinking: formData.drinking,
          smoking: formData.smoking,
          dietPreference: formData.diet,
          hobbies: formData.hobbies?.join(', '),
        },
        create: {
          userId,
          dateOfBirth: new Date(formData.dateOfBirth),
          gender: formData.gender,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          openToRelocate: formData.openToRelocate === 'yes',
          denomination: formData.denomination,
          churchName: churchFullName,
          yearsAsBeliever: parseInt(formData.yearsAsBeliever?.replace('+', '').split('-')[0] || '0'),
          isBaptized: formData.isBaptized === 'yes',
          churchInvolvementLevel: formData.churchInvolvement,
          faithTestimony: formData.faithTestimony,
          height: formData.height,
          bodyType: formData.bodyType,
          complexion: formData.complexion,
          languages: formData.languages || [],
          educationLevel: formData.educationLevel,
          fieldOfStudy: formData.fieldOfStudy,
          occupation: formData.occupation,
          incomeRange: formData.incomeRange,
          parentsOccupation: `Father: ${formData.fatherOccupation}, Mother: ${formData.motherOccupation}`,
          siblingsCount: formData.siblingsCount,
          birthOrder: formData.birthOrder,
          familyType: formData.familyType,
          familyValues: formData.familyValues,
          drinking: formData.drinking,
          smoking: formData.smoking,
          dietPreference: formData.diet,
          hobbies: formData.hobbies?.join(', '),
        }
      })

      // Save photos if provided
      if (formData.photos && formData.photos.length >= 3) {
        // Delete existing photos
        await tx.photo.deleteMany({
          where: { userId }
        })

        // Create new photos
        const photoPromises = formData.photos.map((photo: any) =>
          tx.photo.create({
            data: {
              userId,
              url: photo.data, // Base64 data for now
              order: photo.order,
              isPrimary: photo.isPrimary,
            }
          })
        )

        await Promise.all(photoPromises)
      }

      // Create or update partner preferences
      await tx.partnerPreferences.upsert({
        where: { userId },
        update: {
          ageMin: formData.partnerAgeMin,
          ageMax: formData.partnerAgeMax,
          heightMin: formData.partnerHeightMin,
          heightMax: formData.partnerHeightMax,
          educationLevels: [formData.partnerMinEducation],
          denominations: formData.partnerDenominations || [],
          locations: formData.partnerLocations || [],
          incomeRange: formData.partnerIncomeExpectation,
        },
        create: {
          userId,
          ageMin: formData.partnerAgeMin,
          ageMax: formData.partnerAgeMax,
          heightMin: formData.partnerHeightMin,
          heightMax: formData.partnerHeightMax,
          educationLevels: [formData.partnerMinEducation],
          denominations: formData.partnerDenominations || [],
          locations: formData.partnerLocations || [],
          incomeRange: formData.partnerIncomeExpectation,
        }
      })

      // Calculate profile completion
      const completion = calculateProfileCompletion(profile)
      await tx.profile.update({
        where: { id: profile.id },
        data: { completionPercentage: completion }
      })

      // Mark onboarding as completed
      await tx.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true }
      })

      return { profile }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Onboarding completed successfully',
        data: result
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { error: 'An error occurred while completing onboarding' },
      { status: 500 }
    )
  }
}
