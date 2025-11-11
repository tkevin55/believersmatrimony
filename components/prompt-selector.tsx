'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Loader2, X, CheckCircle2 } from 'lucide-react'

interface Prompt {
  id: string
  category: string
  text: string
  order: number
}

interface PromptAnswer {
  id: string
  promptId: string
  answer: string
  order: number
  prompt: Prompt
}

interface PromptSelectorProps {
  onComplete?: () => void
  isSkippable?: boolean
}

const CATEGORY_LABELS: { [key: string]: string } = {
  FAITH_AND_BELIEF: 'Faith & Belief',
  PERSONALITY_AND_DAILY_LIFE: 'Personality & Daily Life',
  RELATIONSHIP_AND_MARRIAGE: 'Relationship & Marriage',
  LIFESTYLE_AND_MISSION: 'Lifestyle & Mission',
  CREATIVITY_AND_FUN: 'Creativity & Fun',
}

export function PromptSelector({ onComplete, isSkippable = false }: PromptSelectorProps) {
  const [prompts, setPrompts] = useState<{ [key: string]: Prompt[] }>({})
  const [myAnswers, setMyAnswers] = useState<PromptAnswer[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('FAITH_AND_BELIEF')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [promptsRes, answersRes] = await Promise.all([
        fetch('/api/prompts'),
        fetch('/api/prompt-answers')
      ])

      if (promptsRes.ok) {
        const data = await promptsRes.json()
        setPrompts(data.prompts)
      }

      if (answersRes.ok) {
        const data = await answersRes.json()
        setMyAnswers(data.answers || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load prompts',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPrompt = (prompt: Prompt) => {
    // Check if already answered
    if (myAnswers.some(a => a.promptId === prompt.id)) {
      toast({
        title: 'Already answered',
        description: 'You have already answered this prompt',
        variant: 'destructive'
      })
      return
    }

    setSelectedPrompt(prompt)
    setAnswer('')
  }

  const handleSaveAnswer = async () => {
    if (!selectedPrompt || !answer.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide an answer',
        variant: 'destructive'
      })
      return
    }

    if (answer.length > 250) {
      toast({
        title: 'Error',
        description: 'Answer must be 250 characters or less',
        variant: 'destructive'
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/prompt-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: selectedPrompt.id,
          answer: answer.trim()
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save answer')
      }

      const data = await response.json()
      setMyAnswers([...myAnswers, data.answer])
      setSelectedPrompt(null)
      setAnswer('')

      toast({
        title: 'Success',
        description: 'Answer saved successfully!'
      })

      // If user has answered 3 prompts, call onComplete
      if (myAnswers.length + 1 >= 3 && onComplete) {
        onComplete()
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save answer',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAnswer = async (answerId: string) => {
    try {
      const response = await fetch(`/api/prompt-answers?id=${answerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete answer')
      }

      setMyAnswers(myAnswers.filter(a => a.id !== answerId))

      toast({
        title: 'Success',
        description: 'Answer removed'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove answer',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Answer Up to 3 Prompts</h3>
        <p className="text-sm text-muted-foreground">
          Share more about yourself by answering prompts (max 250 characters each)
        </p>
        <div className="mt-2">
          <Badge variant={myAnswers.length >= 3 ? 'default' : 'secondary'}>
            {myAnswers.length} / 3 answered
          </Badge>
        </div>
      </div>

      {/* My Answers */}
      {myAnswers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Your Answers</h4>
          {myAnswers.map((answer) => (
            <Card key={answer.id} className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary mb-1">
                      {answer.prompt.text}
                    </p>
                    <p className="text-sm text-muted-foreground">{answer.answer}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAnswer(answer.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Prompt Selection */}
      {myAnswers.length < 3 && !selectedPrompt && (
        <>
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.keys(prompts).map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {CATEGORY_LABELS[category] || category}
              </Button>
            ))}
          </div>

          {/* Prompts Grid */}
          <div className="grid gap-3">
            {prompts[selectedCategory]?.map((prompt) => {
              const isAnswered = myAnswers.some(a => a.promptId === prompt.id)
              return (
                <Card
                  key={prompt.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isAnswered ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !isAnswered && handleSelectPrompt(prompt)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      {isAnswered && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      <p className="text-sm font-medium">{prompt.text}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Answer Form */}
      {selectedPrompt && (
        <Card className="border-primary">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-primary mb-4">{selectedPrompt.text}</p>
              <div className="space-y-2">
                <Label htmlFor="answer">Your Answer</Label>
                <Textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Share your response..."
                  className="min-h-[120px]"
                  maxLength={250}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {answer.length} / 250 characters
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedPrompt(null)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveAnswer} disabled={isSaving || !answer.trim()}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Answer'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {isSkippable && myAnswers.length < 3 && (
        <Button
          variant="ghost"
          onClick={onComplete}
          className="w-full"
        >
          Skip for now
        </Button>
      )}
    </div>
  )
}
