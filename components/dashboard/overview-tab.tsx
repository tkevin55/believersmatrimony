'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Heart, Users, TrendingUp, Search, UserPlus, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'

interface Stats {
  profileViews: number
  interestsReceived: number
  matchesCount: number
  likesReceived: number
  profileCompletionPercentage: number
}

export default function OverviewTab() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Completion */}
      {stats && stats.profileCompletionPercentage < 100 && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Complete your profile to get better matches and increase visibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Profile Completion</span>
                <span className="font-medium">{stats.profileCompletionPercentage}%</span>
              </div>
              <Progress value={stats.profileCompletionPercentage} className="h-2" />
            </div>
            <Button
              onClick={() => router.push('/profile/edit')}
              className="w-full sm:w-auto"
            >
              <Edit className="h-4 w-4 mr-2" />
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.profileViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              People who viewed your profile
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interests Received</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.interestsReceived || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending interests to review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.matchesCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Mutual interests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes Received</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.likesReceived || 0}</div>
            <p className="text-xs text-muted-foreground">
              People who liked you
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Take action to find your perfect match
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push('/matches/discover')}
            >
              <div className="flex items-start gap-3 text-left">
                <Search className="h-5 w-5 mt-1 shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Discover Matches</div>
                  <div className="text-xs text-muted-foreground">
                    Browse through potential matches
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push('/dashboard?tab=interests')}
            >
              <div className="flex items-start gap-3 text-left">
                <Heart className="h-5 w-5 mt-1 shrink-0" />
                <div>
                  <div className="font-semibold mb-1">View Interests</div>
                  <div className="text-xs text-muted-foreground">
                    Review sent and received interests
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push('/profile/edit')}
            >
              <div className="flex items-start gap-3 text-left">
                <UserPlus className="h-5 w-5 mt-1 shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Edit Profile</div>
                  <div className="text-xs text-muted-foreground">
                    Update your information
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest interactions and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity to show</p>
            <p className="text-sm mt-2">Start exploring to see your activity here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
