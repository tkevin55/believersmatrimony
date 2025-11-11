'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Loader2, Check } from 'lucide-react'

interface InterestOption {
  id: string
  name: string
  emoji: string
  category: string
  order: number
}

interface InterestSelectorProps {
  onComplete?: () => void
  isSkippable?: boolean
}

export function InterestSelector({ onComplete, isSkippable = false }: InterestSelectorProps) {
  const [allInterests, setAllInterests] = useState<{ [key: string]: InterestOption[] }>({})
  const [selectedInterests, setSelectedInterests] = useState<InterestOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [interestsRes, userInterestsRes] = await Promise.all([
        fetch('/api/interests'),
        fetch('/api/user-interests')
      ])

      if (interestsRes.ok) {
        const data = await interestsRes.json()
        setAllInterests(data.interests)
        // Set first category as default
        const categories = Object.keys(data.interests)
        if (categories.length > 0) {
          setSelectedCategory(categories[0])
        }
      }

      if (userInterestsRes.ok) {
        const data = await userInterestsRes.json()
        setSelectedInterests(data.interests || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load interests',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleInterest = async (interest: InterestOption) => {
    const isSelected = selectedInterests.some(i => i.id === interest.id)

    if (isSelected) {
      // Remove interest
      setIsSaving(true)
      try {
        const response = await fetch(`/api/user-interests?interestOptionId=${interest.id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Failed to remove interest')
        }

        setSelectedInterests(selectedInterests.filter(i => i.id !== interest.id))
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove interest',
          variant: 'destructive'
        })
      } finally {
        setIsSaving(false)
      }
    } else {
      // Add interest
      if (selectedInterests.length >= 5) {
        toast({
          title: 'Limit reached',
          description: 'You can only select up to 5 interests',
          variant: 'destructive'
        })
        return
      }

      setIsSaving(true)
      try {
        const response = await fetch('/api/user-interests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interestOptionId: interest.id })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to add interest')
        }

        setSelectedInterests([...selectedInterests, interest])

        // If user has selected 5 interests, call onComplete
        if (selectedInterests.length + 1 >= 5 && onComplete) {
          setTimeout(onComplete, 500)
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to add interest',
          variant: 'destructive'
        })
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const categories = Object.keys(allInterests)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Up to 5 Interests</h3>
        <p className="text-sm text-muted-foreground">
          Choose interests that represent you best
        </p>
        <div className="mt-2">
          <Badge variant={selectedInterests.length >= 5 ? 'default' : 'secondary'}>
            {selectedInterests.length} / 5 selected
          </Badge>
        </div>
      </div>

      {/* Selected Interests */}
      {selectedInterests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedInterests.map((interest) => (
            <Badge
              key={interest.id}
              variant="default"
              className="text-base px-3 py-1 cursor-pointer hover:opacity-80"
              onClick={() => handleToggleInterest(interest)}
            >
              <span className="mr-1">{interest.emoji}</span>
              {interest.name}
              <span className="ml-2">×</span>
            </Badge>
          ))}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Interests Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {allInterests[selectedCategory]?.map((interest) => {
          const isSelected = selectedInterests.some(i => i.id === interest.id)
          const isDisabled = !isSelected && selectedInterests.length >= 5

          return (
            <Card
              key={interest.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !isDisabled && !isSaving && handleToggleInterest(interest)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{interest.emoji}</span>
                    <span className="text-sm font-medium">{interest.name}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Actions */}
      {isSkippable && selectedInterests.length < 5 && (
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
