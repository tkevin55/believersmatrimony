'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, MapPin, Briefcase, Search, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MatchUser {
  id: string
  name: string
  email: string
  image: string | null
  profile: {
    denomination: string
    district: string
    state: string
    occupation: string
    aboutMe: string
  } | null
  photos: Array<{
    url: string
    isPrimary: boolean
  }>
}

interface Match {
  id: string
  matchedAt: string
  user1: MatchUser
  user2: MatchUser
}

export default function MatchesTab() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      if (response.ok) {
        const data = await response.json()
        setMatches(data)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMatchedUser = (match: Match, currentUserId: string): MatchUser => {
    return match.user1.id === currentUserId ? match.user2 : match.user1
  }

  const filteredMatches = matches.filter((match) => {
    const user = getMatchedUser(match, 'current-user-id') // Will be replaced with actual user ID
    const searchLower = searchQuery.toLowerCase()
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.profile?.district?.toLowerCase().includes(searchLower) ||
      user.profile?.occupation?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Matches</CardTitle>
          <CardDescription>People who have mutually accepted interests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Matches</CardTitle>
        <CardDescription>
          People who have mutually accepted interests
        </CardDescription>
        <div className="flex items-center gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Matches Yet</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'No matches found for your search'
                : 'Start sending interests to find your perfect match!'}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/matches/discover')}>
                Discover Matches
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMatches.map((match) => {
              const user = getMatchedUser(match, 'current-user-id')
              const primaryPhoto = user.photos?.find((p) => p.isPrimary)
              const location = [user.profile?.district, user.profile?.state]
                .filter(Boolean)
                .join(', ')

              return (
                <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] relative bg-muted">
                    {primaryPhoto ? (
                      <img
                        src={primaryPhoto.url}
                        alt={user.name || 'User'}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback className="text-2xl">
                            {user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      {user.profile?.denomination && (
                        <Badge variant="secondary" className="mt-1">
                          {user.profile.denomination}
                        </Badge>
                      )}
                    </div>

                    {location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1 shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                    )}

                    {user.profile?.occupation && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4 mr-1 shrink-0" />
                        <span className="truncate">{user.profile.occupation}</span>
                      </div>
                    )}

                    {user.profile?.aboutMe && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {user.profile.aboutMe}
                      </p>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => router.push(`/messages/${match.id}`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
