/**
 * Icebreaker Engine - Smart, context-aware conversation starters
 *
 * SAFETY RULES (enforced):
 * ❌ Never mention religion, caste, politics directly
 * ❌ Never comment on appearance, weight, body, looks
 * ❌ Never use "wife material / husband material" framing
 * ❌ Never use overly romantic, cheesy, or sexual language
 *
 * ✅ Always use neutral, friendly, curious tone
 * ✅ Focus on shared experiences (interests, places, habits)
 * ✅ Keep questions easy to answer, low-pressure
 * ✅ Emotionally safe, no trauma-inviting topics
 */

export type IcebreakerContext = {
  currentUser: {
    name: string
    age?: number | null
    homeDistrict?: string | null
    diasporaLocation?: string | null
    interestTags?: string[]
    weekendPreference?: string[] | null
  }
  matchUser: {
    name: string
    age?: number | null
    homeDistrict?: string | null
    diasporaLocation?: string | null
    interestTags?: string[]
    weekendPreference?: string[] | null
    occupation?: string | null
    politicalLeaning?: string | null
    keralaConnection?: string | null
    personalityPrompts?: {
      prompt: string
      answer: string
    }[]
  }
}

export type IcebreakerSuggestion = {
  id: string
  text: string
  reason: string
  category: 'INTEREST' | 'KERALA' | 'LIFESTYLE' | 'PROMPT' | 'GENERAL'
}

/**
 * Generate context-aware icebreaker suggestions
 * Pure function - deterministic output for same input
 */
export function generateIcebreakers(
  ctx: IcebreakerContext,
  limit: number = 5
): IcebreakerSuggestion[] {
  const suggestions: IcebreakerSuggestion[] = []

  // Priority 1: Shared interests (highest value)
  const sharedInterests = getSharedInterests(ctx)
  suggestions.push(...generateInterestIcebreakers(ctx, sharedInterests))

  // Priority 2: Kerala connection (strong bonding topic)
  suggestions.push(...generateKeralaIcebreakers(ctx))

  // Priority 3: Personality prompts (authentic conversation starters)
  suggestions.push(...generatePromptIcebreakers(ctx))

  // Priority 4: Lifestyle hints (weekend, occupation)
  suggestions.push(...generateLifestyleIcebreakers(ctx))

  // Priority 5: General warm openers (fallback)
  suggestions.push(...generateGeneralIcebreakers(ctx))

  // Return top suggestions by priority, ensuring at least 3
  const uniqueSuggestions = deduplicateByText(suggestions)
  const final = uniqueSuggestions.slice(0, Math.max(limit, 3))

  // If we still don't have 3, add more general ones
  if (final.length < 3) {
    final.push(...generateGeneralIcebreakers(ctx).slice(final.length))
  }

  return final
}

/**
 * Get shared interests between users
 */
function getSharedInterests(ctx: IcebreakerContext): string[] {
  const currentTags = ctx.currentUser.interestTags || []
  const matchTags = ctx.matchUser.interestTags || []
  return currentTags.filter(tag => matchTags.includes(tag))
}

/**
 * Generate icebreakers based on shared interests
 */
