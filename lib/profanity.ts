// Basic profanity filter for content moderation
const profaneWords = [
  'damn',
  'hell',
  'crap',
  'shit',
  'fuck',
  'bitch',
  'ass',
  'bastard',
  'dick',
  'pussy',
  'cock',
  'sex',
  'porn',
  // Add more words as needed
]

export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase()
  return profaneWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(lowerText)
  })
}

export function filterProfanity(text: string): string {
  let filteredText = text

  profaneWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    filteredText = filteredText.replace(regex, (match) => {
      return '*'.repeat(match.length)
    })
  })

  return filteredText
}

export function validateMessageContent(content: string): {
  isValid: boolean
  message?: string
} {
  if (!content || content.trim().length === 0) {
    return { isValid: false, message: 'Message cannot be empty' }
  }

  if (content.length > 1000) {
    return { isValid: false, message: 'Message is too long (max 1000 characters)' }
  }

  if (containsProfanity(content)) {
    return { isValid: false, message: 'Message contains inappropriate language' }
  }

  return { isValid: true }
}
