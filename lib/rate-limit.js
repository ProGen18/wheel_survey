const attempts = new Map();

const CLEANUP_INTERVAL = 300_000; // 5 min

// ---- Periodic cleanup ----
let cleanupTimer;
if (typeof globalThis !== 'undefined') {
  if (!globalThis.__rateLimitCleanupV2) {
    globalThis.__rateLimitCleanupV2 = true;
    setInterval(() => {
      const now = Date.now();
      for (const [key, e] of attempts) {
        if (now > e.resetAt) attempts.delete(key);
      }
    }, CLEANUP_INTERVAL).unref?.();
  }
}

/**
 * @param {string} ip
 * @param {{ windowMs?: number, maxAttempts?: number }} opts
 * @returns {{ allowed: boolean, remaining: number }}
 */
export function checkRateLimit(ip, opts = {}) {
  const { windowMs = 60_000, maxAttempts = 10 } = opts;

  if (!ip) return { allowed: true, remaining: maxAttempts };

  const key = `${ip}::${windowMs}::${maxAttempts}`;
  const entry = attempts.get(key);
  const now = Date.now();

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  entry.count++;
  const allowed = entry.count <= maxAttempts;
  return { allowed, remaining: Math.max(0, maxAttempts - entry.count) };
}
