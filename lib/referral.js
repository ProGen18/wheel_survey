import crypto from 'node:crypto';
import { prisma } from './prisma.js';

const LANG_PREFIX = { fr: 'FR', en: 'EN', ru: 'RU', zh: 'ZH' };
const DEFAULT_EXPIRY_DAYS = parseInt(process.env.REFERRAL_EXPIRY_DAYS || '90', 10);

export function generateRespondentCode(lang = 'fr') {
  const prefix = LANG_PREFIX[lang] || 'FR';
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}${random}`;
}

export async function generateUniqueRespondentCode(lang = 'fr', maxRetries = 6) {
  for (let i = 0; i < maxRetries; i++) {
    const code = generateRespondentCode(lang);
    const exists = await prisma.referralNode.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error('Could not generate unique respondent code after retries');
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function computeExpiresAt(days = DEFAULT_EXPIRY_DAYS) {
  if (!days || days <= 0) return null;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export function isLinkActive(node) {
  if (!node || !node.isActive) return false;
  if (node.expiresAt && new Date(node.expiresAt) < new Date()) return false;
  return true;
}

export async function validateCode(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, reason: 'not_found' };
  }
  const trimmed = code.trim();
  if (!trimmed) return { valid: false, reason: 'not_found' };

  const node = await prisma.referralNode.findUnique({ where: { code: trimmed } });
  if (!node) return { valid: false, reason: 'not_found' };
  if (!node.isActive) return { valid: false, reason: 'inactive' };
  if (node.expiresAt && new Date(node.expiresAt) < new Date()) {
    return { valid: false, reason: 'expired' };
  }
  return { valid: true, parentId: node.id, nodeType: node.nodeType };
}

export async function getDescendants(rootId) {
  return prisma.$queryRaw`
    WITH RECURSIVE descendants AS (
      SELECT
        n.id, n.code, n."nodeType", n.label, n.lang, n."parentId",
        n."visitCount", n."isActive", n."createdAt", n."expiresAt",
        0 AS depth
      FROM "ReferralNode" n
      WHERE n.id = ${rootId}
      UNION ALL
      SELECT
        c.id, c.code, c."nodeType", c.label, c.lang, c."parentId",
        c."visitCount", c."isActive", c."createdAt", c."expiresAt",
        d.depth + 1
      FROM "ReferralNode" c
      INNER JOIN descendants d ON c."parentId" = d.id
    )
    SELECT * FROM descendants ORDER BY depth ASC, "createdAt" ASC
  `;
}

export async function getAncestors(leafId) {
  return prisma.$queryRaw`
    WITH RECURSIVE ancestors AS (
      SELECT
        n.id, n.code, n."nodeType", n.label, n.lang, n."parentId",
        n."createdAt",
        0 AS depth
      FROM "ReferralNode" n
      WHERE n.id = ${leafId}
      UNION ALL
      SELECT
        p.id, p.code, p."nodeType", p.label, p.lang, p."parentId",
        p."createdAt",
        a.depth + 1
      FROM "ReferralNode" p
      INNER JOIN ancestors a ON p.id = a."parentId"
    )
    SELECT * FROM ancestors ORDER BY depth DESC
  `;
}

export function buildReferralLink(code) {
  const base = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  return `${base}/?ref=${encodeURIComponent(code)}`;
}
