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
  try {
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
    const expected = process.env.ADMIN_PASSWORD_HASH;
    const secret = process.env.ADMIN_SESSION_SECRET;

    if (!expected) {
      console.error('[login] ADMIN_PASSWORD_HASH is not set');
      return NextResponse.json({ error: 'not_configured', missing: 'ADMIN_PASSWORD_HASH' }, { status: 500 });
    }
    if (!secret) {
      console.error('[login] ADMIN_SESSION_SECRET is not set');
      return NextResponse.json({ error: 'not_configured', missing: 'ADMIN_SESSION_SECRET' }, { status: 500 });
    }

    // bcrypt comparison against stored hash
    const valid = await comparePassword(password, expected);
    if (!valid) {
      const remaining = Math.max(0, rl.remaining);
      return NextResponse.json(
        { error: 'invalid_password', remaining },
        { status: 401 }
      );
    }

    const token = signCookie({ role: 'admin' }, secret);

    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 8 * 3600,
    });

    return res;
  } catch (err) {
    console.error('[login] unexpected error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
