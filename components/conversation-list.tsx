'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDistanceToNow } from 'date-fns'
import { Search, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { truncateText } from '@/lib/utils'

interface Conversation {
  matchId: string
  user: {
    id: string
    name: string | null
    image: string | null
    isOnline: boolean
  }
  lastMessage: {
    content: string
    createdAt: Date
    senderId: string
  } | null
  unreadCount: number
  matchedAt: Date
}

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
  selectedMatchId?: string
}

export function ConversationList({
  conversations,
  currentUserId,
  selectedMatchId,
}: ConversationListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) => {
    const name = conv.user.name?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return name.includes(query)
  })

  const handleConversationClick = (matchId: string) => {
    router.push(`/messages/${matchId}`)
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Your story is just getting started 🍵
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Match with someone you like, and your conversations will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No conversations found
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => {
              const isSelected = selectedMatchId === conversation.matchId
              const lastMessagePreview = conversation.lastMessage
                ? conversation.lastMessage.senderId === currentUserId
                  ? `You: ${conversation.lastMessage.content}`
                  : conversation.lastMessage.content
                : 'Start a conversation'

              const timeAgo = conversation.lastMessage
                ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                    addSuffix: true,
                  })
                : formatDistanceToNow(new Date(conversation.matchedAt), {
                    addSuffix: true,
                  })

              return (
                <div
                  key={conversation.matchId}
                  onClick={() => handleConversationClick(conversation.matchId)}
                  className={cn(
                    'flex items-start gap-3 p-4 border-b cursor-pointer transition-colors hover:bg-gray-50',
                    isSelected && 'bg-blue-50 hover:bg-blue-50'
                  )}
                >
                  <div className="relative">
                    <UserAvatar
                      name={conversation.user.name}
                      image={conversation.user.image}
                      className="h-12 w-12"
                    />
                    {conversation.user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {conversation.user.name || 'Anonymous'}
                      </h3>
                      <span className="text-xs text-gray-500 shrink-0">
                        {timeAgo}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          'text-sm truncate',
                          conversation.unreadCount > 0
                            ? 'font-medium text-gray-900'
                            : 'text-gray-500'
                        )}
                      >
                        {truncateText(lastMessagePreview, 50)}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge
                          variant="default"
                          className="shrink-0 min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5"
                        >
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