function generateInterestIcebreakers(
  ctx: IcebreakerContext,
  sharedInterests: string[]
): IcebreakerSuggestion[] {
  const suggestions: IcebreakerSuggestion[] = []

  // Interest-specific templates
  const interestTemplates: Record<string, string[]> = {
    'Malayalam Cinema': [
      `We both love Malayalam cinema! Which movie have you rewatched the most?`,
      `Another Malayalam cinema fan! What's your take on the new wave vs classic films?`,
    ],
    'Coffee Culture': [
      `Two coffee lovers here ☕ Filter coffee or cold brew?`,
      `I see we both appreciate good coffee. What's your go-to order?`,
    ],
    'Travel & Adventure': [
      `We both love exploring! What's been your favorite travel memory?`,
      `Fellow traveler here! Beach vacation or mountain getaway?`,
    ],
    'Reading & Books': [
      `We're both readers! What book are you currently obsessed with?`,
      `Another book lover! Fiction or non-fiction?`,
    ],
    'Cooking & Food': [
      `We both enjoy cooking! What's your signature dish?`,
      `Fellow foodie here! What's one dish you're trying to master?`,
    ],
    'Fitness & Health': [
      `We both prioritize fitness! Morning workouts or evening?`,
      `Fellow fitness enthusiast! What's your current routine?`,
    ],
    'Music': [
      `Music lovers unite! What's on your playlist lately?`,
      `We both love music! Concerts or quiet listening at home?`,
    ],
    'Photography': [
      `Two people who love photography! Phone camera or dedicated gear?`,
      `Fellow photographer! What do you love capturing most?`,
    ],
    'Art & Design': [
      `We're both into art! Museums or street art?`,
      `Creative minds! What type of art speaks to you most?`,
    ],
  }

  sharedInterests.forEach((interest, index) => {
    const templates = interestTemplates[interest] || [
      `We both enjoy ${interest.toLowerCase()}! What got you into it?`,
    ]
    const template = templates[index % templates.length]

    suggestions.push({
      id: `interest-${interest.toLowerCase().replace(/\s+/g, '-')}`,
      text: template,
      reason: `Shared interest: ${interest}`,
      category: 'INTEREST',
    })
  })

  return suggestions.slice(0, 2) // Max 2 interest-based
}

/**
 * Generate icebreakers based on Kerala connection
 */
function generateKeralaIcebreakers(ctx: IcebreakerContext): IcebreakerSuggestion[] {
  const suggestions: IcebreakerSuggestion[] = []
  const { currentUser, matchUser } = ctx

  // Same home district
  if (currentUser.homeDistrict && currentUser.homeDistrict === matchUser.homeDistrict) {
    suggestions.push({
      id: 'kerala-same-district',
      text: `Two people from ${currentUser.homeDistrict} on the same app? What are the odds 😄`,
      reason: `Both from ${currentUser.homeDistrict}`,
      category: 'KERALA',
    })
  }

  // Both diaspora
  if (currentUser.diasporaLocation && matchUser.diasporaLocation) {
    suggestions.push({
      id: 'kerala-diaspora',
      text: `How do you stay connected to Kerala from ${matchUser.diasporaLocation}?`,
      reason: 'Both living outside Kerala',
      category: 'KERALA',
    })
  }

  // General Kerala connection
  if (matchUser.keralaConnection && matchUser.keralaConnection.includes('visit')) {
    suggestions.push({
      id: 'kerala-visits',
      text: `When's your next trip home to Kerala?`,
      reason: 'Kerala roots',
      category: 'KERALA',
    })
  }

  return suggestions.slice(0, 1) // Max 1 Kerala-based
}

/**
 * Generate icebreakers based on personality prompts
 */
function generatePromptIcebreakers(ctx: IcebreakerContext): IcebreakerSuggestion[] {
  const suggestions: IcebreakerSuggestion[] = []
  const prompts = ctx.matchUser.personalityPrompts || []

  prompts.forEach((prompt, index) => {
    const answer = prompt.answer.toLowerCase()

    // Keyword-based matching for common themes
    if (answer.includes('coffee') || answer.includes('chai')) {
      suggestions.push({
        id: `prompt-coffee-${index}`,
        text: `I saw your answer about coffee/chai! What's your perfect coffee moment?`,
        reason: 'From their personality prompt',
        category: 'PROMPT',
      })
    } else if (answer.includes('wayanad') || answer.includes('munnar') || answer.includes('travel')) {
      suggestions.push({
        id: `prompt-travel-${index}`,
        text: `Your travel stories sound fun! What's the one place you'd love to revisit?`,
        reason: 'From their personality prompt',
        category: 'PROMPT',
      })
    } else if (answer.includes('book') || answer.includes('reading')) {
      suggestions.push({
        id: `prompt-books-${index}`,
        text: `A fellow reader! What book are you currently into?`,
        reason: 'From their personality prompt',
        category: 'PROMPT',
      })
    } else if (answer.includes('music') || answer.includes('song')) {
      suggestions.push({
        id: `prompt-music-${index}`,
        text: `I see music is important to you! What's been your soundtrack lately?`,
        reason: 'From their personality prompt',
        category: 'PROMPT',
      })
    } else {
      // Generic prompt-based opener
      suggestions.push({
        id: `prompt-generic-${index}`,
        text: `I loved reading "${prompt.prompt.toLowerCase()}" – ${prompt.answer.slice(0, 30)}... tell me more?`,
        reason: 'From their personality prompt',
        category: 'PROMPT',
      })
    }
  })

  return suggestions.slice(0, 2) // Max 2 prompt-based
}

