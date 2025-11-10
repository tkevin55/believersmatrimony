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
