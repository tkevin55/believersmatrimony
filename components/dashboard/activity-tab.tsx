'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDistanceToNow } from 'date-fns'
import {
  Eye, Heart, Mail, UserPlus, Users, Sparkles, Loader2,
  RefreshCw, Filter
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Activity {
  id: string
  type: string
  user: {
    id: string
    name: string
    photo: string | null
    city?: string
    state?: string
    denomination?: string
  }
  targetUser: {
    id: string
    name: string
    photo: string | null
    city?: string
    state?: string
    denomination?: string
  } | null
  createdAt: string
  isCurrentUser: boolean
}

export default function ActivityTab() {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchActivities()
  }, [filter])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/activity?filter=${filter}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'PROFILE_VIEW':
        return <Eye className="h-4 w-4" />
      case 'LIKE_SENT':
      case 'LIKE_RECEIVED':
        return <Heart className="h-4 w-4 text-rose-500" />
      case 'SUPERLIKE_SENT':
      case 'SUPERLIKE_RECEIVED':
        return <Sparkles className="h-4 w-4 text-primary" />
      case 'INTEREST_SENT':
      case 'INTEREST_RECEIVED':
        return <Mail className="h-4 w-4 text-blue-500" />
      case 'INTEREST_ACCEPTED':
      case 'INTEREST_DECLINED':
        return <UserPlus className="h-4 w-4 text-green-500" />
      case 'MATCH_CREATED':
        return <Users className="h-4 w-4 text-purple-500" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getActivityText = (activity: Activity) => {
    const isYou = activity.isCurrentUser
    const otherUser = isYou ? activity.targetUser : activity.user
    const userName = otherUser?.name || 'Someone'
    const location = otherUser?.city || otherUser?.state || ''

    switch (activity.type) {
      case 'PROFILE_VIEW':
        return isYou
          ? `You viewed ${userName}'s profile`
          : `${userName} viewed your profile`
      case 'LIKE_SENT':
        return `You liked ${userName}`
      case 'LIKE_RECEIVED':
        return `${userName} liked you`
      case 'SUPERLIKE_SENT':
        return `You super liked ${userName}`
      case 'SUPERLIKE_RECEIVED':
        return `${userName} super liked you! ✨`
      case 'INTEREST_SENT':
        return `You sent an interest to ${userName}`
      case 'INTEREST_RECEIVED':
        return `${userName} sent you an interest`
      case 'INTEREST_ACCEPTED':
        return isYou
          ? `You accepted ${userName}'s interest`
          : `${userName} accepted your interest`
      case 'INTEREST_DECLINED':
        return isYou
          ? `You declined ${userName}'s interest`
          : `${userName} declined your interest`
      case 'MATCH_CREATED':
        return `You matched with ${userName}! 🎉`
      default:
        return 'Activity'
    }
  }

  const getActivityBadgeColor = (type: string) => {
    if (type.includes('SUPERLIKE')) return 'bg-primary text-primary-foreground'
    if (type.includes('MATCH')) return 'bg-purple-500 text-white'
    if (type.includes('ACCEPTED')) return 'bg-green-500 text-white'
    if (type.includes('DECLINED')) return 'bg-gray-500 text-white'
    if (type.includes('LIKE')) return 'bg-rose-500 text-white'
    if (type.includes('INTEREST')) return 'bg-blue-500 text-white'
    return 'bg-gray-200 text-gray-700'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest interactions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Track your interactions and profile views</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchActivities}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="views">Views</TabsTrigger>
              <TabsTrigger value="likes">Likes</TabsTrigger>
              <TabsTrigger value="interests">Interests</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6 space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No activity yet</p>
                  <p className="text-sm mt-2">
                    {filter === 'all' && "Start exploring to see your activity here"}
                    {filter === 'views' && "No profile views yet"}
                    {filter === 'likes' && "No likes yet"}
                    {filter === 'interests' && "No interests yet"}
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/discover')}
                  >
                    Discover Matches
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => {
                    const otherUser = activity.isCurrentUser ? activity.targetUser : activity.user
                    if (!otherUser) return null

                    return (
                      <Card
                        key={activity.id}
                        className="hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/profile/${otherUser.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={otherUser.photo || undefined} />
                              <AvatarFallback>
                                {otherUser.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {getActivityText(activity)}
                                  </p>
                                  {otherUser.city && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {otherUser.city}{otherUser.state ? `, ${otherUser.state}` : ''}
                                      {otherUser.denomination && ` • ${otherUser.denomination}`}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Badge
                                    variant="secondary"
                                    className={`${getActivityBadgeColor(activity.type)} text-xs`}
                                  >
                                    {getActivityIcon(activity.type)}
                                  </Badge>
                                </div>
                              </div>

                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
