import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role?: string
    onboardingCompleted?: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: string
      onboardingCompleted?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: string
    onboardingCompleted?: boolean
  }
}
