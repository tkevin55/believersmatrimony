'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MessageBubble } from '@/components/message-bubble'
import { MessageInput } from '@/components/message-input'
import { TypingIndicator } from '@/components/typing-indicator'
import { IcebreakerStrip } from '@/components/messages/icebreaker-strip'
import type { IcebreakerSuggestion as IcebreakerSuggestionType } from '@/components/messages/icebreaker-strip'
import { generateIcebreakers, shuffleIcebreakers, type IcebreakerContext } from '@/lib/icebreakers'
import { ArrowLeft, MoreVertical, Phone, Video, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  content: string
  type: 'TEXT' | 'IMAGE'
  senderId: string
  receiverId: string
  createdAt: Date
  isRead: boolean
  sender: {
    id: string
    name: string | null
    image: string | null
  }
}

interface MatchUser {
  id: string
  name: string | null
  image: string | null
  isOnline: boolean
}

interface UserProfile {
  id: string
  name: string | null
  age: number | null
  homeDistrict: string | null
  diasporaLocation: string | null
  interestTags: string[]
  weekendPreference: string[] | null
  occupation: string | null
  politicalLeaning: string | null
  keralaConnection: string | null
  personalityPrompts: {
    prompt: string
    answer: string
  }[]
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const { toast } = useToast()
  const matchId = params?.matchId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<MatchUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Icebreaker state
  const [messageInput, setMessageInput] = useState('')
  const [icebreakers, setIcebreakers] = useState<IcebreakerSuggestionType[]>([])
  const [icebreakerSeed, setIcebreakerSeed] = useState(0)
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null)
  const [matchUserProfile, setMatchUserProfile] = useState<UserProfile | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageCountRef = useRef(0)

  // Scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }

  // Fetch full profiles for icebreaker generation
  const fetchProfiles = async () => {
    try {
      if (!session?.user?.id || !otherUser?.id) return

      const [currentRes, matchRes] = await Promise.all([
        fetch('/api/profile'),
        fetch(`/api/profile/${otherUser.id}`),
      ])

      if (currentRes.ok && matchRes.ok) {
        const currentData = await currentRes.json()
        const matchData = await matchRes.json()
        setCurrentUserProfile(currentData.profile)
        setMatchUserProfile(matchData.profile)
      }
    } catch (error) {
      console.error('Error fetching profiles for icebreakers:', error)
    }
  }

  // Generate icebreaker suggestions
  useEffect(() => {
    if (!currentUserProfile || !matchUserProfile) return

    const context: IcebreakerContext = {
      currentUser: {
        name: currentUserProfile.name || 'You',
        age: currentUserProfile.age,
        homeDistrict: currentUserProfile.homeDistrict,
        diasporaLocation: currentUserProfile.diasporaLocation,
        interestTags: currentUserProfile.interestTags,
        weekendPreference: currentUserProfile.weekendPreference,
      },
      matchUser: {
        name: matchUserProfile.name || 'User',
        age: matchUserProfile.age,
        homeDistrict: matchUserProfile.homeDistrict,
        diasporaLocation: matchUserProfile.diasporaLocation,
        interestTags: matchUserProfile.interestTags,
        weekendPreference: matchUserProfile.weekendPreference,
        occupation: matchUserProfile.occupation,
        politicalLeaning: matchUserProfile.politicalLeaning,
        keralaConnection: matchUserProfile.keralaConnection,
        personalityPrompts: matchUserProfile.personalityPrompts,
      },
    }

    const suggestions = icebreakerSeed === 0
      ? generateIcebreakers(context, 5)
      : shuffleIcebreakers(context, icebreakerSeed)

    setIcebreakers(suggestions)
  }, [currentUserProfile, matchUserProfile, icebreakerSeed])

  // Fetch messages
  const fetchMessages = async (isInitial = false) => {
    try {
      const response = await fetch(`/api/messages/${matchId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      const data = await response.json()

      setMessages(data.messages)
      setOtherUser(data.match.user)

      // Auto-scroll only if new messages arrived or initial load
      if (isInitial || data.messages.length > lastMessageCountRef.current) {
        setTimeout(() => scrollToBottom(isInitial ? false : true), 100)
      }

      lastMessageCountRef.current = data.messages.length

      if (isInitial) {
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      if (isInitial) {
        setError('Failed to load messages')
        setIsLoading(false)
      }
    }
  }

  // Initial fetch
  useEffect(() => {
    if (!matchId || !session?.user?.id) return

    fetchMessages(true)
  }, [matchId, session])

  // Fetch profiles after otherUser is loaded
  useEffect(() => {
    if (otherUser) {
      fetchProfiles()
    }
  }, [otherUser, session])

  // Set up polling for new messages (every 3 seconds)
  useEffect(() => {
    if (!matchId || !session?.user?.id || isLoading) return

    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(false)
    }, 3000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [matchId, session, isLoading])

  // Handle sending message
  const handleSendMessage = async (content: string) => {
    if (!session?.user?.id || !otherUser || isSending) return

    setIsSending(true)

    // Optimistic update - add message immediately
    const optimisticMessage: Message = {
      id: 'temp-' + Date.now(),
      content,
      type: 'TEXT',
      senderId: session.user.id,
      receiverId: otherUser.id,
      createdAt: new Date(),
      isRead: false,
      sender: {
        id: session.user.id,
        name: session.user.name || null,
        image: session.user.image || null,
      },
    }

    setMessages(prev => [...prev, optimisticMessage])
    setTimeout(() => scrollToBottom(), 50)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          receiverId: otherUser.id,
          content,
          type: 'TEXT',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      // Fetch fresh messages to replace optimistic update
      await fetchMessages(false)
    } catch (error: any) {
      console.error('Error sending message:', error)

      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))

      toast({
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
      })
    } finally {
      setIsSending(false)
    }
  }

  // Handle icebreaker selection
  const handleIcebreakerSelect = (text: string) => {
    setMessageInput(text)
  }

  // Handle shuffle
  const handleShuffle = () => {
    setIcebreakerSeed(prev => prev + 1)
  }

  // Show icebreakers only when there are no messages yet
  const showIcebreakers = messages.length === 0 && icebreakers.length > 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (error || !otherUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Match not found'}</p>
          <Button onClick={() => router.push('/messages')}>
            Back to Messages
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/messages')}
            className="lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${otherUser.id}`)}>
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={otherUser.image || undefined}
                  alt={otherUser.name || 'User'}
                />
                <AvatarFallback>
                  {otherUser.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {otherUser.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div>
              <h2 className="font-semibold text-sm">
                {otherUser.name || 'Anonymous'}
              </h2>
              <p className="text-xs text-gray-500">
                {otherUser.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled title="Voice call (coming soon)">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" disabled title="Video call (coming soon)">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" title="More options">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="mb-2 text-lg">Good conversations start with a hello 👋</p>
              <p className="text-sm">Send your first message to break the ice</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                content={message.content}
                type={message.type}
                senderId={message.senderId}
                currentUserId={session?.user?.id || ''}
                senderName={message.sender.name}
                senderImage={message.sender.image}
                createdAt={message.createdAt}
                isRead={message.isRead}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Icebreaker Strip - only show when no messages yet */}
      {showIcebreakers && (
        <IcebreakerStrip
          suggestions={icebreakers}
          onSelect={handleIcebreakerSelect}
          onShuffle={handleShuffle}
          isLoading={!currentUserProfile || !matchUserProfile}
        />
      )}

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isSending}
        value={messageInput}
        onChange={setMessageInput}
      />
    </div>
  )
}

export const dynamic = 'force-dynamic'
