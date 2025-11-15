import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentAdmin } from '@/lib/admin'
import { StatsCard } from '@/components/admin/stats-card'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  UserPlus,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  UserX,
  TrendingUp
} from 'lucide-react'

async function getStats() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/stats`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }

  return response.json()
}

export default async function AdminDashboard() {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect('/auth/login')
  }

  const stats = await getStats()

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {admin.name || admin.email}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              description="Registered users"
              trend={{
                value: stats.userGrowthRate,
                isPositive: stats.userGrowthRate > 0
              }}
            />
            <StatsCard
              title="Active Users"
              value={stats.activeUsers}
              icon={Activity}
              description="Active in last 7 days"
            />
            <StatsCard
              title="Total Matches"
              value={stats.totalMatches}
              icon={Heart}
              description="Successful matches"
            />
            <StatsCard
              title="New This Month"
              value={stats.newRegistrations.month}
              icon={UserPlus}
              description="New registrations"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Pending Reports"
              value={stats.pendingReports}
              icon={AlertTriangle}
              description="Require review"
            />
            <StatsCard
              title="Pending Verifications"
              value={stats.pendingVerifications}
              icon={CheckCircle}
              description="Photo verifications"
            />
            <StatsCard
              title="Suspended Users"
              value={stats.suspendedUsers}
              icon={UserX}
              description="Currently suspended"
            />
            <StatsCard
              title="Growth Rate"
              value={`${stats.userGrowthRate > 0 ? '+' : ''}${stats.userGrowthRate}%`}
              icon={TrendingUp}
              description="vs last month"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Review Reports
                    {stats.pendingReports > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {stats.pendingReports}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/admin/verifications">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Review Verifications
                    {stats.pendingVerifications > 0 && (
                      <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {stats.pendingVerifications}
                      </span>
                    )}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* New Registrations Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New Registrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today</span>
                  <span className="text-lg font-semibold">{stats.newRegistrations.today}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <span className="text-lg font-semibold">{stats.newRegistrations.week}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="text-lg font-semibold">{stats.newRegistrations.month}</span>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="text-sm font-medium text-green-600">
                    {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Suspended</span>
                  <span className="text-sm font-medium text-orange-600">
                    {stats.suspendedUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Deleted</span>
                  <span className="text-sm font-medium text-red-600">
                    {stats.deletedUsers}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
