import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { ReportStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') as ReportStatus | null

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              status: true
            }
          },
          reported: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              status: true,
              profile: {
                select: {
                  gender: true,
                  city: true,
                  state: true
                }
              }
            }
          }
        }
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
  } catch (error: any) {
    console.error('Admin reports list error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const { reportId, status, reviewNote } = body

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      )
    }

    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: status || 'REVIEWED',
        reviewedBy: admin.userId,
        reviewNote,
        updatedAt: new Date()
      },
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

    return NextResponse.json({ report })
  } catch (error: any) {
    console.error('Admin report update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update report' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
