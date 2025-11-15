'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import {
  Heart, Sparkles, X, Loader2, MapPin, Briefcase, GraduationCap,
  Church, ArrowLeft, User
} from 'lucide-react'
import { calculateAge } from '@/lib/utils'

interface LikeProfile {
  id: string
  likerId: string
  isSuperLike: boolean
  createdAt: string
  liker: {
    id: string
    name: string
    profile: {
      dateOfBirth: string
      gender: string
      city?: string
      state?: string
      denomination?: string
      occupation?: string
      educationLevel?: string
      height?: number
      aboutMe?: string
    }
    photos: Array<{ url: string; isPrimary: boolean }>
  }
}

export default function WhoLikedMePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [likes, setLikes] = useState<LikeProfile[]>([])
  const [superLikes, setSuperLikes] = useState<LikeProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'superLikes'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLikes()
    }
  }, [status])

  const fetchLikes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/likes?filter=received')
      if (!response.ok) {
        throw new Error('Failed to fetch likes')
      }
      const data = await response.json()

      const allLikes = data.likes || []
      setLikes(allLikes.filter((like: LikeProfile) => !like.isSuperLike))
      setSuperLikes(allLikes.filter((like: LikeProfile) => like.isSuperLike))
    } catch (error) {
      console.error('Error fetching likes:', error)
      toast({
        title: 'Error',
        description: 'Failed to load likes',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLikeBack = async (userId: string, isSuperLike: boolean = false) => {
    setActionLoading(userId)
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likedUserId: userId, isSuperLike }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to like')
      }

      const data = await response.json()

      if (data.isMatch) {
        toast({
          title: '🎉 It\'s a Match!',
          description: `You and ${data.match?.user?.name || 'this person'} liked each other!`,
        })
      } else {
        toast({
          title: isSuperLike ? 'Super Like Sent!' : 'Like Sent!',
          description: 'They\'ll be notified about your interest',
        })
      }

      // Remove from list
      setLikes(likes.filter((like) => like.likerId !== userId))
      setSuperLikes(superLikes.filter((like) => like.likerId !== userId))
    } catch (error) {
      console.error('Error liking back:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send like',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handlePass = (userId: string) => {
    // Just remove from view
    setLikes(likes.filter((like) => like.likerId !== userId))
    setSuperLikes(superLikes.filter((like) => like.likerId !== userId))

    toast({
      title: 'Passed',
      description: 'Profile removed from your likes',
    })
  }

  const displayLikes = filter === 'all' ? likes : superLikes

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-rose-500" />
          <h1 className="text-3xl font-bold">Who Liked You</h1>
        </div>
        <p className="text-muted-foreground">
          {displayLikes.length} {filter === 'all' ? 'people' : 'super likes'} waiting for your response
        </p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'superLikes')} className="mb-6">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            All Likes ({likes.length})
          </TabsTrigger>
          <TabsTrigger value="superLikes" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Super Likes ({superLikes.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Likes Grid */}
      {displayLikes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">
                {filter === 'all' ? 'No likes yet' : 'No super likes yet'}
              </h2>
              <p className="mb-4">
                {filter === 'all'
                  ? 'When someone likes your profile, you\'ll see them here'
                  : 'When someone super likes your profile, you\'ll see them here'}
              </p>
              <Button onClick={() => router.push('/discover')}>
                Discover Matches
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayLikes.map((like) => {
            const { liker } = like
            const age = calculateAge(new Date(liker.profile.dateOfBirth))
            const primaryPhoto = liker.photos.find((p) => p.isPrimary) || liker.photos[0]
            const location = [liker.profile.city, liker.profile.state].filter(Boolean).join(', ')

            return (
              <Card key={like.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Photo Section */}
                  <div className="relative h-64 bg-gradient-to-br from-primary/10 to-secondary/10">
                    {primaryPhoto?.url ? (
                      <img
                        src={primaryPhoto.url}
                        alt={liker.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-24 w-24 text-muted-foreground opacity-50" />
                      </div>
                    )}

                    {/* Super Like Badge */}
                    {like.isSuperLike && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Super Like
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold mb-1">
                        {liker.name}, {age}
                      </h3>

                      {location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{location}</span>
                        </div>
                      )}

                      {liker.profile.denomination && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <Church className="h-3 w-3" />
                          <span>{liker.profile.denomination}</span>
                        </div>
                      )}

                      {liker.profile.occupation && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <Briefcase className="h-3 w-3" />
                          <span>{liker.profile.occupation}</span>
                        </div>
                      )}

                      {liker.profile.educationLevel && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <GraduationCap className="h-3 w-3" />
                          <span>{liker.profile.educationLevel.replace('_', ' ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handlePass(liker.id)}
                        disabled={actionLoading === liker.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Pass
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-rose-500 text-rose-500 hover:bg-rose-50"
                        onClick={() => handleLikeBack(liker.id, false)}
                        disabled={actionLoading === liker.id}
                      >
                        {actionLoading === liker.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Heart className="h-4 w-4 mr-1" />
                        )}
                        Like Back
                      </Button>

                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => router.push(`/profile/${liker.id}`)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'
