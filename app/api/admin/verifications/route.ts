import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, logAdminAction } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') as string | null

    const skip = (page - 1) * limit

    const where: any = {
      type: 'PHOTO'
    }

    if (status) {
      where.status = status
    } else {
      where.status = 'PENDING'
    }

    const [verifications, total] = await Promise.all([
      prisma.verification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              status: true,
              createdAt: true,
              profile: {
                select: {
                  gender: true,
                  dateOfBirth: true,
                  city: true,
                  state: true
                }
              },
              photos: {
                where: { isPrimary: true },
                take: 1
              }
            }
          }
        }
      }),
      prisma.verification.count({ where })
    ])

    return NextResponse.json({
      verifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Admin verifications list error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch verifications' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const { verificationId, action, verificationIds } = body

    // Handle batch actions
    if (verificationIds && Array.isArray(verificationIds)) {
      const status = action === 'approve' ? "APPROVED" : "REJECTED"

      await prisma.verification.updateMany({
        where: {
          id: {
            in: verificationIds
          }
        },
        data: {
          status,
          verifiedBy: admin.userId,
          verifiedAt: new Date()
        }
      })

      // If approved, mark user photos as verified
      if (action === 'approve') {
        const verifications = await prisma.verification.findMany({
          where: {
            id: {
              in: verificationIds
            }
          },
          select: { userId: true }
        })

        const userIds = verifications.map((v: any) => v.userId)

        await prisma.photo.updateMany({
          where: {
            userId: {
              in: userIds
            }
          },
          data: {
            isVerified: true
          }
        })

        // Create notifications
        for (const userId of userIds) {
          await prisma.notification.create({
            data: {
              userId,
              type: 'NEW_MESSAGE',
              title: 'Photo Verification Approved',
              content: 'Your photo verification has been approved!',
              link: '/profile'
            }
          })
        }
      }

      return NextResponse.json({
        success: true,
        updated: verificationIds.length
      })
    }

    // Handle single verification
    if (!verificationId) {
      return NextResponse.json(
        { error: 'Verification ID is required' },
        { status: 400 }
      )
    }

    const status = action === 'approve' ? "APPROVED" : "REJECTED"

    const verification = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status,
        verifiedBy: admin.userId,
        verifiedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // If approved, mark user photos as verified
    if (action === 'approve') {
      await prisma.photo.updateMany({
        where: {
          userId: verification.userId
        },
        data: {
          isVerified: true
        }
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: verification.userId,
          type: 'NEW_MESSAGE',
          title: 'Photo Verification Approved',
          content: 'Your photo verification has been approved!',
          link: '/profile'
        }
      })
    } else {
      // Create notification for rejection
      await prisma.notification.create({
        data: {
          userId: verification.userId,
          type: 'NEW_MESSAGE',
          title: 'Photo Verification Rejected',
          content: 'Your photo verification was not approved. Please try again with a clear photo.',
          link: '/profile'
        }
      })
    }

    await logAdminAction(admin.userId, action, 'verification', verificationId, { userId: verification.userId })

    return NextResponse.json({ verification })
  } catch (error: any) {
    console.error('Admin verification update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update verification' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
