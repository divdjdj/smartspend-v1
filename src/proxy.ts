import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthPage = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/signup') || 
    pathname.startsWith('/forgot-password') || 
    pathname.startsWith('/reset-password') || 
    pathname.startsWith('/verify-email');
    
  const isProtectedRoute = 
    pathname.startsWith('/partner') || 
    pathname.startsWith('/admin') ||
    pathname.startsWith('/clients');

  // Redirect authenticated users away from auth pages to their respective dashboard
  if (token && isAuthPage) {
    const role = token.role || 'client';
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    if (role === 'referral_partner') {
      return NextResponse.redirect(new URL('/partner/dashboard', req.url));
    }
    return NextResponse.redirect(new URL('/clients/enquiries', req.url));
  }

  // Redirect unauthenticated users to login page
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Prevent non-admin users from accessing admin routes
  if (pathname.startsWith('/admin') && token?.role !== 'admin') {
    if (token?.role === 'client') {
      return NextResponse.redirect(new URL('/clients/enquiries', req.url));
    }
    return NextResponse.redirect(new URL('/partner/dashboard', req.url));
  }

  // Prevent non-partner users from accessing partner routes
  if (pathname.startsWith('/partner') && token?.role !== 'referral_partner') {
    if (token?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    return NextResponse.redirect(new URL('/clients/enquiries', req.url));
  }

  // Prevent non-client users from accessing client routes
  if (pathname.startsWith('/clients') && token?.role !== 'client') {
    if (token?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    return NextResponse.redirect(new URL('/partner/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/partner/:path*', 
    '/admin/:path*', 
    '/clients/:path*',
    '/login', 
    '/signup', 
    '/forgot-password', 
    '/reset-password', 
    '/verify-email'
  ]
};
