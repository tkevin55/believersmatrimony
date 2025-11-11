import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, logAdminAction } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const { action, reviewNote } = body

    const report = await prisma.report.findUnique({
      where: { id: params.reportId },
      include: {
        reported: true,
        reporter: true
      }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    let updatedReport

    switch (action) {
      case 'dismiss':
        updatedReport = await prisma.report.update({
          where: { id: params.reportId },
          data: {
            status: "RESOLVED",
            reviewedBy: admin.userId,
            reviewNote: reviewNote || 'Dismissed - No action needed',
            updatedAt: new Date()
          }
        })
        break

      case 'warn':
        updatedReport = await prisma.report.update({
          where: { id: params.reportId },
          data: {
            status: "RESOLVED",
            reviewedBy: admin.userId,
            reviewNote: reviewNote || 'User warned',
            updatedAt: new Date()
          }
        })

        // Create notification for reported user (warning)
        await prisma.notification.create({
          data: {
            userId: report.reportedId,
            type: 'NEW_MESSAGE',
            title: 'Warning from Admin',
            content: 'You have received a warning regarding your profile or behavior. Please review our community guidelines.',
            link: '/settings'
          }
        })
        break

      case 'suspend':
        // Suspend the reported user
        await prisma.user.update({
          where: { id: report.reportedId },
          data: {
            status: "SUSPENDED"
          }
        })

        updatedReport = await prisma.report.update({
          where: { id: params.reportId },
          data: {
            status: "RESOLVED",
            reviewedBy: admin.userId,
            reviewNote: reviewNote || 'User suspended',
            updatedAt: new Date()
          }
        })

        await logAdminAction(admin.userId, 'suspend', 'user', report.reportedId, { reportId: params.reportId })
        break

      case 'delete':
        // Delete the reported user
        await prisma.user.update({
          where: { id: report.reportedId },
          data: {
            status: "DELETED"
          }
        })

        updatedReport = await prisma.report.update({
          where: { id: params.reportId },
          data: {
            status: "RESOLVED",
            reviewedBy: admin.userId,
            reviewNote: reviewNote || 'User deleted',
            updatedAt: new Date()
          }
        })

        await logAdminAction(admin.userId, 'delete', 'user', report.reportedId, { reportId: params.reportId })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ report: updatedReport })
  } catch (error: any) {
    console.error('Admin report resolve error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to resolve report' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
