/**
 * Edge-compatible cookie verifier using Web Crypto API.
 * Used by middleware.js (Edge runtime — bcrypt is NOT available here).
 */

async function importKey(secret) {
  const enc = new TextEncoder().encode(secret);
  return crypto.subtle.importKey('raw', enc, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
}

export async function verifyCookie(token, secret) {
  try {
    const [enc, sig] = token.split('.');
    if (!enc || !sig) return null;
    const key = await importKey(secret);
    const sigBytes = Uint8Array.from(atobUrl(sig), (c) => c.charCodeAt(0));
    const data = new TextEncoder().encode(enc);
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, data);
    if (!valid) return null;
    const json = JSON.parse(new TextDecoder().decode(Uint8Array.from(atobUrl(enc), (c) => c.charCodeAt(0))));
    if (json.exp < Date.now()) return null;
    return json;
  } catch {
    return null;
  }
}

function atobUrl(s) {
  return atob(s.replace(/-/g, '+').replace(/_/g, '/'));
}

/** Check if a request path should skip admin auth */
export function isAdminRoute(pathname) {
  return pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
}

export function isAuthExempt(pathname) {
  return pathname === '/admin/login' || pathname === '/api/admin/auth/login';
}
