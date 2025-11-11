import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Fetch user with profile, photos, and partner preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        photos: {
          orderBy: { order: 'asc' }
        },
        partnerPreferences: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If no profile exists yet, return empty progress
    if (!user.profile) {
      return NextResponse.json({
        hasProgress: false,
        data: null
      })
    }

    // Parse parentsOccupation back to separate fields
    let fatherOccupation = ''
    let motherOccupation = ''
    if (user.profile.parentsOccupation) {
      // Handle both old format (comma) and new format (pipe)
      let match = user.profile.parentsOccupation.match(/Father: ([^|]+) \| Mother: (.+)/)
      if (!match) {
        // Fallback to old format for backwards compatibility
        match = user.profile.parentsOccupation.match(/Father: ([^,]+), Mother: (.+)/)
      }
      if (match) {
        fatherOccupation = match[1].trim() !== 'N/A' ? match[1].trim() : ''
        motherOccupation = match[2].trim() !== 'N/A' ? match[2].trim() : ''
      }
    }

    // Parse church name and location
    let churchName = user.profile.churchName || ''
    let churchLocation = ''
    if (churchName.includes(',')) {
      const parts = churchName.split(',')
      churchName = parts[0].trim()
      churchLocation = parts.slice(1).join(',').trim()
    }

    // Convert profile data to form format
    const formData = {
      name: user.name,
      phoneNumber: user.phoneNumber?.replace(/^\+\d+/, ''), // Remove country code
      countryCode: user.phoneNumber?.match(/^\+\d+/)?.[0] || '+91',
      dateOfBirth: user.profile.dateOfBirth?.toISOString().split('T')[0],
      gender: user.profile.gender,
      district: user.profile.district,
      state: user.profile.state,
      country: user.profile.country,
      openToRelocate: user.profile.openToRelocate ? 'yes' : 'no',
      denomination: user.profile.denomination,
      churchName,
      churchLocation,
      yearsAsBeliever: user.profile.yearsAsBeliever?.toString(),
      isBaptized: user.profile.isBaptized ? 'yes' : 'no',
      churchInvolvement: user.profile.churchInvolvementLevel,
      faithTestimony: user.profile.faithTestimony,
      favoriteVerseReference: user.profile.favoriteVerseReference,
      favoriteVerseWhy: user.profile.favoriteVerseWhy,
      height: user.profile.height,
      motherTongue: user.profile.motherTongue,
      languages: user.profile.languages || [],
      educationLevel: user.profile.educationLevel,
      fieldOfStudy: user.profile.fieldOfStudy,
      occupation: user.profile.occupation,
      incomeRange: user.profile.incomeRange,
      fatherOccupation,
      motherOccupation,
      siblingsCount: user.profile.siblingsCount || 0,
      birthOrder: user.profile.birthOrder,
      familyType: user.profile.familyType,
      familyValues: user.profile.familyValues,
      drinking: user.profile.drinking,
      smoking: user.profile.smoking,
      diet: user.profile.dietPreference,
      hobbies: user.profile.hobbies?.split(', ').filter(Boolean) || [],
      photos: user.photos.map((photo: any) => ({
        data: photo.url,
        order: photo.order,
        isPrimary: photo.isPrimary
      })),
      partnerAgeMin: user.partnerPreferences?.ageMin,
      partnerAgeMax: user.partnerPreferences?.ageMax,
      partnerHeightMin: user.partnerPreferences?.heightMin,
      partnerHeightMax: user.partnerPreferences?.heightMax,
      partnerMinEducation: user.partnerPreferences?.educationLevels?.[0],
      partnerDenominations: user.partnerPreferences?.denominations || [],
      partnerLocations: user.partnerPreferences?.locations || [],
    }

    return NextResponse.json({
      hasProgress: true,
      data: formData
    })

  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching progress' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, step, data } = body

    // Verify the userId matches the session
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or create profile
    let profile = await prisma.profile.findUnique({
      where: { userId }
    })

    // Save progress based on step
    switch (step) {
      case 1:
        // Update user table with basic info
        await prisma.user.update({
          where: { id: userId },
          data: {
            name: data.name,
            phoneNumber: data.phoneNumber,
          }
        })

        // Create or update profile with basic info
        if (!profile) {
          profile = await prisma.profile.create({
            data: {
              userId,
              dateOfBirth: new Date(data.dateOfBirth),
              gender: data.gender,
              state: '',
              district: '',
              country: '',
              denomination: 'OTHER',
            }
          })
        } else {
          await prisma.profile.update({
            where: { userId },
            data: {
              dateOfBirth: new Date(data.dateOfBirth),
              gender: data.gender,
            }
          })
        }
        break

      case 2:
        // Update location details
        await prisma.profile.update({
          where: { userId },
          data: {
            district: data.district,
            state: data.state,
            country: data.country,
            openToRelocate: data.openToRelocate === 'yes',
          }
        })
        break

      case 3:
        // Update faith background
        // Store church name with location
        const churchFullName = data.churchLocation
          ? `${data.churchName}, ${data.churchLocation}`
          : data.churchName

        await prisma.profile.update({
          where: { userId },
          data: {
            denomination: data.denomination,
            churchName: churchFullName,
            yearsAsBeliever: parseInt(data.yearsAsBeliever?.replace('+', '').split('-')[0] || '0'),
            isBaptized: data.isBaptized === 'yes',
            churchInvolvementLevel: data.churchInvolvement,
            faithTestimony: data.faithTestimony,
          }
        })
        break

      case 4:
        // Save photos
        if (data.photos && data.photos.length >= 3) {
          // Delete existing photos
          await prisma.photo.deleteMany({
            where: { userId }
          })

          // Create new photos
          const photoPromises = data.photos.map((photo: any, index: number) =>
            prisma.photo.create({
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
        break

      case 5:
        // Update physical attributes
        await prisma.profile.update({
          where: { userId },
          data: {
            height: data.height,
            motherTongue: data.motherTongue,
            languages: data.languages,
          }
        })
        break

      case 6:
        // Update education and career
        await prisma.profile.update({
          where: { userId },
          data: {
            educationLevel: data.educationLevel,
            fieldOfStudy: data.fieldOfStudy,
            occupation: data.occupation,
            incomeRange: data.incomeRange,
          }
        })
        break

      case 7:
        // Update family background
        await prisma.profile.update({
          where: { userId },
          data: {
            parentsOccupation: `Father: ${data.fatherOccupation} | Mother: ${data.motherOccupation}`,
            siblingsCount: data.siblingsCount,
            birthOrder: data.birthOrder,
            familyType: data.familyType,
            familyValues: data.familyValues,
          }
        })
        break

      default:
        break
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Progress saved successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Progress save error:', error)
    return NextResponse.json(
      { error: 'An error occurred while saving progress' },
      { status: 500 }
    )
  }
}
