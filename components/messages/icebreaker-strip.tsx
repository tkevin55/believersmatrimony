'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Shuffle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export type IcebreakerSuggestion = {
  id: string
  text: string
  reason: string
  category: 'INTEREST' | 'KERALA' | 'LIFESTYLE' | 'PROMPT' | 'GENERAL'
}

interface IcebreakerStripProps {
  suggestions: IcebreakerSuggestion[]
  onSelect: (text: string) => void
  onShuffle?: () => void
  isLoading?: boolean
  className?: string
}

/**
 * IcebreakerStrip - Smart conversation starters for messaging
 * Shows contextual suggestions with shuffle functionality
 */
export function IcebreakerStrip({
  suggestions,
  onSelect,
  onShuffle,
  isLoading = false,
  className,
}: IcebreakerStripProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Don't show if no suggestions
  if (!isLoading && suggestions.length === 0) {
    return null
  }

  const handleSelect = (suggestion: IcebreakerSuggestion) => {
    setSelectedId(suggestion.id)
    onSelect(suggestion.text)

    // Reset selection after animation
    setTimeout(() => setSelectedId(null), 300)
  }

  return (
    <div className={cn('bg-muted/30 border-t px-4 py-3', className)}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Suggestions to start the conversation</span>
          </div>

          {/* Shuffle button */}
          {onShuffle && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShuffle}
              className="h-7 w-7 p-0 rounded-full"
              aria-label="Shuffle suggestions"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Suggestions pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <AnimatePresence mode="wait">
            {isLoading ? (
              // Loading skeletons
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-9 w-48 rounded-full bg-muted animate-pulse shrink-0"
                  />
                ))}
              </div>
            ) : (
              // Actual suggestions
              suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.2,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  onClick={() => handleSelect(suggestion)}
                  title={suggestion.reason} // Native tooltip
                  className={cn(
                    'px-4 py-2 rounded-full border-2 text-sm font-medium shrink-0',
                    'transition-all duration-150',
                    'hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm',
                    'active:scale-95',
                    selectedId === suggestion.id && 'bg-primary/10 border-primary'
                  )}
                >
                  <span className="line-clamp-1 max-w-xs">
                    {suggestion.text}
                  </span>
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom scrollbar hide */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

/**
 * Compact version for mobile
 */
export function IcebreakerStripCompact({
  suggestions,
  onSelect,
  onShuffle,
  isLoading = false,
}: IcebreakerStripProps) {
  if (!isLoading && suggestions.length === 0) {
    return null
  }

  return (
    <div className="bg-muted/20 px-3 py-2 border-t">
      <div className="flex items-center gap-2 mb-1.5">
        <Sparkles className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">Quick starts</span>
        {onShuffle && !isLoading && (
          <button
            onClick={onShuffle}
            className="ml-auto p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="Shuffle"
          >
            <Shuffle className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="h-7 w-40 rounded-full bg-muted animate-pulse shrink-0"
            />
          ))
        ) : (
          suggestions.slice(0, 3).map((suggestion, index) => (
            <motion.button
              key={suggestion.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03, duration: 0.15 }}
              onClick={() => onSelect(suggestion.text)}
              className="px-3 py-1.5 rounded-full bg-background border text-xs font-medium shrink-0 hover:bg-muted/50 active:scale-95 transition-all"
            >
              <span className="line-clamp-1 max-w-[150px]">
                {suggestion.text}
              </span>
            </motion.button>
          ))
        )}
      </div>
    </div>
  )
}
