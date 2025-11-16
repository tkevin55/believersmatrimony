'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PERSONALITY_PROMPT_BANK, getPromptColorClasses, PersonalityPrompt } from '@/lib/personality-prompts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromptSelectorProps {
  excludePromptIds?: string[]
  onSelect: (prompt: PersonalityPrompt) => void
  onClose: () => void
}

/**
 * PromptSelector - Modal to choose a personality prompt to answer
 * Groups prompts by category for easy browsing
 */
export function PromptSelector({ excludePromptIds = [], onSelect, onClose }: PromptSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter out already-answered prompts
  const availablePrompts = PERSONALITY_PROMPT_BANK.filter(
    (prompt) => !excludePromptIds.includes(prompt.id)
  )

  // Group by category
  const categories = Array.from(new Set(availablePrompts.map((p) => p.category)))

  const filteredPrompts = selectedCategory
    ? availablePrompts.filter((p) => p.category === selectedCategory)
    : availablePrompts

  const categoryLabels = {
    interests: 'Interests',
    values: 'Values',
    lifestyle: 'Lifestyle',
    personality: 'Personality',
    quirks: 'Quirks',
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        <Card className="rounded-2xl border-0 shadow-2xl">
          <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Choose a Prompt</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="rounded-full"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </Button>
              ))}
            </div>

            {/* Prompt list */}
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {filteredPrompts.map((prompt, index) => {
                  const colors = getPromptColorClasses(prompt.colorTheme)

                  return (
                    <motion.button
                      key={prompt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      onClick={() => onSelect(prompt)}
                      className={cn(
                        'w-full text-left rounded-xl border-2 p-4 transition-all',
                        colors.bg,
                        colors.border,
                        colors.hoverBg,
                        'hover:shadow-md'
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-medium text-foreground">
                            {prompt.text}
                          </p>
                          <Badge
                            variant="secondary"
                            className="mt-2 text-xs rounded-full"
                          >
                            {categoryLabels[prompt.category as keyof typeof categoryLabels]}
                          </Badge>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </AnimatePresence>

              {filteredPrompts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>All prompts answered! You've reached the maximum of 3.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
