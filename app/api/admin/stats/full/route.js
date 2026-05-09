import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeJson } from '@/lib/json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SCALAR_FIELDS = [
  'filterValue',
  'socialExposure',
  'adoptYear',
  'acquisitionMode',
  'priceCat',
  'adoptDelay',
  'discount',
  'learningTime',
  'tutorials',
  'learningDifficulty',
  'weeklyDistance',
  'mainUse',
  'transportReplace',
  'carAccess',
  'regulationStatus',
  'regulationInfluence',
  'regulationRenounced',
  'socialCircle',
  'groupRides',
  'onlineCommunity',
  'futureLikelihood',
  'gender',
  'country',
  'citySize',
  'occupation',
  'income',
];

function buildWhere(searchParams) {
  const where = { completedAt: { not: null } };
  const profile = searchParams.get('profile');
  if (profile) where.filterValue = profile;
  const lang = searchParams.get('lang');
  if (lang) where.node = { lang };
  const period = parseInt(searchParams.get('period') || '0');
  if (period > 0) {
    const ago = new Date(Date.now() - period * 86400000);
    where.completedAt = { not: null, gte: ago };
  }
  return where;
}

function jsonFreq(rows, field, keyMap) {
  const counts = {};
  rows.forEach((r) => {
    const val = r[field];
    if (val && typeof val === 'object') {
      for (const [k, v] of Object.entries(val)) {
        const bucket = keyMap ? keyMap[k] || k : k;
        if (!counts[bucket]) counts[bucket] = {};
        counts[bucket][v] = (counts[bucket][v] || 0) + 1;
      }
    }
  });
  return counts;
}

function jsonMeans(rows, field) {
  const sums = {};
  const counts = {};
  rows.forEach((r) => {
    const val = r[field];
    if (val && typeof val === 'object') {
      for (const [k, v] of Object.entries(val)) {
        if (typeof v === 'number') {
          sums[k] = (sums[k] || 0) + v;
          counts[k] = (counts[k] || 0) + 1;
        }
      }
    }
  });
  const means = {};
  for (const k of Object.keys(sums)) {
    means[k] = counts[k] > 0 ? Math.round((sums[k] / counts[k]) * 100) / 100 : 0;
  }
  return { means, counts };
}

