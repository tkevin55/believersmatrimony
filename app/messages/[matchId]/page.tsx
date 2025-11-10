'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageBubble } from '@/components/message-bubble'
import { MessageInput } from '@/components/message-input'
import { TypingIndicator } from '@/components/typing-indicator'
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react'
import {
  connectSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  sendMessage as sendSocketMessage,
  emitTypingStart,
  emitTypingStop,
  onNewMessage,
  onTyping,
  onMessagesRead,
  offNewMessage,
  offTyping,
  offMessagesRead,
  SocketMessage,
} from '@/lib/socket'

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

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const matchId = params?.matchId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<MatchUser | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch messages
  useEffect(() => {
    if (!matchId || !session?.user?.id) return

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${matchId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch messages')
        }
        const data = await response.json()
        setMessages(data.messages)
        setOtherUser(data.match.user)
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching messages:', err)
        setError('Failed to load messages')
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [matchId, session])

  // Socket.io setup
  useEffect(() => {
    if (!session?.user?.id || !matchId) return

    const socket = connectSocket(session.user.id)

    // Join conversation room
    joinConversation(matchId)

    // Listen for new messages
    onNewMessage((message: SocketMessage) => {
      if (message.matchId === matchId) {
        setMessages((prev) => [...prev, message as any])
        scrollToBottom()
      }
    })

    // Listen for typing events
    onTyping((data) => {
      if (data.matchId === matchId && data.userId !== session.user.id) {
        setIsTyping(true)

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }

        // Stop typing indicator after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false)
        }, 3000)
      }
    })

    // Listen for messages read
    onMessagesRead((data) => {
      if (data.matchId === matchId) {
        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
          )
        )
      }
    })

    // Cleanup
    return () => {
      leaveConversation(matchId)
      offNewMessage()
      offTyping()
      offMessagesRead()
    }
  }, [session, matchId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      disconnectSocket()
    }
  }, [])

  const handleSendMessage = async (content: string) => {
    if (!session?.user?.id || !otherUser) return

    try {
      // Send via Socket.io
      sendSocketMessage({
        matchId,
        receiverId: otherUser.id,
        content,
        type: 'TEXT',
      })

      // Fallback to REST API if socket not connected
      // The message will be added via socket event listener
    } catch (error) {
      console.error('Error sending message:', error)
      // Fallback to REST API
      await fetch('/api/messages', {
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
    }
  }

  const handleTypingStart = () => {
    emitTypingStart(matchId)
  }

  const handleTypingStop = () => {
    emitTypingStop(matchId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
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

          <div className="flex items-center gap-3">
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
              <p className="mb-2">No messages yet</p>
              <p className="text-sm">Send a message to start the conversation</p>
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
            {isTyping && <TypingIndicator userName={otherUser.name} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />
    </div>
  )
}
