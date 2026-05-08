import { NextResponse } from 'next/server';
import { comparePassword, signCookie, checkRateLimit } from '@/lib/auth-node';
import { extractClientIp } from '@/lib/ip';

export const runtime = 'nodejs';

export async function POST(req) {
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
  const hash = process.env.ADMIN_PASSWORD_HASH;

  if (!hash) {
    return NextResponse.json({ error: 'not_configured' }, { status: 500 });
  }

  const valid = await comparePassword(password, hash);
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