export async function GET(req) {
  try {
  const where = buildWhere(req.nextUrl.searchParams);

  const groupByPromises = SCALAR_FIELDS.map((field) =>
    prisma.surveyResponse
      .groupBy({ by: [field], where, _count: true })
      .then((rows) => [field, rows])
  );

  const jsonRowsPromise = prisma.surveyResponse.findMany({
    where,
    select: {
      filterValue: true,
      age: true,
      discovChannels: true,
      comparison: true,
      limitingFactors: true,
      protections: true,
      perception: true,
      barriers: true,
      hedonic: true,
      instrumental: true,
      socialMci: true,
      symbolic: true,
      cognitive: true,
    },
  });

  const [N, groupResults, jsonRows] = await Promise.all([
    prisma.surveyResponse.count({ where }),
    Promise.all(groupByPromises),
    jsonRowsPromise,
  ]);

  const scalarMap = Object.fromEntries(groupResults);

  const freq = (field) =>
    (scalarMap[field] || [])
      .filter((r) => r[field] != null)
      .map((r) => ({ key: r[field], label: r[field], count: r._count }))
      .sort((a, b) => b.count - a.count);

  const freqMulti = (field) => {
    const c = {};
    jsonRows.forEach((r) => {
      const v = r[field];
      if (Array.isArray(v)) v.forEach((x) => { c[x] = (c[x] || 0) + 1; });
    });
    return Object.entries(c)
      .map(([k, v]) => ({ key: k, label: k, count: v }))
      .sort((a, b) => b.count - a.count);
  };

  const q1Dist = (scalarMap.filterValue || [])
    .filter((r) => r.filterValue != null)
    .map((r) => ({ name: r.filterValue, value: r._count }))
    .sort((a, b) => b.value - a.value);

  const matrix = (field) => jsonFreq(jsonRows, field);
  const matrixMeans = (field) => jsonMeans(jsonRows, field);

  // Age stats (sorted copy to avoid mutating ages array used elsewhere)
  const ages = jsonRows.map((r) => r.age).filter((a) => a != null);
  const sortedAges = [...ages].sort((a, b) => a - b);
  const ageMedian = sortedAges.length > 0 ? sortedAges[Math.floor(sortedAges.length / 2)] : null;
  const ageMean = ages.length > 0 ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length) : null;

  // MCI by profile for radar comparison
  const mciByProfile = {};
  const profileGroups = { actifs: ['reg', 'occ'], anciens: ['ex'], non_users: ['curious', 'never', 'skip'] };
  const mciFields = ['hedonic', 'instrumental', 'socialMci', 'symbolic', 'cognitive'];
  const mciLabels = { hedonic: 'Hédonique', instrumental: 'Instrumental', socialMci: 'Social', symbolic: 'Symbolique', cognitive: 'Cognitif' };

  for (const [groupName, profiles] of Object.entries(profileGroups)) {
    const groupRows = jsonRows.filter((r) => profiles.includes(r.filterValue));
    const radarData = [];
    for (const field of mciFields) {
      const { means } = jsonMeans(groupRows, field);
      const vals = Object.values(means);
      const avg = vals.length > 0 ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100) / 100 : 0;
      radarData.push({ axis: mciLabels[field], value: avg });
    }
    mciByProfile[groupName] = radarData;
  }

  const mciOverall = mciFields.map((field) => {
    const { means } = jsonMeans(jsonRows, field);
    const vals = Object.values(means);
    const avg = vals.length > 0 ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100) / 100 : 0;
    return { axis: mciLabels[field], value: avg };
  });

  const compMeans = jsonMeans(jsonRows, 'comparison');
  const nonUserRows = jsonRows.filter((r) => ['curious', 'never'].includes(r.filterValue));

  return safeJson({
    N,
    q1Dist,

    discovChannels: freqMulti('discovChannels'),
    socialExposure: freq('socialExposure'),

    adoptYear: freq('adoptYear'),
    acquisitionMode: freq('acquisitionMode'),
    priceCat: freq('priceCat'),
    adoptDelay: freq('adoptDelay'),
    discount: freq('discount'),
    learningTime: freq('learningTime'),
    tutorials: freq('tutorials'),
    learningDifficulty: freq('learningDifficulty'),

    weeklyDistance: freq('weeklyDistance'),
    mainUse: freq('mainUse'),
    transportReplace: freq('transportReplace'),
    carAccess: freq('carAccess'),
    comparisonMatrix: matrix('comparison'),
    comparisonMeans: compMeans,

    limitingFactorsMatrix: matrix('limitingFactors'),
    limitingFactorsMeans: jsonMeans(jsonRows, 'limitingFactors'),
    protections: freqMulti('protections'),
    regulationStatus: freq('regulationStatus'),
    regulationInfluence: freq('regulationInfluence'),
    regulationRenounced: freq('regulationRenounced'),

    socialCircle: freq('socialCircle'),
    groupRides: freq('groupRides'),
    onlineCommunity: freq('onlineCommunity'),

    perceptionMatrix: matrix('perception'),
    perceptionMeans: jsonMeans(nonUserRows, 'perception'),
    futureLikelihood: freq('futureLikelihood'),
    barriers: freqMulti('barriers'),

    mciOverall,
    mciByProfile,
    hedonicMatrix: matrix('hedonic'),
    hedonicMeans: jsonMeans(jsonRows, 'hedonic'),
    instrumentalMatrix: matrix('instrumental'),
    instrumentalMeans: jsonMeans(jsonRows, 'instrumental'),
    socialMatrix: matrix('socialMci'),
    socialMeans: jsonMeans(jsonRows, 'socialMci'),
    symbolicMatrix: matrix('symbolic'),
    symbolicMeans: jsonMeans(jsonRows, 'symbolic'),
    cognitiveMatrix: matrix('cognitive'),
    cognitiveMeans: jsonMeans(jsonRows, 'cognitive'),

    ageStats: {
      ages,
      ageMedian,
      ageMean,
      min: ages.length > 0 ? Math.min(...ages) : null,
      max: ages.length > 0 ? Math.max(...ages) : null,
    },
    gender: freq('gender'),
    countries: freq('country').slice(0, 15),
    citySize: freq('citySize'),
    occupation: freq('occupation'),
    income: freq('income'),

    crossTabChannelsProfile: buildCrossTab(jsonRows, 'discovChannels', true),
    crossTabMciProfile: mciByProfile,
    crossTabAgeProfile: buildCrossTab(jsonRows, 'age', false, true),
  });
  } catch (err) {
    console.error('[stats/full] error:', err);
    return NextResponse.json({ error: 'stats_failed', message: err.message }, { status: 500 });
  }
}

function buildCrossTab(rows, field, multi = false, isAge = false) {
  const profiles = ['reg', 'occ', 'ex', 'curious', 'never', 'skip'];
  const result = [];

  if (multi) {
    const keys = new Set();
    rows.forEach((r) => {
      const v = r[field];
      if (Array.isArray(v)) v.forEach((x) => keys.add(x));
    });
    for (const key of keys) {
      const row = { category: key };
      profiles.forEach((p) => { row[p] = 0; });
      rows.forEach((r) => {
        const v = r[field];
        if (Array.isArray(v) && v.includes(key)) row[r.filterValue] = (row[r.filterValue] || 0) + 1;
      });
      result.push(row);
    }
  } else if (isAge) {
    const buckets = {
      '<20': (a) => a < 20,
      '21-30': (a) => a >= 20 && a < 31,
      '31-40': (a) => a >= 31 && a < 41,
      '41-50': (a) => a >= 41 && a < 51,
      '51+': (a) => a >= 51,
    };
    for (const [label, fn] of Object.entries(buckets)) {
      const row = { category: label };
      profiles.forEach((p) => { row[p] = 0; });
      rows.forEach((r) => { if (r.age != null && fn(r.age)) row[r.filterValue] = (row[r.filterValue] || 0) + 1; });
      result.push(row);
    }
  }

  return result;
}
