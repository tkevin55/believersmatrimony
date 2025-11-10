'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface MatchModalProps {
  isOpen: boolean
  onClose: () => void
  match: {
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
  } | null
}

export function MatchModal({ isOpen, onClose, match }: MatchModalProps) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleSendMessage = () => {
    if (match) {
      router.push(`/messages/${match.id}`)
      onClose()
    }
  }

  const handleKeepBrowsing = () => {
    onClose()
  }

  if (!match) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            It's a Match!
          </DialogTitle>
          <DialogDescription className="text-center">
            You and {match.user.name} liked each other
          </DialogDescription>
        </DialogHeader>

        {/* Confetti Effect */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    y: -20,
                    x: Math.random() * 400,
                    opacity: 1,
                    scale: Math.random() * 0.5 + 0.5,
                  }}
                  animate={{
                    y: 600,
                    rotate: Math.random() * 360,
                    opacity: 0,
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    ease: 'easeOut',
                  }}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                  }}
                >
                  <Heart
                    className="h-6 w-6"
                    style={{
                      color: ['#FF6B9D', '#C44569', '#FFC312', '#EE5A6F', '#F79F1F'][
                        Math.floor(Math.random() * 5)
                      ],
                    }}
                    fill="currentColor"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Profile Photos */}
        <div className="flex items-center justify-center gap-4 py-8 relative">
          {/* Current User Photo */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          >
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={match.currentUser.photo || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(match.currentUser.name)}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          {/* Heart Icon in Center */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.4,
              type: 'spring',
              stiffness: 200,
              damping: 10,
            }}
            className="absolute"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Heart className="h-12 w-12 text-rose-500 fill-rose-500" />
              </motion.div>

              {/* Pulsing Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-rose-500"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{
                  scale: [1, 1.5, 2],
                  opacity: [0.5, 0.3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            </div>
          </motion.div>

          {/* Matched User Photo */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          >
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={match.user.photo || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(match.user.name)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-6"
        >
          <p className="text-sm text-muted-foreground">
            Start a conversation and get to know each other better!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-3"
        >
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            onClick={handleSendMessage}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Send Message
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={handleKeepBrowsing}
          >
            Keep Browsing
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
