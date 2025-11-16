'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Image, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'TEXT' | 'IMAGE') => void
  onTypingStart?: () => void
  onTypingStop?: () => void
  disabled?: boolean
  placeholder?: string
  value?: string // External control
  onChange?: (value: string) => void // External control
}

export function MessageInput({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder = 'Type a message...',
  value: externalValue,
  onChange: externalOnChange,
}: MessageInputProps) {
  const [internalMessage, setInternalMessage] = useState('')
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingRef = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Use external value if provided, otherwise internal state
  const message = externalValue !== undefined ? externalValue : internalMessage
  const setMessage = externalOnChange || setInternalMessage
  const charCount = message.length

  const MAX_CHARS = 1000

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current && onTypingStart) {
      isTypingRef.current = true
      onTypingStart()
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && onTypingStop) {
        isTypingRef.current = false
        onTypingStop()
      }
    }, 3000)
  }, [onTypingStart, onTypingStop])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_CHARS) {
      setMessage(value)
      handleTyping()
    }
  }

  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage)
      setMessage('')

      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTypingRef.current && onTypingStop) {
        isTypingRef.current = false
        onTypingStop()
      }

      // Focus back on textarea
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t bg-white p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="resize-none min-h-[44px] max-h-[120px] pr-12"
            rows={1}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={disabled}
              title="Add emoji (coming soon)"
            >
              <Smile className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={disabled}
              title="Upload image (coming soon)"
            >
              <Image className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          className="h-11 w-11 shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex justify-between items-center mt-1 px-1">
        <span
          className={cn(
            'text-xs',
            charCount > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-gray-500'
          )}
        >
          {charCount}/{MAX_CHARS}
        </span>
        <span className="text-xs text-gray-400">
          Press Enter to send, Shift+Enter for new line
        </span>
      </div>
    </div>
  )
}
