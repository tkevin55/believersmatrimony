/**
 * Shared profile types for Kaapi Connect
 * Used across Discover, Search, Likes, and Messages feeds
 */

export interface PersonalityPrompt {
  id: string
  promptKey: string
  prompt?: string
  answer: string
  order: number
}

export interface PublicProfile {
  id: string
  name: string | null
  age: number
  gender: string
  location: string

  // Kerala/diaspora fields
  homeDistrict?: string | null
  diasporaLocation?: string | null
  keralaConnection?: string | null

  // Basic info
  height?: string | null
  occupation?: string | null
  educationLevel?: string | null
  aboutMe?: string | null
  primaryPhoto?: string | null

  // Kaapi Connect fields (secular, interests-based)
  interestTags?: string[] | null
  politicalLeaning?: string | null
  socialValues?: string[] | null
  weekendPreference?: string[] | null

  // Matching
  matchPercentage?: number | null

  // Profile status
  isVerified?: boolean
  isOnline?: boolean
  profileViews?: number

  // Personality prompts (max 3)
  personalityPrompts?: PersonalityPrompt[] | null
}

export interface MatchSummary {
  id: string
  createdAt: Date | string
  profile: PublicProfile
  lastMessageAt?: Date | string | null
  lastMessageSnippet?: string | null
  unreadCount?: number
}

export interface LikeProfile {
  id: string
  likerId: string
  isSuperLike: boolean
  createdAt: string
  liker: {
    id: string
    name: string
    profile: {
      dateOfBirth: string
      gender: string
      city?: string
      state?: string
      homeDistrict?: string | null
      diasporaLocation?: string | null
      denomination?: string
      occupation?: string
      educationLevel?: string
      height?: number
      aboutMe?: string
      interestTags?: string[]
      politicalLeaning?: string | null
    }
    photos: Array<{ url: string; isPrimary: boolean }>
  }
}

export interface UserProfile {
  id: string
  name: string | null
  age: number | null
  homeDistrict: string | null
  diasporaLocation: string | null
  interestTags: string[]
  weekendPreference: string[] | null
  occupation: string | null
  politicalLeaning: string | null
  keralaConnection: string | null
  personalityPrompts: {
    prompt: string
    answer: string
  }[]
}
