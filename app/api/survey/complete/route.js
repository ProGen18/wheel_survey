import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildReferralLink } from '@/lib/referral';

export const runtime = 'nodejs';

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { sessionToken } = body;
  if (!sessionToken) {
    return NextResponse.json({ error: 'missing_token' }, { status: 400 });
  }

  const response = await prisma.surveyResponse.findUnique({
    where: { sessionToken },
    include: { node: true },
  });

  if (!response) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  if (!response.completedAt) {
    await prisma.surveyResponse.update({
      where: { sessionToken },
      data: { completedAt: new Date() },
    });
  }

  return NextResponse.json({
    referralCode: response.node.code,
    referralLink: buildReferralLink(response.node.code),
  });
}
