import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export function formatHeight(heightInCm: number): string {
  const totalInches = heightInCm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
}

export function cmToFeetInches(cm: number): string {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
}

export function formatHeightWithCm(cm: number): string {
  return `${cmToFeetInches(cm)} (${cm} cm)`
}

export function calculateProfileCompletion(profile: any): number {
  const fields = [
    'dateOfBirth',
    'gender',
    'aboutMe',
    'denomination',
    'height',
    'bodyType',
    'educationLevel',
    'occupation',
    'city',
    'state',
    'country',
  ]

  const completedFields = fields.filter(field => {
    const value = profile[field]
    return value !== null && value !== undefined && value !== ''
  })

  return Math.round((completedFields.length / fields.length) * 100)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Generate a consistent, neutral avatar color based on a name
 * Returns Tailwind CSS classes for background and text color
 * Uses pastel colors that work well for both light and dark text
 */
export function getAvatarColor(name: string | null | undefined): string {
  if (!name) return 'bg-gray-200 text-gray-700'

  // Neutral, culturally-safe pastel colors
  const colors = [
    'bg-blue-100 text-blue-700',      // Pastel blue
    'bg-green-100 text-green-700',    // Pastel green
    'bg-purple-100 text-purple-700',  // Pastel purple
    'bg-pink-100 text-pink-700',      // Pastel pink
    'bg-indigo-100 text-indigo-700',  // Pastel indigo
    'bg-teal-100 text-teal-700',      // Pastel teal
    'bg-orange-100 text-orange-700',  // Pastel orange
    'bg-cyan-100 text-cyan-700',      // Pastel cyan
  ]

  // Simple hash function based on first letter
  const firstChar = name.trim().charAt(0).toUpperCase()
  const index = firstChar.charCodeAt(0) % colors.length

  return colors[index]
}
