import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { checkRateLimit as _checkRateLimit } from '@/lib/rate-limit';

const SESSION_MAX_AGE = 8 * 3600; // 8 hours
const BCRYPT_ROUNDS = 12;
const AUTH_RATE_LIMIT = { windowMs: 3600_000, maxAttempts: 5 }; // 1h, 5 attempts

// ---- Password ----

export function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function comparePassword(plain, hash) {
  if (!plain || !hash) return false;
  return bcrypt.compare(plain, hash);
}

// ---- Cookie signing (Node runtime — uses node:crypto) ----

export function signCookie(payload, secret) {
  const now = Date.now();
  const data = JSON.stringify({ ...payload, iat: now, exp: now + SESSION_MAX_AGE * 1000 });
  const enc = Buffer.from(data, 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(enc).digest('base64url');
  return `${enc}.${sig}`;
}

export function verifyCookieNode(token, secret) {
  try {
    const [enc, sig] = token.split('.');
    if (!enc || !sig) return null;
    const expected = crypto.createHmac('sha256', secret).update(enc).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const data = JSON.parse(Buffer.from(enc, 'base64url').toString('utf-8'));
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function checkRateLimit(ip) {
  return _checkRateLimit(ip, AUTH_RATE_LIMIT);
}
