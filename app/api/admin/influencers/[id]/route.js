import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeJson } from '@/lib/json';
import { getDescendants } from '@/lib/referral';

export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  const { id } = await params;

  const node = await prisma.referralNode.findUnique({
    where: { id },
    include: { _count: { select: { children: true } } },
  });

  if (!node) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const totalRes = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS total
    FROM "ReferralNode"
    WHERE id IN (
      WITH RECURSIVE d AS (
        SELECT id FROM "ReferralNode" WHERE "parentId" = ${id}
        UNION ALL
        SELECT c.id FROM "ReferralNode" c INNER JOIN d ON c."parentId" = d.id
      )
      SELECT id FROM d
    )
  `;

  // Count completed surveys among descendants
  const completedRes = await prisma.$queryRaw`
    WITH RECURSIVE d AS (
      SELECT id FROM "ReferralNode" WHERE "parentId" = ${id}
      UNION ALL
      SELECT c.id FROM "ReferralNode" c INNER JOIN d ON c."parentId" = d.id
    )
    SELECT COUNT(*)::int AS total
    FROM "SurveyResponse"
    WHERE "nodeId" IN (SELECT id FROM d) AND "completedAt" IS NOT NULL
  `;

  return safeJson({
    ...node,
    directFilleuls: node._count.children,
    totalFilleuls: totalRes?.[0]?.total || 0,
    completedFilleuls: completedRes?.[0]?.total || 0,
  });
}

export async function PUT(req, { params }) {
  const { id } = await params;
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const node = await prisma.referralNode.findUnique({ where: { id } });
  if (!node) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const data = {};
  if (body.label !== undefined) data.label = body.label;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  const updated = await prisma.referralNode.update({ where: { id }, data });
  return NextResponse.json(updated);
}
