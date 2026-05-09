import { NextResponse } from 'next/server';
import { getAncestors } from '@/lib/referral';
import { prisma } from '@/lib/prisma';
import { safeJson } from '@/lib/json';

export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  const { id } = await params;

  const response = await prisma.surveyResponse.findUnique({
    where: { nodeId: id },
    include: { node: true },
  });

  if (!response) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const chain = await getAncestors(id);

  return safeJson({
    responder: {
      nodeId: response.nodeId,
      code: response.node.code,
      lang: response.node.lang,
      filterValue: response.filterValue,
      completedAt: response.completedAt,
      answers: {
        filterValue: response.filterValue,
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
        socialMci: response.socialMci,
        symbolic: response.symbolic,
        cognitive: response.cognitive,
        age: response.age,
        gender: response.gender,
        country: response.country,
        citySize: response.citySize,
        occupation: response.occupation,
        income: response.income,
      },
    },
    chain,
  });
}
