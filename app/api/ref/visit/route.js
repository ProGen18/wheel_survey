import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { code } = await req.json();
    if (typeof code === 'string' && code.trim().length > 0) {
      await prisma.referralNode.updateMany({
        where: { code: code.trim() },
        data: { visitCount: { increment: 1 } },
      });
    }
  } catch {
    // silent — visit tracking is fire-and-forget
  }
  return NextResponse.json({});
}
