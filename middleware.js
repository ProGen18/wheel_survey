import { NextResponse } from 'next/server';
import { verifyCookie, isAdminRoute, isAuthExempt } from './lib/auth-edge.js';
import { checkRateLimit } from './lib/rate-limit.js';

// --- Config ---

const ADMIN_API_LIMIT = { windowMs: 60_000, maxAttempts: 30 };

const ALLOWED_ORIGINS = new Set([
  'http://localhost:8080',
  'http://localhost:3000',
]);

if (process.env.NEXT_PUBLIC_BASE_URL) {
  ALLOWED_ORIGINS.add(process.env.NEXT_PUBLIC_BASE_URL);
}

// --- Helpers (Edge-compatible: no node: imports) ---

function extractIp(req) {
  const direct = req.headers.get('x-nf-client-connection-ip');
  if (direct) return direct;
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

function addSecurityHeaders(res) {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-XSS-Protection', '0');
  if (process.env.NODE_ENV === 'production') {
    res.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }
  return res;
}

// Edge-compatible origin check (headers only, no node:crypto)
function sameOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin) return true; // allow server-to-server / non-browser clients
  return ALLOWED_ORIGINS.has(origin);
}

// --- Middleware ---

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. Rate-limit + origin check for admin API routes (except login)
  if (
    pathname.startsWith('/api/admin/') &&
    pathname !== '/api/admin/auth/login'
  ) {
    const ip = extractIp(req);
    const rl = checkRateLimit(ip, ADMIN_API_LIMIT);
    if (!rl.allowed) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'too_many_requests' }, { status: 429 })
      );
    }
    if (!sameOrigin(req)) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'forbidden' }, { status: 403 })
      );
    }
  }

  // 2. Auth check for admin routes (skip login page + login API)
  if (!isAdminRoute(pathname) || isAuthExempt(pathname)) {
    return addSecurityHeaders(NextResponse.next());
  }

  const token = req.cookies.get('admin_session')?.value;
  if (!token) return authFailed(req, pathname);

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return authFailed(req, pathname);

  const payload = await verifyCookie(token, secret);
  if (!payload) return authFailed(req, pathname);

  return addSecurityHeaders(NextResponse.next());
}

function authFailed(req, pathname) {
  let res;
  if (pathname.startsWith('/api/')) {
    res = NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  } else {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    res = NextResponse.redirect(loginUrl);
  }
  return addSecurityHeaders(res);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
