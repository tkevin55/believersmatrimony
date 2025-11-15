'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, Send, MapPin, Briefcase, GraduationCap, Sparkles, ChevronDown, ChevronUp, Star, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn, getInitials } from '@/lib/utils'
import SendInterestDialog from '@/components/send-interest-dialog'
import { useToast } from '@/hooks/use-toast'

interface ProfileCardProps {
  profile: {
    id: string
    name: string
    age: number
    gender: string
    location: string
    interestTags?: string[]
    politicalLeaning?: string | null
    homeDistrict?: string | null
    educationLevel?: string | null
    occupation?: string | null
    height?: string | null
    aboutMe?: string | null
    primaryPhoto?: string | null
    matchPercentage: number
  }
  onLike: (userId: string, isSuperLike?: boolean) => Promise<void>
  onPass: (userId: string) => void
  onSendInterest?: (userId: string) => void
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
  const [remainingSuperLikes, setRemainingSuperLikes] = useState<number>(3)
  const [isLoadingSuperLikes, setIsLoadingSuperLikes] = useState(false)
  const { toast } = useToast()

  // Fetch remaining super likes on mount
  useEffect(() => {
    fetchSuperLikesCount()
  }, [])

  const fetchSuperLikesCount = async () => {
    try {
      const response = await fetch('/api/super-likes')
      if (response.ok) {
        const data = await response.json()
        setRemainingSuperLikes(data.remainingLikes)
      }
    } catch (error) {
      console.error('Error fetching super likes count:', error)
    }
  }

  const handleLike = async () => {
    await onLike(profile.id, false)
  }

  const handleSuperLike = async () => {
    if (remainingSuperLikes <= 0) {
      toast({
        title: 'No Super Likes Left',
        description: 'You\'ve used all your super likes this week. They reset every 7 days.',
      })
      return
    }

    setIsLoadingSuperLikes(true)
    try {
      await onLike(profile.id, true)
      setRemainingSuperLikes((prev) => prev - 1)
      toast({
        title: 'Super Like Sent!',
        description: `${profile.name} will know you really liked them!`,
      })
    } catch (error) {
      console.error('Error sending super like:', error)
      toast({
        title: 'Error',
        description: 'Failed to send super like. Please try again.',
      })
    } finally {
      setIsLoadingSuperLikes(false)
    }
  }

  const handlePass = () => {
    onPass(profile.id)
  }

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  const formatLabel = (text: string) => {
    return text
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const formatInterestTag = (tag: string) => {
    return tag
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
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

            {/* Kerala District Badge */}
            {profile.homeDistrict && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {formatLabel(profile.homeDistrict)}, Kerala
                </Badge>
              </div>
            )}
          </div>

          {/* Interest Tags */}
          {profile.interestTags && profile.interestTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>Interests</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.interestTags.slice(0, 7).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs px-2 py-0.5 bg-primary/5 border-primary/20"
                  >
                    {formatInterestTag(tag)}
                  </Badge>
                ))}
                {profile.interestTags.length > 7 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{profile.interestTags.length - 7} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Quick Info */}
          <div className="space-y-2">
            {profile.politicalLeaning && (
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">{formatLabel(profile.politicalLeaning)}</span>
              </div>
            )}

            {profile.occupation && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>{profile.occupation}</span>
              </div>
            )}

            {profile.educationLevel && (
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>{formatLabel(profile.educationLevel)}</span>
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

          {/* Super Likes Counter */}
          {remainingSuperLikes > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{remainingSuperLikes} Super Like{remainingSuperLikes !== 1 ? 's' : ''} remaining this week</span>
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
              disabled={isLoading || isLoadingSuperLikes}
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
              disabled={isLoading || isLoadingSuperLikes}
            >
              <Heart className="h-5 w-5 mr-2" />
              Like
            </Button>

            {/* Super Like Button */}
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "flex-1 border-2 border-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors",
                remainingSuperLikes <= 0 && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleSuperLike}
              disabled={isLoading || isLoadingSuperLikes || remainingSuperLikes <= 0}
            >
              <Star className="h-5 w-5 mr-2 fill-yellow-500" />
              Super
            </Button>
          </div>

          {/* Send Interest Button - Full Width Below */}
          <SendInterestDialog
            receiverId={profile.id}
            receiverName={profile.name}
            onSuccess={() => onSendInterest?.(profile.id)}
            trigger={
              <Button
                variant="outline"
                size="lg"
                className="w-full border-2 border-primary hover:bg-primary hover:text-primary-foreground mt-2"
                disabled={isLoading || isLoadingSuperLikes}
              >
                <Send className="h-5 w-5 mr-2" />
                Send Interest
              </Button>
            }
          />
        </div>
      </Card>
    </motion.div>
  )
}
