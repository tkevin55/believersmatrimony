import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const MAX_PHOTOS = 8
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Photo upload schema
const photoUploadSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  isPrimary: z.boolean().optional().default(false),
})

// Photo reorder schema
const photoReorderSchema = z.object({
  photoId: z.string(),
  order: z.number().int().min(0),
  isPrimary: z.boolean().optional(),
})

// POST /api/profile/photos - Upload a new photo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check current photo count
    const currentPhotoCount = await prisma.photo.count({
      where: { userId: session.user.id }
    })

    if (currentPhotoCount >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS} photos allowed` },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = photoUploadSchema.parse(body)

    // If this is the first photo or marked as primary, set it as primary
    const isPrimary = currentPhotoCount === 0 || validatedData.isPrimary

    // If setting as primary, unset other primary photos
    if (isPrimary) {
      await prisma.photo.updateMany({
        where: {
          userId: session.user.id,
          isPrimary: true
        },
        data: { isPrimary: false }
      })
    }

    // Create the photo
    const photo = await prisma.photo.create({
      data: {
        userId: session.user.id,
        url: validatedData.url,
        publicId: validatedData.publicId,
        isPrimary,
        order: currentPhotoCount
      }
    })

    // Update user's image if this is the primary photo
    if (isPrimary) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: validatedData.url }
      })
    }

    return NextResponse.json({
      message: 'Photo uploaded successfully',
      photo
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error uploading photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}

// PUT /api/profile/photos - Update photo order or set primary
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Check if it's a batch reorder or single update
    if (Array.isArray(body)) {
      // Batch reorder
      const updates = z.array(photoReorderSchema).parse(body)

      // Verify all photos belong to the user
      const photoIds = updates.map((u: any) => u.photoId)
      const photos = await prisma.photo.findMany({
        where: {
          id: { in: photoIds },
          userId: session.user.id
        }
      })

      if (photos.length !== photoIds.length) {
        return NextResponse.json(
          { error: 'Some photos not found or unauthorized' },
          { status: 404 }
        )
      }

      // Update all photos
      const updatePromises = updates.map(update => {
        const data: any = { order: update.order }
        if (update.isPrimary !== undefined) {
          data.isPrimary = update.isPrimary
        }

        return prisma.photo.update({
          where: { id: update.photoId },
          data
        })
      })

      // If setting a new primary, unset others first
      const newPrimary = updates.find(u => u.isPrimary)
      if (newPrimary) {
        await prisma.photo.updateMany({
          where: {
            userId: session.user.id,
            isPrimary: true,
            id: { not: newPrimary.photoId }
          },
          data: { isPrimary: false }
        })

        // Update user's image
        const primaryPhoto = await prisma.photo.findUnique({
          where: { id: newPrimary.photoId }
        })

        if (primaryPhoto) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: { image: primaryPhoto.url }
          })
        }
      }

      await Promise.all(updatePromises)

      return NextResponse.json({
        message: 'Photos updated successfully'
      })
    } else {
      // Single photo update
      const update = photoReorderSchema.parse(body)

      // Verify photo belongs to user
      const photo = await prisma.photo.findFirst({
        where: {
          id: update.photoId,
          userId: session.user.id
        }
      })

      if (!photo) {
        return NextResponse.json(
          { error: 'Photo not found' },
          { status: 404 }
        )
      }

      // If setting as primary, unset others
      if (update.isPrimary) {
        await prisma.photo.updateMany({
          where: {
            userId: session.user.id,
            isPrimary: true,
            id: { not: update.photoId }
          },
          data: { isPrimary: false }
        })

        // Update user's image
        await prisma.user.update({
          where: { id: session.user.id },
          data: { image: photo.url }
        })
      }

      // Update the photo
      const updatedPhoto = await prisma.photo.update({
        where: { id: update.photoId },
        data: {
          order: update.order,
          isPrimary: update.isPrimary ?? photo.isPrimary
        }
      })

      return NextResponse.json({
        message: 'Photo updated successfully',
        photo: updatedPhoto
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating photos:', error)
    return NextResponse.json(
      { error: 'Failed to update photos' },
      { status: 500 }
    )
  }
}

// DELETE /api/profile/photos?photoId=xxx - Delete a photo
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }

    // Verify photo belongs to user
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        userId: session.user.id
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    const wasPrimary = photo.isPrimary

    // Delete the photo
    await prisma.photo.delete({
      where: { id: photoId }
    })

    // If it was the primary photo, set another photo as primary
    if (wasPrimary) {
      const nextPhoto = await prisma.photo.findFirst({
        where: { userId: session.user.id },
        orderBy: { order: 'asc' }
      })

      if (nextPhoto) {
        await prisma.photo.update({
          where: { id: nextPhoto.id },
          data: { isPrimary: true }
        })

        // Update user's image
        await prisma.user.update({
          where: { id: session.user.id },
          data: { image: nextPhoto.url }
        })
      } else {
        // No photos left, clear user's image
        await prisma.user.update({
          where: { id: session.user.id },
          data: { image: null }
        })
      }
    }

    // TODO: Delete photo from Cloudinary if publicId exists
    // if (photo.publicId) {
    //   await cloudinary.uploader.destroy(photo.publicId)
    // }

    return NextResponse.json({
      message: 'Photo deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
