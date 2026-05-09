import { NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { validateCode } from '@/lib/referral';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const guard = guardApi(req, { type: 'ref_post' });
  if (guard) return guard;

  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false, reason: 'not_found' });
  }
  const result = await validateCode(body?.code);
  return NextResponse.json(result);
}
