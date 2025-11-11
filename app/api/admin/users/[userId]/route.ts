import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, logAdminAction } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await requireAdmin()

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: {
        profile: true,
        partnerPreferences: true,
        photos: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            sentInterests: true,
            receivedInterests: true,
            matches1: true,
            matches2: true,
            sentMessages: true,
            receivedMessages: true,
            likesGiven: true,
            likesReceived: true,
            blocksInitiated: true,
            blocksReceived: true,
            reportsInitiated: true,
            reportsReceived: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get recent activity
    const [recentInterests, recentMatches, recentReports] = await Promise.all([
      prisma.interest.findMany({
        where: {
          OR: [
            { senderId: params.userId },
            { receiverId: params.userId }
          ]
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      }),
      prisma.match.findMany({
        where: {
          OR: [
            { user1Id: params.userId },
            { user2Id: params.userId }
          ]
        },
        take: 5,
        orderBy: { matchedAt: 'desc' },
        include: {
          user1: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          user2: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      }),
      prisma.report.findMany({
        where: {
          OR: [
            { reporterId: params.userId },
            { reportedId: params.userId }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reported: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    ])

    return NextResponse.json({
      user,
      activity: {
        recentInterests,
        recentMatches,
        recentReports
      }
    })
  } catch (error: any) {
    console.error('Admin user details error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user details' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const { action, reason, profileData } = body

    if (action) {
      // Handle status change actions
      let updateData: any = {}

      switch (action) {
        case 'suspend':
          updateData = { status: "SUSPENDED" }
          break
        case 'activate':
          updateData = { status: "ACTIVE" }
          break
        case 'delete':
          updateData = { status: "DELETED" }
          break
        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          )
      }

      const user = await prisma.user.update({
        where: { id: params.userId },
        data: updateData
      })

      await logAdminAction(admin.userId, action, 'user', params.userId, { reason })

      return NextResponse.json({ user })
    } else if (profileData) {
      // Handle profile update
      const user = await prisma.user.update({
        where: { id: params.userId },
        data: {
          name: profileData.name,
          email: profileData.email,
          phoneNumber: profileData.phoneNumber,
          role: profileData.role
        }
      })

      if (profileData.profile) {
        await prisma.profile.update({
          where: { userId: params.userId },
          data: profileData.profile
        })
      }

      await logAdminAction(admin.userId, 'update_profile', 'user', params.userId)

      return NextResponse.json({ user })
    }

    return NextResponse.json(
      { error: 'No action or data provided' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const admin = await requireAdmin()

    // Permanently delete user
    await prisma.user.delete({
      where: { id: params.userId }
    })

    await logAdminAction(admin.userId, 'permanent_delete', 'user', params.userId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Admin user delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
