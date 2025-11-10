import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Run all stats queries in parallel for better performance
    const [
      totalUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      activeUsers,
      totalMatches,
      pendingReports,
      pendingVerifications,
      suspendedUsers,
      deletedUsers
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // New registrations today
      prisma.user.count({
        where: {
          createdAt: {
            gte: todayStart
          }
        }
      }),

      // New registrations this week
      prisma.user.count({
        where: {
          createdAt: {
            gte: weekAgo
          }
        }
      }),

      // New registrations this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: monthAgo
          }
        }
      }),

      // Active users (logged in last 7 days)
      prisma.user.count({
        where: {
          lastActive: {
            gte: weekAgo
          },
          status: 'ACTIVE'
        }
      }),

      // Total matches
      prisma.match.count(),

      // Pending reports
      prisma.report.count({
        where: {
          status: 'PENDING'
        }
      }),

      // Pending verifications
      prisma.verification.count({
        where: {
          status: 'PENDING',
          type: 'PHOTO'
        }
      }),

      // Suspended users
      prisma.user.count({
        where: {
          status: 'SUSPENDED'
        }
      }),

      // Deleted users
      prisma.user.count({
        where: {
          status: 'DELETED'
        }
      })
    ])

    // Calculate trends (compare with previous period)
    const previousMonthStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const previousMonthEnd = monthAgo

    const newUsersPreviousMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: previousMonthStart,
          lt: previousMonthEnd
        }
      }
    })

    const userGrowthRate = newUsersPreviousMonth > 0
      ? ((newUsersMonth - newUsersPreviousMonth) / newUsersPreviousMonth) * 100
      : 0

    return NextResponse.json({
      totalUsers,
      newRegistrations: {
        today: newUsersToday,
        week: newUsersWeek,
        month: newUsersMonth
      },
      activeUsers,
      totalMatches,
      pendingReports,
      pendingVerifications,
      suspendedUsers,
      deletedUsers,
      userGrowthRate: Math.round(userGrowthRate * 10) / 10
    })
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
