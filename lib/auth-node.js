import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const SESSION_MAX_AGE = 8 * 3600; // 8 hours
const BCRYPT_ROUNDS = 12;

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

// ---- Rate limiter (in-memory — resets on cold start on Netlify Functions) ----

const attempts = new Map();

const RATE_WINDOW = 3600_000; // 1 hour
const MAX_ATTEMPTS = 5;

export function checkRateLimit(ip) {
  if (!ip) return { allowed: true, remaining: MAX_ATTEMPTS };
  const entry = attempts.get(ip);
  const now = Date.now();
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }
  entry.count++;
  const allowed = entry.count <= MAX_ATTEMPTS;
  return { allowed, remaining: Math.max(0, MAX_ATTEMPTS - entry.count) };
}

// ---- Periodic cleanup ----
let cleanupTimer;
if (typeof globalThis !== 'undefined') {
  if (!globalThis.__rateLimitCleanup) {
    globalThis.__rateLimitCleanup = true;
    setInterval(() => {
      const now = Date.now();
      for (const [ip, e] of attempts) {
        if (now > e.resetAt) attempts.delete(ip);
      }
    }, 300_000).unref?.();
  }
}
