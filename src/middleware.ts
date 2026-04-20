import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes - check via cookie/token
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('authjs.session-token') || request.cookies.get('__Secure-authjs.session-token');
    if (!token) {
      return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url));
    }
  }

  // Protected user routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/support/new') || pathname.startsWith('/notifications')) {
    const token = request.cookies.get('authjs.session-token') || request.cookies.get('__Secure-authjs.session-token');
    if (!token) {
      return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/support/new', '/notifications/:path*'],
};
