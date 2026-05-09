import { NextResponse } from 'next/server';
import { guardApi } from '@/lib/api-guard';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Fields that expect String in the DB but the frontend sends as numeric index (single questions)
const STR_FIELDS = [
  'socialExposure', 'acquisitionMode', 'priceCat', 'adoptDelay', 'discount',
  'learningTime', 'tutorials', 'weeklyDistance', 'mainUse', 'transportReplace',
  'carAccess', 'regulationStatus', 'regulationInfluence', 'regulationRenounced',
  'socialCircle', 'groupRides', 'onlineCommunity', 'futureLikelihood',
  'gender', 'citySize', 'occupation', 'income',
];

function coerce(v, field) {
  if (v === undefined) return undefined;
  if (STR_FIELDS.includes(field) && typeof v === 'number') return String(v);
  return v;
}

function mapAnswersToDb(answers) {
  const raw = {
    filterValue: answers.filterValue,
    discovChannels: answers.discovChannels,
    socialExposure: answers.socialExposure,
    adoptYear: answers.adoptYear,
    acquisitionMode: answers.acquisitionMode,
    priceCat: answers.priceCat,
    adoptDelay: answers.adoptDelay,
    discount: answers.discount,
    learningTime: answers.learningTime,
    tutorials: answers.tutorials,
    learningDifficulty: answers.learningDifficulty,
    weeklyDistance: answers.weeklyDistance,
    mainUse: answers.mainUse,
    transportReplace: answers.transportReplace,
    carAccess: answers.carAccess,
    comparison: answers.comparison,
    limitingFactors: answers.limitingFactors,
    protections: answers.protections,
    regulationStatus: answers.regulationStatus,
    regulationInfluence: answers.regulationInfluence,
    regulationRenounced: answers.regulationRenounced,
    socialCircle: answers.socialCircle,
    groupRides: answers.groupRides,
    onlineCommunity: answers.onlineCommunity,
    perception: answers.perception,
    futureLikelihood: answers.futureLikelihood,
    barriers: answers.barriers,
    hedonic: answers.hedonic,
    instrumental: answers.instrumental,
    socialMci: answers.socialMci ?? answers.social,
    symbolic: answers.symbolic,
    cognitive: answers.cognitive,
    age: answers.age,
    gender: answers.gender,
    country: answers.country,
    citySize: answers.citySize,
    occupation: answers.occupation,
    income: answers.income,
  };
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v !== undefined) out[k] = coerce(v, k);
  }
  return out;
}

export async function POST(req) {
  const guard = guardApi(req, { type: 'survey_post' });
  if (guard) return guard;

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
