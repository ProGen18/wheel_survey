import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function mapAnswersToDb(answers) {
  return {
    filterValue: answers.filterValue ?? undefined,

    discovChannels: answers.discovChannels ?? undefined,
    socialExposure: answers.socialExposure ?? undefined,

    adoptYear: answers.adoptYear ?? undefined,
    acquisitionMode: answers.acquisitionMode ?? undefined,
    priceCat: answers.priceCat ?? undefined,
    adoptDelay: answers.adoptDelay ?? undefined,
    discount: answers.discount ?? undefined,
    learningTime: answers.learningTime ?? undefined,
    tutorials: answers.tutorials ?? undefined,
    learningDifficulty: answers.learningDifficulty ?? undefined,

    weeklyDistance: answers.weeklyDistance ?? undefined,
    mainUse: answers.mainUse ?? undefined,
    transportReplace: answers.transportReplace ?? undefined,
    carAccess: answers.carAccess ?? undefined,
    comparison: answers.comparison ?? undefined,

    limitingFactors: answers.limitingFactors ?? undefined,
    protections: answers.protections ?? undefined,
    regulationStatus: answers.regulationStatus ?? undefined,
    regulationInfluence: answers.regulationInfluence ?? undefined,
    regulationRenounced: answers.regulationRenounced ?? undefined,

    socialCircle: answers.socialCircle ?? undefined,
    groupRides: answers.groupRides ?? undefined,
    onlineCommunity: answers.onlineCommunity ?? undefined,

    perception: answers.perception ?? undefined,
    futureLikelihood: answers.futureLikelihood ?? undefined,
    barriers: answers.barriers ?? undefined,

    hedonic: answers.hedonic ?? undefined,
    instrumental: answers.instrumental ?? undefined,
    socialMci: answers.socialMci ?? answers.social ?? undefined,
    symbolic: answers.symbolic ?? undefined,
    cognitive: answers.cognitive ?? undefined,

    age: answers.age ?? undefined,
    gender: answers.gender ?? undefined,
    country: answers.country ?? undefined,
    citySize: answers.citySize ?? undefined,
    occupation: answers.occupation ?? undefined,
    income: answers.income ?? undefined,
  };
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { sessionToken, answers, filterValue } = body;
  if (!sessionToken) {
    return NextResponse.json({ error: 'missing_token' }, { status: 400 });
  }

  const response = await prisma.surveyResponse.findUnique({
    where: { sessionToken },
    select: { id: true },
  });

  if (!response) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const dbAnswers = mapAnswersToDb({ ...answers, filterValue });

  const updateData = {};
  for (const [k, v] of Object.entries(dbAnswers)) {
    if (v !== undefined) {
      updateData[k] = v;
    }
  }

  await prisma.surveyResponse.update({
    where: { sessionToken },
    data: updateData,
  });

  return NextResponse.json({ ok: true });
}
