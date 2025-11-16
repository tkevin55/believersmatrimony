'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getPromptById, getPromptColorClasses } from '@/lib/personality-prompts'

interface PromptCardProps {
  promptId: string
  answer: string
  delay?: number
  className?: string
}

/**
 * PromptCard - Displays a single personality prompt answer
 * Hinge-style card with Kerala-inspired warm design
 */
export function PromptCard({ promptId, answer, delay = 0, className }: PromptCardProps) {
  const prompt = getPromptById(promptId)

  if (!prompt) {
    return null
  }

  const colors = getPromptColorClasses(prompt.colorTheme)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn('relative', className)}
    >
      <div
        className={cn(
          'rounded-2xl border-2 p-6 transition-all duration-200',
          colors.bg,
          colors.border,
          'hover:shadow-md'
        )}
      >
        {/* Prompt question */}
        <h3
          className={cn(
            'text-sm font-semibold mb-3 tracking-wide uppercase',
            colors.text
          )}
        >
          {prompt.text}
        </h3>

        {/* User's answer */}
        <p className="text-base leading-relaxed text-foreground/90 font-serif">
          {answer}
        </p>
      </div>
    </motion.div>
  )
}

/**
 * Compact version for small spaces
 */
export function PromptCardCompact({ promptId, answer, className }: Omit<PromptCardProps, 'delay'>) {
  const prompt = getPromptById(promptId)

  if (!prompt) {
    return null
  }

  const colors = getPromptColorClasses(prompt.colorTheme)

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        colors.bg,
        colors.border,
        className
      )}
    >
      <h4 className={cn('text-xs font-semibold mb-2', colors.text)}>
        {prompt.text}
      </h4>
      <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3">
        {answer}
      </p>
    </div>
  )
}
