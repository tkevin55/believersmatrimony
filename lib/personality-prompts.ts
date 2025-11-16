/**
 * Personality Prompts - Hinge-style storytelling for Kaapi Connect
 * Adds depth, emotional compatibility, and warmth to profiles
 */

export interface PersonalityPrompt {
  id: string
  text: string
  category: 'interests' | 'values' | 'lifestyle' | 'personality' | 'quirks'
  colorTheme: 'teal' | 'beige' | 'maroon' | 'sage' | 'lavender'
}

/**
 * Curated prompt bank - Kerala-inspired, warm, and emotionally resonant
 * Max 3 prompts per user profile
 */
export const PERSONALITY_PROMPT_BANK: PersonalityPrompt[] = [
  {
    id: 'obsessed-with',
    text: "Two things I'm currently obsessed with",
    category: 'interests',
    colorTheme: 'teal',
  },
  {
    id: 'hill-to-die-on',
    text: 'The one hill I will die on',
    category: 'values',
    colorTheme: 'maroon',
  },
  {
    id: 'malayalam-cinema-take',
    text: 'My Malayalam cinema hot take',
    category: 'quirks',
    colorTheme: 'teal',
  },
  {
    id: 'bring-to-relationship',
    text: "What I'll bring to a relationship",
    category: 'personality',
    colorTheme: 'beige',
  },
  {
    id: 'perfect-weekend',
    text: 'My perfect weekend looks like',
    category: 'lifestyle',
    colorTheme: 'sage',
  },
  {
    id: 'green-flag',
    text: 'A green flag about me',
    category: 'personality',
    colorTheme: 'lavender',
  },
  {
    id: 'tiny-happiness',
    text: 'A tiny thing that makes me happy',
    category: 'quirks',
    colorTheme: 'beige',
  },
  {
    id: 'take-you-kerala',
    text: 'If I could take you anywhere in Kerala',
    category: 'lifestyle',
    colorTheme: 'teal',
  },
  {
    id: 'food-opinion',
    text: 'My unpopular food opinion',
    category: 'quirks',
    colorTheme: 'maroon',
  },
  {
    id: 'how-i-show-care',
    text: 'How I show care',
    category: 'values',
    colorTheme: 'lavender',
  },
]

/**
 * Get color theme CSS classes for prompt cards
 */
export function getPromptColorClasses(theme: PersonalityPrompt['colorTheme']) {
  const themes = {
    teal: {
      bg: 'bg-primary/5',
      border: 'border-primary/20',
      text: 'text-primary',
      hoverBg: 'hover:bg-primary/10',
    },
    beige: {
      bg: 'bg-secondary/30',
      border: 'border-secondary/40',
      text: 'text-secondary-foreground',
      hoverBg: 'hover:bg-secondary/40',
    },
    maroon: {
      bg: 'bg-accent/5',
      border: 'border-accent/20',
      text: 'text-accent',
      hoverBg: 'hover:bg-accent/10',
    },
    sage: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      hoverBg: 'hover:bg-green-100',
    },
    lavender: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      hoverBg: 'hover:bg-purple-100',
    },
  }

  return themes[theme]
}

/**
 * Get prompt by ID
 */
export function getPromptById(id: string): PersonalityPrompt | undefined {
  return PERSONALITY_PROMPT_BANK.find((p) => p.id === id)
}

/**
 * Get prompts by category
 */
export function getPromptsByCategory(category: PersonalityPrompt['category']) {
  return PERSONALITY_PROMPT_BANK.filter((p) => p.category === category)
}

/**
 * Validate that user hasn't exceeded 3 prompts
 */
export function canAddMorePrompts(currentCount: number): boolean {
  return currentCount < 3
}
