import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ReportReason } from '@prisma/client'

// Report user schema
const reportUserSchema = z.object({
  reportedId: z.string(),
  reason: z.enum([
    'INAPPROPRIATE_PHOTOS',
    'FAKE_PROFILE',
    'HARASSMENT',
    'SPAM',
    'OTHER'
  ]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

// POST /api/report - Report a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = reportUserSchema.parse(body)

    // Prevent self-reporting
    if (validatedData.reportedId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot report yourself' },
        { status: 400 }
      )
    }

    // Check if user to be reported exists
    const userToReport = await prisma.user.findUnique({
      where: { id: validatedData.reportedId },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })

    if (!userToReport) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reportedId: validatedData.reportedId,
        reason: validatedData.reason as ReportReason,
        description: validatedData.description,
        status: 'PENDING',
      },
      include: {
        reported: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'MODERATOR'] },
        status: 'ACTIVE'
      },
      select: { id: true }
    })

    // Create notifications for all admins
    const adminNotifications = admins.map(admin => ({
      userId: admin.id,
      type: 'NEW_MESSAGE' as const, // Reusing NEW_MESSAGE type for admin alerts
      title: 'New User Report',
      content: `${report.reporter.name} reported ${userToReport.name} for ${validatedData.reason.replace(/_/g, ' ').toLowerCase()}`,
      link: `/admin/reports/${report.id}`,
      isRead: false,
    }))

    if (adminNotifications.length > 0) {
      await prisma.notification.createMany({
        data: adminNotifications
      })
    }

    return NextResponse.json({
      message: 'Report submitted successfully. Our team will review it shortly.',
      report: {
        id: report.id,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}

// GET /api/report - Get reports (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or moderator
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          reported: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              profile: {
                select: {
                  city: true,
                  state: true,
                  gender: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.report.count({ where })
    ])

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
