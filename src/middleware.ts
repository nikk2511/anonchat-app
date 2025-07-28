import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  console.log('Middleware check:', {
    path: url.pathname,
    hasToken: !!token,
    username: token?.username || 'none'
  });

  // Skip middleware for API routes (especially NextAuth)
  if (url.pathname.startsWith('/api/')) {
    console.log('Skipping middleware for API route');
    return NextResponse.next();
  }

  // Allow access to home page, auth pages, and public pages when not authenticated
  if (!token) {
    // Only redirect to sign-in if trying to access protected routes (like dashboard)
    if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/settings')) {
      console.log('Redirecting unauthenticated user to sign-in from protected route');
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    // Allow access to home, sign-in, sign-up, verify pages
    console.log('Allowing unauthenticated access to public page');
    return NextResponse.next();
  }

  // If authenticated, redirect from auth pages to dashboard (but allow home page)
  if (token &&
    (url.pathname === '/sign-in' ||
     url.pathname === '/sign-up' ||
     url.pathname.startsWith('/verify'))
  ) {
    console.log('Redirecting authenticated user from auth page to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};