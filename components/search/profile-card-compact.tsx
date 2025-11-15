'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MapPin, Briefcase, GraduationCap, CheckCircle2, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface ProfileCardCompactProps {
  id: string
  name: string | null
  age: number
  gender: string
  location: string
  interestTags?: string[]
  politicalLeaning?: string | null
  homeDistrict?: string | null
  educationLevel?: string | null
  occupation?: string | null
  primaryPhoto: string | null
  matchPercentage: number
  isVerified?: boolean
  isOnline?: boolean
}

export function ProfileCardCompact({
  id,
  name,
  age,
  location,
  interestTags,
  politicalLeaning,
  homeDistrict,
  educationLevel,
  occupation,
  primaryPhoto,
  matchPercentage,
  isVerified,
  isOnline,
}: ProfileCardCompactProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isLiking) return

    setIsLiking(true)

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ likedUserId: id }),
      })

      if (!response.ok) {
        throw new Error('Failed to like profile')
      }

      const data = await response.json()

      setIsLiked(true)

      if (data.isMatch) {
        toast({
          title: 'It\'s a Match!',
          description: `You and ${name} have liked each other!`,
        })
      } else {
        toast({
          title: 'Profile Liked',
          description: `You liked ${name}'s profile`,
        })
      }
    } catch (error) {
      console.error('Error liking profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to like profile. Please try again.',
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleCardClick = () => {
    router.push(`/profile/${id}`)
  }

  const formatEducation = (edu: string) => {
    return edu
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const formatDistrict = (district: string) => {
    return district
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  return (
    <Card
      className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] bg-gray-100">
          {primaryPhoto ? (
            <img
              src={primaryPhoto}
              alt={name || 'Profile photo'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl">
                  {name ? getInitials(name) : '?'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Match percentage badge */}
          <div className="absolute top-2 left-2">
            <Badge
              className={`${
                matchPercentage >= 80
                  ? 'bg-green-500'
                  : matchPercentage >= 60
                  ? 'bg-blue-500'
                  : 'bg-gray-500'
              } text-white font-semibold`}
            >
              {matchPercentage}% Match
            </Badge>
          </div>

          {/* Online indicator */}
          {isOnline && (
            <div className="absolute top-2 right-2">
              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
          )}

          {/* Like button - shows on hover */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="icon"
              variant={isLiked ? 'default' : 'secondary'}
              className={`rounded-full ${
                isLiked ? 'bg-red-500 hover:bg-red-600' : ''
              }`}
              onClick={handleLike}
              disabled={isLiking || isLiked}
            >
              <Heart
                className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
              />
            </Button>
          </div>

          {/* Gradient overlay for text */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold text-lg">
                {name || 'Anonymous'}
                {isVerified && (
                  <CheckCircle2 className="inline-block ml-1 h-4 w-4 text-blue-400" />
                )}
              </h3>
              <span className="text-white text-lg">{age}</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* Interests (Kaapi Connect) */}
          {interestTags && interestTags.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <Tag className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {interestTags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {capitalizeFirst(tag)}
                  </Badge>
                ))}
                {interestTags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{interestTags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Kerala District (Kaapi Connect) */}
          {homeDistrict && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="text-xs">
                {formatDistrict(homeDistrict)}
              </Badge>
            </div>
          )}

          {/* Education */}
          {educationLevel && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{formatEducation(educationLevel)}</span>
            </div>
          )}

          {/* Occupation */}
          {occupation && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{occupation}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
