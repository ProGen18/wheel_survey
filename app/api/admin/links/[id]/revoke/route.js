import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PUT(_req, { params }) {
  const { id } = await params;
  await prisma.referralNode.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
