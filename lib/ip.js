import crypto from 'node:crypto';

export function extractClientIp(headers) {
  if (!headers) return null;
  const direct = headers.get?.('x-nf-client-connection-ip');
  if (direct) return direct;
  const fwd = headers.get?.('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = headers.get?.('x-real-ip');
  if (real) return real;
  return null;
}

export function hashIp(ip) {
  if (!ip) return null;
  const salt = process.env.ADMIN_SESSION_SECRET || 'gyroroue-default-salt';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}