/**
 * Generate icebreakers based on lifestyle preferences
 */
function generateLifestyleIcebreakers(ctx: IcebreakerContext): IcebreakerSuggestion[] {
  const suggestions: IcebreakerSuggestion[] = []
  const { matchUser } = ctx

  // Weekend preference
  const weekend = matchUser.weekendPreference || []
  if (weekend.includes('Exploring cafes and restaurants')) {
    suggestions.push({
      id: 'lifestyle-cafes',
      text: `You enjoy exploring cafes! What's the best one you've discovered recently?`,
      reason: 'Weekend preference: cafes',
      category: 'LIFESTYLE',
    })
  } else if (weekend.includes('Outdoor activities')) {
    suggestions.push({
      id: 'lifestyle-outdoors',
      text: `Outdoor activities sound great! What's your favorite thing to do outside?`,
      reason: 'Weekend preference: outdoors',
      category: 'LIFESTYLE',
    })
  } else if (weekend.includes('Reading or watching movies')) {
    suggestions.push({
      id: 'lifestyle-entertainment',
      text: `So, are you more of a movie person or a book person on weekends?`,
      reason: 'Weekend preference: entertainment',
      category: 'LIFESTYLE',
    })
  }

  // Occupation (generic, non-invasive)
  if (matchUser.occupation) {
    suggestions.push({
      id: 'lifestyle-work',
      text: `How do you like to unwind after a busy work week?`,
      reason: 'Work-life balance',
      category: 'LIFESTYLE',
    })
  }

  return suggestions.slice(0, 1) // Max 1 lifestyle-based
}

/**
 * Generate general warm openers (fallback)
 */
function generateGeneralIcebreakers(ctx: IcebreakerContext): IcebreakerSuggestion[] {
  const name = ctx.matchUser.name

  return [
    {
      id: 'general-weekend',
      text: `Hey ${name}! How's your weekend going?`,
      reason: 'Warm greeting',
      category: 'GENERAL',
    },
    {
      id: 'general-kaapi',
      text: `Hey! Coffee or chai person? ☕`,
      reason: 'Light starter',
      category: 'GENERAL',
    },
    {
      id: 'general-kerala',
      text: `What's one thing you miss most about Kerala?`,
      reason: 'Kerala connection',
      category: 'GENERAL',
    },
    {
      id: 'general-curious',
      text: `Your profile caught my attention! What brings you to Kaapi Connect?`,
      reason: 'Getting to know you',
      category: 'GENERAL',
    },
    {
      id: 'general-vibe',
      text: `Hey ${name}! If you could describe your ideal Sunday in 3 words, what would they be?`,
      reason: 'Fun question',
      category: 'GENERAL',
    },
  ]
}

/**
 * Remove duplicate suggestions by text content
 */
function deduplicateByText(suggestions: IcebreakerSuggestion[]): IcebreakerSuggestion[] {
  const seen = new Set<string>()
  return suggestions.filter(s => {
    if (seen.has(s.text)) return false
    seen.add(s.text)
    return true
  })
}

/**
 * Shuffle suggestions for variety (call with different seed for randomness)
 */
export function shuffleIcebreakers(
  ctx: IcebreakerContext,
  seed?: number
): IcebreakerSuggestion[] {
  const all = generateIcebreakers(ctx, 10) // Generate more than needed

  // Simple deterministic shuffle based on seed
  if (seed !== undefined) {
    const shuffled = [...all]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor((seed + i) % (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, 5)
  }

  return all.slice(0, 5)
}
