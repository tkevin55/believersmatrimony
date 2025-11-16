'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, Send, MapPin, Briefcase, GraduationCap, Sparkles, ChevronDown, ChevronUp, Star, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'
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
    if (percentage >= 60) return 'bg-primary'
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 rounded-2xl border-0">
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
              <UserAvatar
                name={profile.name}
                image={null}
                className="h-32 w-32 text-4xl"
              />
            </div>
          )}

          {/* Match Percentage Badge with gentle pulse */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute top-4 right-4"
          >
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Badge
                className={cn(
                  'text-white font-bold text-base px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm',
                  getMatchColor(profile.matchPercentage)
                )}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 inline" />
                {profile.matchPercentage}% Match
              </Badge>
            </motion.div>
          </motion.div>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Profile Info Section */}
        <div className="p-6 space-y-5">
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
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-2"
              >
                <Badge variant="secondary" className="text-xs rounded-full px-2.5 py-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {formatLabel(profile.homeDistrict)}, Kerala
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Interest Tags with stagger animation */}
          {profile.interestTags && profile.interestTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground/70">
                <Tag className="h-4 w-4 text-primary" />
                <span>Interests</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interestTags.slice(0, 7).map((tag, index) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.03 }}
                  >
                    <Badge
                      variant="outline"
                      className="text-xs px-3 py-1 rounded-full bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all cursor-default"
                    >
                      {formatInterestTag(tag)}
                    </Badge>
                  </motion.div>
                ))}
                {profile.interestTags.length > 7 && (
                  <Badge variant="outline" className="text-xs px-3 py-1 rounded-full">
                    +{profile.interestTags.length - 7} more
                  </Badge>
                )}
              </div>
            </motion.div>
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
                  className="flex items-center gap-1 text-sm text-primary hover:underline mt-2 transition-all"
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
          <div className="flex gap-3 pt-6">
            {/* Pass Button */}
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-2 rounded-full hover:border-destructive hover:bg-destructive/10 transition-all"
                onClick={handlePass}
                disabled={isLoading || isLoadingSuperLikes}
              >
                <X className="h-5 w-5 mr-2" />
                Pass
              </Button>
            </motion.div>

            {/* Like Button */}
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="default"
                size="lg"
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-full shadow-md hover:shadow-lg transition-all"
                onClick={handleLike}
                disabled={isLoading || isLoadingSuperLikes}
              >
                <Heart className="h-5 w-5 mr-2" />
                Like
              </Button>
            </motion.div>

            {/* Super Like Button */}
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "w-full border-2 border-yellow-500 rounded-full hover:bg-yellow-500 hover:text-white transition-all",
                  remainingSuperLikes <= 0 && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleSuperLike}
                disabled={isLoading || isLoadingSuperLikes || remainingSuperLikes <= 0}
              >
                <Star className="h-5 w-5 mr-2 fill-yellow-500" />
                Super
              </Button>
            </motion.div>
          </div>

          {/* Send Interest Button - Full Width Below */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <SendInterestDialog
              receiverId={profile.id}
              receiverName={profile.name}
              onSuccess={() => onSendInterest?.(profile.id)}
              trigger={
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-all mt-2"
                  disabled={isLoading || isLoadingSuperLikes}
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Interest
                </Button>
              }
            />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
