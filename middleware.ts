import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login' || path === '/register' || path === '/';
  const token = request.cookies.get('auth-token')?.value || '';
  
  // If it's a public path and user is logged in, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  // If it's a protected path and user is not logged in, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // For admin routes
  if (path.startsWith('/admin') && !request.cookies.get('user-role')?.value?.includes('ADMIN')) {
    return NextResponse.redirect(new URL('/unauthorized', request.nextUrl));
  }
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
