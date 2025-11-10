import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, logAdminAction } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { UserStatus, UserRole } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') as UserStatus | null
    const role = searchParams.get('role') as UserRole | null
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (role) {
      where.role = role
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          phoneNumber: true,
          status: true,
          role: true,
          createdAt: true,
          lastActive: true,
          profile: {
            select: {
              gender: true,
              city: true,
              state: true,
              country: true
            }
          },
          _count: {
            select: {
              sentInterests: true,
              receivedInterests: true,
              matches1: true,
              matches2: true,
              sentMessages: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Admin users list error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const { userIds, action, reason } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'suspend':
        updateData = { status: UserStatus.SUSPENDED }
        break
      case 'activate':
        updateData = { status: UserStatus.ACTIVE }
        break
      case 'delete':
        updateData = { status: UserStatus.DELETED }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update users
    const result = await prisma.user.updateMany({
      where: {
        id: {
          in: userIds
        }
      },
      data: updateData
    })

    // Log admin action
    for (const userId of userIds) {
      await logAdminAction(admin.userId, action, 'user', userId, { reason })
    }

    return NextResponse.json({
      success: true,
      updated: result.count
    })
  } catch (error: any) {
    console.error('Admin users update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update users' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
