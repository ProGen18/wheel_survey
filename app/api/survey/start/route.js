import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUniqueRespondentCode, generateSessionToken, computeExpiresAt, buildReferralLink, validateCode } from '@/lib/referral';
import { extractClientIp, hashIp } from '@/lib/ip';

export const runtime = 'nodejs';

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { lang = 'fr', parentCode, filterValue, userAgent } = body;

  let parentId = null;
  if (parentCode) {
    const validation = await validateCode(parentCode);
    if (validation.valid) {
      parentId = validation.parentId;
    }
  }

  const code = await generateUniqueRespondentCode(lang);
  const sessionToken = generateSessionToken();
  const expiresAt = computeExpiresAt();

  const ip = extractClientIp(req.headers);
  const ipH = hashIp(ip);

  const node = await prisma.referralNode.create({
    data: {
      code,
      nodeType: 'RESPONDENT',
      lang,
      parentId,
      expiresAt,
    },
  });

  await prisma.surveyResponse.create({
    data: {
      nodeId: node.id,
      sessionToken,
      filterValue: filterValue || null,
      userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 512) : null,
      ipHash: ipH,
    },
  });

  return NextResponse.json({
    sessionToken,
    referralCode: code,
    referralLink: buildReferralLink(code),
    nodeId: node.id,
  }, { status: 201 });
}
