import { NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req) {
  const guard = guardApi(req, { type: 'survey_get', checkOrigin: false });
  if (guard) return guard;

  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'missing_token' }, { status: 400 });
  }

  const response = await prisma.surveyResponse.findUnique({
    where: { sessionToken: token },
    include: { node: true },
  });

  if (!response) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json({
    filterValue: response.filterValue,
    referralCode: response.node.code,
    nodeId: response.node.id,
    answers: {
      discovChannels: response.discovChannels,
      socialExposure: response.socialExposure,
      adoptYear: response.adoptYear,
      acquisitionMode: response.acquisitionMode,
      priceCat: response.priceCat,
      adoptDelay: response.adoptDelay,
      discount: response.discount,
      learningTime: response.learningTime,
      tutorials: response.tutorials,
      learningDifficulty: response.learningDifficulty,
      weeklyDistance: response.weeklyDistance,
      mainUse: response.mainUse,
      transportReplace: response.transportReplace,
      carAccess: response.carAccess,
      comparison: response.comparison,
      limitingFactors: response.limitingFactors,
      protections: response.protections,
      regulationStatus: response.regulationStatus,
      regulationInfluence: response.regulationInfluence,
      regulationRenounced: response.regulationRenounced,
      socialCircle: response.socialCircle,
      groupRides: response.groupRides,
      onlineCommunity: response.onlineCommunity,
      perception: response.perception,
      futureLikelihood: response.futureLikelihood,
      barriers: response.barriers,
      hedonic: response.hedonic,
      instrumental: response.instrumental,
      social: response.socialMci,
      symbolic: response.symbolic,
      cognitive: response.cognitive,
      age: response.age,
      gender: response.gender,
      country: response.country,
      citySize: response.citySize,
      occupation: response.occupation,
      income: response.income,
    },
  });
}
