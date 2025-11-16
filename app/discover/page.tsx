'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ProfileCard } from '@/components/profile-card'
import { MatchModal } from '@/components/match-modal'
import { Button } from '@/components/ui/button'
import { Loader2, Heart, Users, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Profile {
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

interface Match {
  id: string
  matchedAt: Date
  user: {
    id: string
    name: string
    photo: string | null
  }
  currentUser: {
    id: string
    name: string
    photo: string | null
  }
}

export default function DiscoverPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [matchModalOpen, setMatchModalOpen] = useState(false)
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)

  // Get current profile
  const currentProfile = profiles[currentIndex]

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Fetch initial profiles
  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfiles()
    }
  }, [status])

  // Keyboard shortcuts - FIXED: Check currentProfile exists
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts when not typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Check if we have a current profile and not loading
      if (!currentProfile || isActionLoading) {
        return
      }

      if (event.key === 'ArrowLeft') {
        // Pass
        handlePass(currentProfile.id)
      } else if (event.key === 'ArrowRight') {
        // Like
        handleLike(currentProfile.id)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentProfile, isActionLoading])

  const fetchProfiles = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching profiles with offset:', offset)
      const response = await fetch(`/api/discover?limit=20&offset=${offset}`)

      console.log('Discover API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Discover API error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch profiles')
      }

      const data = await response.json()
      console.log('Discover API data:', data)

      // Check if onboarding is needed
      if (data.needsOnboarding) {
        console.log('User needs onboarding, redirecting...')
        toast({
          title: 'Complete Your Profile',
          description: 'Please complete your profile to start discovering matches.',
        })
        router.push('/onboarding')
        return
      }

      console.log('Loaded profiles:', data.matches?.length || 0)
      setProfiles((prev) => [...prev, ...data.matches])
      setHasMore(data.hasMore)
      setOffset(data.offset)
    } catch (error) {
      console.error('Error fetching profiles:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load profiles. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (userId: string, isSuperLike: boolean = false) => {
    try {
      setIsActionLoading(true)

      const endpoint = isSuperLike ? '/api/super-likes' : '/api/likes'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ likedUserId: userId, isSuperLike }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Handle quota exceeded - show premium upgrade prompt
        if (response.status === 429 && errorData.suggestPremium) {
          toast({
            title: '✨ Upgrade to Premium',
            description: errorData.error || 'You\'ve reached your daily like limit. Upgrade to Premium for unlimited likes!',
            action: {
              label: 'Upgrade Now',
              onClick: () => router.push(errorData.upgradeUrl || '/premium'),
            },
            duration: 8000, // Show for 8 seconds
          })
          setIsActionLoading(false)
          return
        }

        throw new Error(errorData.error || 'Failed to like profile')
      }

      const data = await response.json()

      // Check if it's a match
      if (data.isMatch && data.match) {
        setCurrentMatch(data.match)
        setMatchModalOpen(true)
      } else {
        toast({
          title: isSuperLike ? 'Super Like Sent!' : 'Profile Liked!',
          description: isSuperLike
            ? `${profiles[currentIndex]?.name} will know you really liked them!`
            : 'We\'ll let you know if they like you back.',
        })
      }

      // Move to next profile
      handleNextProfile()
    } catch (error) {
      console.error('Error liking profile:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to like profile. Please try again.',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handlePass = (userId: string) => {
    // Just move to next profile
    handleNextProfile()
  }

  const handleSendInterest = (userId: string, message?: string) => {
    // Navigate to send interest page or open modal
    router.push(`/profile/${userId}?action=interest`)
  }

  const handleNextProfile = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1

      // If we're getting close to the end, fetch more profiles
      if (nextIndex >= profiles.length - 3 && hasMore && !isLoading) {
        fetchProfiles()
      }

      return nextIndex
    })
  }

  const handleCloseMatchModal = () => {
    setMatchModalOpen(false)
    setCurrentMatch(null)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Finding your perfect matches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              Discover Your Match
            </h1>
          </motion.div>
          <p className="text-muted-foreground">
            Find your perfect match with shared interests
          </p>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-8 mb-8"
        >
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {profiles.length - currentIndex} profiles remaining
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-rose-500" />
            <span className="text-muted-foreground">
              Viewing profile {currentIndex + 1}
            </span>
          </div>
        </motion.div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {currentProfile ? (
              <ProfileCard
                key={currentProfile.id}
                profile={currentProfile}
                onLike={handleLike}
                onPass={handlePass}
                onSendInterest={handleSendInterest}
                isLoading={isActionLoading}
              />
            ) : hasMore ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading more profiles...</p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
                  <div className="mb-4">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">
                      {profiles.length === 0 && currentIndex === 0
                        ? 'No Profiles Available'
                        : 'No More Profiles'}
                    </h2>
                    <p className="text-muted-foreground">
                      {profiles.length === 0 && currentIndex === 0
                        ? 'There are no matching profiles available right now. Try adjusting your preferences or check back later!'
                        : 'You\'ve seen all available matches for now. Check back later for new profiles!'}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {profiles.length > 0 && (
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => router.push('/matches')}
                      >
                        View Your Matches
                      </Button>
                    )}
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/preferences')}
                    >
                      Update Preferences
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setProfiles([])
                        setCurrentIndex(0)
                        setOffset(0)
                        setHasMore(true)
                        fetchProfiles()
                      }}
                    >
                      Refresh Feed
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Keyboard Shortcuts Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>
            Tip: Use keyboard shortcuts -
            <kbd className="mx-1 px-2 py-1 bg-gray-200 rounded">←</kbd> to pass,
            <kbd className="mx-1 px-2 py-1 bg-gray-200 rounded">→</kbd> to like
          </p>
        </motion.div>
      </div>

      {/* Match Modal */}
      <MatchModal
        isOpen={matchModalOpen}
        onClose={handleCloseMatchModal}
        match={currentMatch}
      />
    </div>
  )
}

export const dynamic = 'force-dynamic'
