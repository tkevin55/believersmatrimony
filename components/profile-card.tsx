'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, Send, MapPin, Briefcase, GraduationCap, Church, ChevronDown, ChevronUp, Star } from 'lucide-react'
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
    denomination: string
    educationLevel?: string | null
    occupation?: string | null
    height?: string | null
    aboutMe?: string | null
    primaryPhoto?: string | null
    matchPercentage: number
    churchName?: string | null
    yearsAsBeliever?: number | null
    interests?: Array<{ id: string; name: string; emoji: string }> | null
    prompts?: Array<{ question: string; answer: string }> | null
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
        <div className="relative h-72 sm:h-80 md:h-96 bg-gradient-to-b from-gray-200 to-gray-300">
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
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
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

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge
                    key={interest.id}
                    variant="secondary"
                    className="text-sm px-2 py-1"
                  >
                    <span className="mr-1">{interest.emoji}</span>
                    {interest.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Answers */}
          {profile.prompts && profile.prompts.length > 0 && (
            <div className="space-y-2">
              {profile.prompts.map((prompt, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="p-3">
                    <p className="text-xs font-semibold text-primary mb-1">
                      {prompt.question}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {prompt.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

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
          <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
            {/* Pass Button */}
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-2 hover:border-destructive hover:bg-destructive/10 h-12 sm:h-auto"
              onClick={handlePass}
              disabled={isLoading || isLoadingSuperLikes}
            >
              <X className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Pass</span>
            </Button>

            {/* Like Button */}
            <Button
              variant="default"
              size="lg"
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 h-12 sm:h-auto"
              onClick={handleLike}
              disabled={isLoading || isLoadingSuperLikes}
            >
              <Heart className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Like</span>
            </Button>

            {/* Super Like Button */}
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "flex-1 border-2 border-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors h-12 sm:h-auto",
                remainingSuperLikes <= 0 && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleSuperLike}
              disabled={isLoading || isLoadingSuperLikes || remainingSuperLikes <= 0}
            >
              <Star className="h-5 w-5 sm:mr-2 fill-yellow-500" />
              <span className="hidden sm:inline">Super</span>
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
