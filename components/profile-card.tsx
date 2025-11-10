'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, Send, MapPin, Briefcase, GraduationCap, Church, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn, getInitials } from '@/lib/utils'

interface ProfileCardProps {
  profile: {
    id: string
    name: string
    age: number
    gender: string
    location: string
    denomination: string
    educationLevel?: string | null
    occupation?: string | null
    height?: string | null
    aboutMe?: string | null
    primaryPhoto?: string | null
    matchPercentage: number
    churchName?: string | null
    yearsAsBeliever?: number | null
  }
  onLike: (userId: string) => Promise<void>
  onPass: (userId: string) => void
  onSendInterest: (userId: string, message?: string) => void
  isLoading?: boolean
}

export function ProfileCard({
  profile,
  onLike,
  onPass,
  onSendInterest,
  isLoading = false,
}: ProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleLike = async () => {
    await onLike(profile.id)
  }

  const handlePass = () => {
    onPass(profile.id)
  }

  const handleSendInterest = () => {
    onSendInterest(profile.id)
  }

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  const formatDenomination = (denomination: string) => {
    return denomination
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const formatEducation = (education: string) => {
    return education
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="overflow-hidden shadow-xl">
        {/* Photo Section */}
        <div className="relative h-96 bg-gradient-to-b from-gray-200 to-gray-300">
          {profile.primaryPhoto && !imageError ? (
            <img
              src={profile.primaryPhoto}
              alt={profile.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <Avatar className="h-32 w-32">
                <AvatarFallback className="text-4xl">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Match Percentage Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="absolute top-4 right-4"
          >
            <Badge
              className={cn(
                'text-white font-bold text-base px-3 py-1',
                getMatchColor(profile.matchPercentage)
              )}
            >
              {profile.matchPercentage}% Match
            </Badge>
          </motion.div>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Profile Info Section */}
        <div className="p-6 space-y-4">
          {/* Name and Basic Info */}
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {profile.name}, {profile.age}
            </h2>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.height && (
                <span>• {profile.height}</span>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Church className="h-4 w-4 text-primary" />
              <span className="font-medium">{formatDenomination(profile.denomination)}</span>
              {profile.yearsAsBeliever && (
                <span className="text-muted-foreground">
                  • {profile.yearsAsBeliever} years as believer
                </span>
              )}
            </div>

            {profile.occupation && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>{profile.occupation}</span>
              </div>
            )}

            {profile.educationLevel && (
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>{formatEducation(profile.educationLevel)}</span>
              </div>
            )}

            {profile.churchName && (
              <div className="text-sm text-muted-foreground">
                Attends {profile.churchName}
              </div>
            )}
          </div>

          {/* About Me Section */}
          {profile.aboutMe && (
            <div>
              <AnimatePresence>
                <motion.div
                  initial={false}
                  animate={{ height: isExpanded ? 'auto' : '60px' }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profile.aboutMe}
                  </p>
                </motion.div>
              </AnimatePresence>

              {profile.aboutMe.length > 120 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {/* Pass Button */}
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-2 hover:border-destructive hover:bg-destructive/10"
              onClick={handlePass}
              disabled={isLoading}
            >
              <X className="h-5 w-5 mr-2" />
              Pass
            </Button>

            {/* Like Button */}
            <Button
              variant="default"
              size="lg"
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              onClick={handleLike}
              disabled={isLoading}
            >
              <Heart className="h-5 w-5 mr-2" />
              Like
            </Button>

            {/* Send Interest Button */}
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-2 border-primary hover:bg-primary hover:text-primary-foreground"
              onClick={handleSendInterest}
              disabled={isLoading}
            >
              <Send className="h-5 w-5 mr-2" />
              Interest
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
