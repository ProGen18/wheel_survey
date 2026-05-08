import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const lang = searchParams.get('lang');

  const where = {};
  if (type) where.nodeType = type;
  if (lang) where.lang = lang;
  if (status) {
    const now = new Date();
    if (status === 'active') {
      where.isActive = true;
      where.OR = [{ expiresAt: null }, { expiresAt: { gt: now } }];
    } else if (status === 'expired') {
      where.NOT = { expiresAt: null };
      where.expiresAt = { lte: now };
    } else if (status === 'revoked') {
      where.isActive = false;
    }
  }

  const [items, total] = await Promise.all([
    prisma.referralNode.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { children: true } },
        parent: { select: { code: true } },
      },
    }),
    prisma.referralNode.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((n) => ({
      id: n.id,
      code: n.code,
      nodeType: n.nodeType,
      lang: n.lang,
      label: n.label,
      parentCode: n.parent?.code || null,
      directFilleuls: n._count.children,
      visitCount: n.visitCount,
      isActive: n.isActive,
      createdAt: n.createdAt,
      expiresAt: n.expiresAt,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
