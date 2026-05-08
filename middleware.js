import { NextResponse } from 'next/server';
import { verifyCookie, isAdminRoute, isAuthExempt } from './lib/auth-edge.js';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (!isAdminRoute(pathname) || isAuthExempt(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get('admin_session')?.value;
  if (!token) {
    return authFailed(req, pathname);
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return authFailed(req, pathname);
  }

  const payload = await verifyCookie(token, secret);
  if (!payload) {
    return authFailed(req, pathname);
  }

  return NextResponse.next();
}

function authFailed(req, pathname) {
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const loginUrl = new URL('/admin/login', req.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
