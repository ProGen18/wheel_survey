import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const search = (searchParams.get('search') || '').trim();
  const filterValue = searchParams.get('filterValue');
  const lang = searchParams.get('lang');
  const influencerId = searchParams.get('influencerId');

  const where = {};
  if (search) {
    where.OR = [
      { node: { code: { contains: search, mode: 'insensitive' } } },
      { country: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (filterValue) where.filterValue = filterValue;
  if (lang) where.node = { ...(where.node || {}), lang };

  if (influencerId) {
    // Find all descendant node IDs of this influencer
    const descendants = await prisma.$queryRaw`
      SELECT id FROM "ReferralNode"
      WHERE id IN (
        WITH RECURSIVE d AS (
          SELECT id FROM "ReferralNode" WHERE "parentId" = ${influencerId}
          UNION ALL
          SELECT c.id FROM "ReferralNode" c INNER JOIN d ON c."parentId" = d.id
        )
        SELECT id FROM d
      )
    `;
    const ids = descendants.map((d) => d.id);
    where.nodeId = { in: ids };
  }

  const [items, total] = await Promise.all([
    prisma.surveyResponse.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        node: { include: { parent: { select: { code: true } } } },
      },
    }),
    prisma.surveyResponse.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((r) => ({
      id: r.id,
      nodeId: r.nodeId,
      code: r.node.code,
      lang: r.node.lang,
      filterValue: r.filterValue,
      parentCode: r.node.parent?.code || null,
      country: r.country,
      age: r.age,
      gender: r.gender,
      startedAt: r.startedAt,
      completedAt: r.completedAt,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
