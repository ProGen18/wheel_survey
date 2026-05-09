import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { signCookie, checkRateLimit, comparePassword } from '@/lib/auth-node';
import { extractClientIp } from '@/lib/ip';

export const runtime = 'nodejs';

function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

// GET: sets a CSRF token cookie for double-submit protection.
// The client reads this cookie and sends its value in X-CSRF-Token header on POST.
export async function GET() {
  const token = generateCsrfToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set('csrf_token', token, {
    httpOnly: false, // JS must be able to read it
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600,
  });
  return res;
}

export async function POST(req) {
  // CSRF double-submit check
  const csrfCookie = req.cookies.get('csrf_token')?.value;
  const csrfHeader = req.headers.get('x-csrf-token');
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return NextResponse.json({ error: 'csrf_invalid' }, { status: 403 });
  }

  // Rate limit
  const ip = extractClientIp(req.headers);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'too_many_attempts', retryAfter: '1h' },
      { status: 429 }
    );
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { password } = body;
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json({ error: 'not_configured' }, { status: 500 });
  }

  // bcrypt comparison against stored hash (no plaintext comparison)
  const valid = await comparePassword(password, expected);
  if (!valid) {
    const remaining = Math.max(0, rl.remaining);
    return NextResponse.json(
      { error: 'invalid_password', remaining },
      { status: 401 }
    );
  }

  const token = signCookie({ role: 'admin' }, process.env.ADMIN_SESSION_SECRET);

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 8 * 3600,
  });

  return res;
}
