import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
              city: '',
              state: '',
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
            city: data.city,
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
            parentsOccupation: `Father: ${data.fatherOccupation}, Mother: ${data.motherOccupation}`,
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
