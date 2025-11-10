import React from 'react'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  content: string
  type: 'TEXT' | 'IMAGE'
  senderId: string
  currentUserId: string
  senderName?: string | null
  senderImage?: string | null
  createdAt: Date
  isRead?: boolean
}

export function MessageBubble({
  content,
  type,
  senderId,
  currentUserId,
  senderName,
  senderImage,
  createdAt,
  isRead,
}: MessageBubbleProps) {
  const isSent = senderId === currentUserId
  const time = format(new Date(createdAt), 'h:mm a')

  return (
    <div
      className={cn(
        'flex items-end gap-2 mb-4',
        isSent ? 'justify-end' : 'justify-start'
      )}
    >
      {!isSent && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={senderImage || undefined} alt={senderName || 'User'} />
          <AvatarFallback>
            {senderName?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col max-w-[70%]',
          isSent ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-2 break-words',
            isSent
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          )}
        >
          {type === 'IMAGE' ? (
            <img
              src={content}
              alt="Message attachment"
              className="max-w-full rounded-lg"
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          )}
        </div>

        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-xs text-gray-500">{time}</span>
          {isSent && (
            <span className="text-gray-500">
              {isRead ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      </div>

      {isSent && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={senderImage || undefined} alt={senderName || 'You'} />
          <AvatarFallback>
            {senderName?.charAt(0).toUpperCase() || 'Y'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
