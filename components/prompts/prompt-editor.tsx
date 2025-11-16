'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PersonalityPrompt as PromptType, getPromptColorClasses } from '@/lib/personality-prompts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromptEditorProps {
  prompt: PromptType
  initialAnswer?: string
  onSave: (answer: string) => void
  onCancel: () => void
  isLoading?: boolean
}

/**
 * PromptEditor - Form to write/edit answer to a personality prompt
 * Warm, encouraging design with character count
 */
export function PromptEditor({
  prompt,
  initialAnswer = '',
  onSave,
  onCancel,
  isLoading = false,
}: PromptEditorProps) {
  const [answer, setAnswer] = useState(initialAnswer)
  const colors = getPromptColorClasses(prompt.colorTheme)

  const MAX_LENGTH = 280
  const characterCount = answer.length
  const isValid = answer.trim().length >= 10 && answer.length <= MAX_LENGTH

  const handleSave = () => {
    if (isValid) {
      onSave(answer.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg"
      >
        <Card className="rounded-2xl border-0 shadow-2xl">
          <CardHeader className={cn('border-b px-6 py-5', colors.bg)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg font-bold mb-1">
                  Answer This Prompt
                </CardTitle>
                <p className={cn('text-sm font-semibold', colors.text)}>
                  {prompt.text}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="rounded-full -mt-1"
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Textarea */}
            <div className="space-y-2">
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Share something authentic and warm..."
                maxLength={MAX_LENGTH}
                rows={6}
                className="resize-none rounded-xl border-2 text-base leading-relaxed font-serif focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
              />

              {/* Character count */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {characterCount < 10 && (
                    <span className="text-amber-600">
                      Write at least 10 characters
                    </span>
                  )}
                  {characterCount >= 10 && characterCount < 100 && (
                    <span className="text-green-600 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Keep going!
                    </span>
                  )}
                  {characterCount >= 100 && (
                    <span className="text-primary flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Great answer!
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'font-mono',
                    characterCount > MAX_LENGTH * 0.9 ? 'text-amber-600' : 'text-muted-foreground'
                  )}
                >
                  {characterCount}/{MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* Tips */}
            <div className={cn('rounded-xl p-4 text-sm', colors.bg)}>
              <p className="font-semibold mb-2 text-foreground/80">💡 Tips:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Be authentic and specific</li>
                <li>• Show your personality, not just facts</li>
                <li>• Keep it warm and conversational</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isValid || isLoading}
                className="flex-1 rounded-full"
              >
                {isLoading ? 'Saving...' : 'Save Answer'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
