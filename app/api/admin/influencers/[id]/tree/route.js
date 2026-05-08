import { NextResponse } from 'next/server';
import { getDescendants } from '@/lib/referral';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  const { id } = await params;
  const tree = await getDescendants(id);

  // Enrich each node with its direct child count
  const enriched = await Promise.all(
    tree.map(async (n) => {
      const count = await prisma.referralNode.count({ where: { parentId: n.id } });
      const resp = await prisma.surveyResponse.findUnique({
        where: { nodeId: n.id },
        select: { completedAt: true },
      });
      return {
        ...n,
        directFilleuls: count,
        completedAt: resp?.completedAt || null,
      };
    })
  );

  return NextResponse.json({ tree: enriched });
}
