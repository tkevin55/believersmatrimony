/**
 * Safe formatting utilities for profile data
 * Handles null/undefined values gracefully to prevent runtime crashes
 */

/**
 * Safely formats underscore-separated strings to title case
 * @example formatLabel("NORTH_AMERICA") => "North America"
 * @example formatLabel(null) => null
 */
export function formatLabel(text: string | null | undefined): string | null {
  if (!text) return null

  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Safely formats education level strings
 * @example formatEducation("BACHELORS_DEGREE") => "Bachelors Degree"
 */
export function formatEducation(edu: string | null | undefined): string | null {
  if (!edu) return null

  return edu
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Safely formats Kerala district names
 * @example formatDistrict("KOTTAYAM") => "Kottayam"
 * @example formatDistrict("NORTH_AMERICA") => "North America"
 */
export function formatDistrict(district: string | null | undefined): string | null {
  if (!district) return null

  return district
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Safely formats interest tags
 * @example formatInterestTag("HIKING_CAMPING") => "Hiking Camping"
 */
export function formatInterestTag(tag: string | null | undefined): string | null {
  if (!tag) return null

  return tag
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Safely normalizes array fields that might be null/undefined
 * @example safeArray([1, 2, 3]) => [1, 2, 3]
 * @example safeArray(null) => []
 * @example safeArray(undefined) => []
 */
export function safeArray<T>(arr: T[] | null | undefined): T[] {
  return arr ?? []
}

/**
 * Gets a safe display name (never returns null)
 */
export function safeDisplayName(name: string | null | undefined): string {
  return name || 'Anonymous User'
}
