import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const search = (searchParams.get('search') || '').trim();

  const where = { nodeType: 'INFLUENCER' };
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { label: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.referralNode.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { children: true } },
      },
    }),
    prisma.referralNode.count({ where }),
  ]);

  // Enrich with total descendants
  const enriched = await Promise.all(
    items.map(async (inf) => {
      const result = await prisma.$queryRaw`
        SELECT COUNT(*)::int AS total
        FROM "ReferralNode"
        WHERE id IN (
          WITH RECURSIVE d AS (
            SELECT id FROM "ReferralNode" WHERE "parentId" = ${inf.id}
            UNION ALL
            SELECT c.id FROM "ReferralNode" c INNER JOIN d ON c."parentId" = d.id
          )
          SELECT id FROM d
        )
      `;
      return {
        id: inf.id,
        code: inf.code,
        label: inf.label,
        lang: inf.lang,
        isActive: inf.isActive,
        visitCount: inf.visitCount,
        createdAt: inf.createdAt,
        expiresAt: inf.expiresAt,
        directFilleuls: inf._count.children,
        totalFilleuls: result?.[0]?.total || 0,
      };
    })
  );

  return NextResponse.json({
    items: enriched,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { code, label, expiresAt } = body;
  if (!code || typeof code !== 'string' || !code.trim()) {
    return NextResponse.json({ error: 'code_required' }, { status: 400 });
  }

  const existing = await prisma.referralNode.findUnique({ where: { code: code.trim() } });
  if (existing) {
    return NextResponse.json({ error: 'code_exists' }, { status: 409 });
  }

  const node = await prisma.referralNode.create({
    data: {
      code: code.trim(),
      nodeType: 'INFLUENCER',
      label: typeof label === 'string' ? label.trim() || null : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json(node, { status: 201 });
}
