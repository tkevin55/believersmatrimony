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

    console.log('📝 Onboarding completion request:', {
      userId,
      hasPhotos: !!formData.photos,
      photoCount: formData.photos?.length || 0,
      requiredFields: {
        name: !!formData.name,
        dateOfBirth: !!formData.dateOfBirth,
        gender: !!formData.gender,
        city: !!formData.city,
        denomination: !!formData.denomination,
        height: !!formData.height,
        educationLevel: !!formData.educationLevel,
        occupation: !!formData.occupation,
      }
    })

    // Verify the userId matches the session
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate required fields
    const requiredFields = ['name', 'dateOfBirth', 'gender', 'city', 'state', 'country', 'denomination', 'height', 'educationLevel', 'occupation']
    const missingFields = requiredFields.filter(field => !formData[field])

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields)
      return NextResponse.json(
        {
          error: 'Missing required fields',
          fields: missingFields
        },
        { status: 400 }
      )
    }

    // Validate photos
    if (!formData.photos || formData.photos.length < 3) {
      console.error('❌ Insufficient photos:', formData.photos?.length || 0)
      return NextResponse.json(
        {
          error: 'Please upload at least 3 photos',
          photoCount: formData.photos?.length || 0
        },
        { status: 400 }
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

      // Parse height - ensure it's an integer
      const heightValue = parseInt(String(formData.height), 10)
      if (isNaN(heightValue)) {
        throw new Error(`Invalid height value: ${formData.height}`)
      }

      // Parse years as believer safely
      let yearsValue = 0
      if (formData.yearsAsBeliever) {
        const yearString = String(formData.yearsAsBeliever).replace('+', '').split('-')[0]
        yearsValue = parseInt(yearString, 10) || 0
      }

      // Parse siblings count
      const siblingsValue = parseInt(String(formData.siblingsCount || 0), 10)

      // Profile data object
      const profileData = {
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        openToRelocate: formData.openToRelocate === 'yes',
        denomination: formData.denomination,
        churchName: churchFullName,
        yearsAsBeliever: yearsValue,
        isBaptized: formData.isBaptized === 'yes',
        churchInvolvementLevel: formData.churchInvolvement || null,
        faithTestimony: formData.faithTestimony || null,
        height: heightValue,
        bodyType: formData.bodyType || null,
        complexion: formData.complexion || null,
        languages: formData.languages || [],
        educationLevel: formData.educationLevel || null,
        fieldOfStudy: formData.fieldOfStudy || null,
        occupation: formData.occupation || null,
        incomeRange: formData.incomeRange || null,
        parentsOccupation: `Father: ${formData.fatherOccupation || 'N/A'}, Mother: ${formData.motherOccupation || 'N/A'}`,
        siblingsCount: siblingsValue,
        birthOrder: formData.birthOrder || null,
        familyType: formData.familyType || null,
        familyValues: formData.familyValues || null,
        drinking: formData.drinking || null,
        smoking: formData.smoking || null,
        dietPreference: formData.diet || null,
        hobbies: formData.hobbies ? formData.hobbies.join(', ') : null,
      }

      console.log('📊 Profile data prepared:', {
        height: heightValue,
        yearsAsBeliever: yearsValue,
        siblingsCount: siblingsValue,
        denomination: formData.denomination,
        churchInvolvement: formData.churchInvolvement,
      })

      // Upsert profile
      const profile = await tx.profile.upsert({
        where: { userId },
        update: profileData,
        create: {
          userId,
          ...profileData
        }
      })

      // Save photos if provided
      if (formData.photos && formData.photos.length >= 3) {
        console.log(`💾 Saving ${formData.photos.length} photos...`)

        // Delete existing photos
        await tx.photo.deleteMany({
          where: { userId }
        })

        // Create new photos
        const photoPromises = formData.photos.map((photo: any, index: number) => {
          console.log(`  📸 Photo ${index + 1}: isPrimary=${photo.isPrimary}, order=${photo.order}, dataLength=${photo.data?.length || 0}`)
          return tx.photo.create({
            data: {
              userId,
              url: photo.data, // Base64 data for now
              order: photo.order || index,
              isPrimary: photo.isPrimary || false,
            }
          })
        })

        await Promise.all(photoPromises)
        console.log('✅ Photos saved successfully')
      }

      // Parse partner preferences
      const partnerAgeMin = parseInt(String(formData.partnerAgeMin || 18), 10)
      const partnerAgeMax = parseInt(String(formData.partnerAgeMax || 60), 10)
      const partnerHeightMin = parseInt(String(formData.partnerHeightMin || 122), 10)
      const partnerHeightMax = parseInt(String(formData.partnerHeightMax || 213), 10)

      const partnerPrefsData = {
        ageMin: partnerAgeMin,
        ageMax: partnerAgeMax,
        heightMin: partnerHeightMin,
        heightMax: partnerHeightMax,
        educationLevels: formData.partnerMinEducation ? [formData.partnerMinEducation] : [],
        denominations: formData.partnerDenominations || [],
        locations: formData.partnerLocations || [],
        incomeRange: formData.partnerIncomeExpectation || null,
      }

      console.log('💑 Partner preferences:', partnerPrefsData)

      // Create or update partner preferences
      await tx.partnerPreferences.upsert({
        where: { userId },
        update: partnerPrefsData,
        create: {
          userId,
          ...partnerPrefsData
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

      console.log('✅ Onboarding completed successfully for user:', userId)

      return { profile }
    })

    console.log('🎉 Transaction completed! User is fully onboarded.')

    return NextResponse.json(
      {
        success: true,
        message: 'Profile created successfully! Welcome to Believers Matrimony.',
        data: result
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('❌ ONBOARDING COMPLETION ERROR:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    })

    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        error: 'Failed to complete onboarding',
        details: errorMessage,
        hint: 'Please check all required fields are filled correctly'
      },
      { status: 500 }
    )
  }
}
