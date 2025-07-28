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

  // TEMPORARILY DISABLE MIDDLEWARE REDIRECTS FOR DEBUGGING
  // Just log what would happen but don't redirect
  if (!token) {
    if (url.pathname.startsWith('/dashboard')) {
      console.log('WOULD redirect unauthenticated user to sign-in, but allowing for debug');
      // return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
  }

  // If authenticated, don't redirect for now
  if (token &&
    (url.pathname === '/sign-in' ||
     url.pathname === '/sign-up' ||
     url.pathname.startsWith('/verify') ||
     url.pathname === '/')
  ) {
    console.log('WOULD redirect authenticated user to dashboard, but allowing for debug');
    // return NextResponse.redirect(new URL('/dashboard', request.url));
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