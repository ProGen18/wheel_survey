import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { extractClientIp } from '@/lib/ip';

const LIMITS = {
  survey_post: { windowMs: 60_000, maxAttempts: 10 },
  survey_get:  { windowMs: 60_000, maxAttempts: 30 },
  ref_post:    { windowMs: 60_000, maxAttempts: 10 },
  visit_post:  { windowMs: 60_000, maxAttempts: 20 },
};

const ALLOWED_ORIGINS = new Set([
  'http://localhost:8080',
  'http://localhost:3000',
]);

if (process.env.NEXT_PUBLIC_BASE_URL) {
  ALLOWED_ORIGINS.add(process.env.NEXT_PUBLIC_BASE_URL);
}

/**
 * Vérifie le rate limit et l'origine pour les routes API publiques.
 * @param {Request} req
 * @param {{ type: keyof typeof LIMITS, checkOrigin?: boolean }} opts
 * @returns {null | NextResponse} null si OK, sinon la réponse d'erreur à retourner
 */
export function guardApi(req, opts = {}) {
  const { type = 'survey_post', checkOrigin = true } = opts;
  const ip = extractClientIp(req.headers);

  // Rate limit
  const limit = LIMITS[type] || LIMITS.survey_post;
  const rl = checkRateLimit(ip, limit);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'too_many_requests', retryAfter: `${Math.ceil(limit.windowMs / 1000)}s` },
      { status: 429 }
    );
  }

  // Origin check (POST only, skip GET)
  if (checkOrigin && req.method === 'POST') {
    const origin = req.headers.get('origin');
    if (!origin) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    // Accepte les requêtes same-origin (navigateur → même hôte que l'API)
    const host = req.headers.get('host');
    const isSameOrigin = host && (
      origin === `https://${host}` || origin === `http://${host}`
    );
    if (!isSameOrigin && !ALLOWED_ORIGINS.has(origin)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
  }

  return null;
}
