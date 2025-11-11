import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow access to auth pages and seed-database always
    if (path.startsWith('/auth/') || path === '/seed-database') {
      return NextResponse.next();
    }

    // If not logged in, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // If logged in but onboarding not complete
    if (token.onboardingCompleted === false) {
      // Allow access to onboarding page
      if (path === '/onboarding') {
        return NextResponse.next();
      }
      // Redirect other pages to onboarding
      if (path !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
    }

    // If onboarding complete, allow access
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|auth/).*)',
  ],
};