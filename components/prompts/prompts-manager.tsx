'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PromptCard } from './prompt-card'
import { PromptSelector } from './prompt-selector'
import { PromptEditor } from './prompt-editor'
import { PersonalityPrompt, canAddMorePrompts } from '@/lib/personality-prompts'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, Edit, Coffee } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface SavedPrompt {
  id: string
  prompt: string
  answer: string
  order: number
  createdAt: Date
}

interface PromptsManagerProps {
  className?: string
}

/**
 * PromptsManager - Complete UI for managing personality prompts
 * Displays existing prompts with edit/delete actions
 * Allows adding new prompts up to max of 3
 */
export function PromptsManager({ className }: PromptsManagerProps) {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSelector, setShowSelector] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | null>(null)
  const [selectedPromptType, setSelectedPromptType] = useState<PersonalityPrompt | null>(null)
  const { toast } = useToast()

  // Fetch prompts
  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/personality-prompts')

      if (!response.ok) {
        throw new Error('Failed to fetch prompts')
      }

      const data = await response.json()
      setPrompts(data.prompts || [])
    } catch (error) {
      console.error('Error fetching prompts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load personality prompts',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPrompt = () => {
    if (!canAddMorePrompts(prompts.length)) {
      toast({
        title: 'Maximum Reached',
        description: 'You can only add up to 3 personality prompts',
      })
      return
    }

    setShowSelector(true)
  }

  const handleSelectPrompt = (prompt: PersonalityPrompt) => {
    setSelectedPromptType(prompt)
    setShowSelector(false)
    setShowEditor(true)
  }

  const handleSaveAnswer = async (answer: string) => {
    try {
      if (!selectedPromptType && !editingPrompt) return

      const isEditing = !!editingPrompt

      const response = await fetch(
        isEditing
          ? `/api/personality-prompts/${editingPrompt.id}`
          : '/api/personality-prompts',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            promptId: isEditing ? editingPrompt.prompt : selectedPromptType!.id,
            answer,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast({
        title: isEditing ? 'Prompt Updated' : 'Prompt Added',
        description: 'Your personality prompt has been saved',
      })

      setShowEditor(false)
      setEditingPrompt(null)
      setSelectedPromptType(null)
      fetchPrompts()
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save prompt',
        variant: 'destructive',
      })
    }
  }

  const handleEditPrompt = (prompt: SavedPrompt) => {
    setEditingPrompt(prompt)
    setShowEditor(true)
  }

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return
    }

    try {
      const response = await fetch(`/api/personality-prompts/${promptId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete')
      }

      toast({
        title: 'Prompt Deleted',
        description: 'Your personality prompt has been removed',
      })

      fetchPrompts()
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete prompt',
        variant: 'destructive',
      })
    }
  }

  const answeredPromptIds = prompts.map((p) => p.prompt)

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Personality Prompts</h3>
          <p className="text-sm text-muted-foreground">
            Add up to 3 prompts to showcase your personality ({prompts.length}/3)
          </p>
        </div>
        {canAddMorePrompts(prompts.length) && (
          <Button
            onClick={handleAddPrompt}
            size="sm"
            className="rounded-full"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Prompt
          </Button>
        )}
      </div>

      {/* Existing prompts */}
      {prompts.length > 0 ? (
        <div className="space-y-4">
          {prompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <PromptCard
                promptId={prompt.prompt}
                answer={prompt.answer}
                delay={0}
              />

              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => handleEditPrompt(prompt)}
                  className="h-8 w-8 rounded-full shadow-md"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDeletePrompt(prompt.id)}
                  className="h-8 w-8 rounded-full shadow-md"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Coffee className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h4 className="text-lg font-semibold mb-2">Add Personality Cards</h4>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Answer a few prompts to help people get to know you better. Authentic answers make better connections!
            </p>
            <Button
              onClick={handleAddPrompt}
              size="lg"
              className="rounded-full"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Prompt
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Selector Modal */}
      <AnimatePresence>
        {showSelector && (
          <PromptSelector
            excludePromptIds={answeredPromptIds}
            onSelect={handleSelectPrompt}
            onClose={() => setShowSelector(false)}
          />
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (selectedPromptType || editingPrompt) && (
          <PromptEditor
            prompt={
              editingPrompt
                ? ({ id: editingPrompt.prompt, text: editingPrompt.prompt } as PersonalityPrompt)
                : selectedPromptType!
            }
            initialAnswer={editingPrompt?.answer}
            onSave={handleSaveAnswer}
            onCancel={() => {
              setShowEditor(false)
              setEditingPrompt(null)
              setSelectedPromptType(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
