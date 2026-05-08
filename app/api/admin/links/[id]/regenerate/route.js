import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUniqueRespondentCode } from '@/lib/referral';

export const runtime = 'nodejs';

export async function PUT(_req, { params }) {
  const { id } = await params;
  const node = await prisma.referralNode.findUnique({ where: { id } });
  if (!node) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Deactivate old code
  await prisma.referralNode.update({ where: { id }, data: { isActive: false } });

  // Generate new code preserving parentId
  const newCode = await generateUniqueRespondentCode(node.lang || 'fr');

  const newNode = await prisma.referralNode.create({
    data: {
      code: newCode,
      nodeType: node.nodeType,
      label: node.label,
      lang: node.lang,
      parentId: node.parentId,
      expiresAt: node.expiresAt,
    },
  });

  return NextResponse.json(newNode);
}
