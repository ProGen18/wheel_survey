import { NextResponse } from 'next/server';
import { validateCode } from '@/lib/referral';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false, reason: 'not_found' });
  }
  const result = await validateCode(body?.code);
  return NextResponse.json(result);
}
