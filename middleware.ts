import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Public paths that don't require onboarding
    const publicPaths = ['/auth/', '/api/auth/', '/api/register']
    const isPublicPath = publicPaths.some(p => path.startsWith(p))

    if (isPublicPath) {
      return NextResponse.next()
    }

    // Check if user has completed onboarding
    if (token && !token.onboardingCompleted) {
      // Allow access to onboarding page and its API
      if (path.startsWith('/onboarding') || path.startsWith('/api/onboarding')) {
        return NextResponse.next()
      }

      // Redirect all other pages to onboarding
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
