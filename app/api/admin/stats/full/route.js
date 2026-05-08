import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

async function getN(where) {
  return prisma.surveyResponse.count({ where });
}

async function frequency(where, field, multi = false) {
  if (multi) {
    // JSON array — fetch all and aggregate
    const rows = await prisma.surveyResponse.findMany({
      where,
      select: { [field]: true },
    });
    const counts = {};
    rows.forEach((r) => {
      const val = r[field];
      if (Array.isArray(val)) {
        val.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
      }
    });
    return Object.entries(counts)
      .map(([k, v]) => ({ key: k, label: k, count: v }))
      .sort((a, b) => b.count - a.count);
  }

  const rows = await prisma.$queryRawUnsafe(
    `SELECT "${field}" AS key, COUNT(*)::int AS count FROM "SurveyResponse"
     WHERE "completedAt" IS NOT NULL ${whereConditions(where, ['completedAt'])}
     AND "${field}" IS NOT NULL
     GROUP BY "${field}" ORDER BY count DESC`
  );
  return rows.map((r) => ({ key: r.key, label: r.key, count: r.count }));
}

function whereConditions(where, seen) {
  const clauses = [];
  for (const [k, v] of Object.entries(where)) {
    if (seen?.includes(k)) continue;
    if (k === 'node' && v) {
      for (const [nk, nv] of Object.entries(v)) {
        clauses.push(`"nodeId" IN (SELECT id FROM "ReferralNode" WHERE "${nk}" = '${nv}')`);
      }
    } else if (v && typeof v === 'object' && !(v instanceof Date)) {
      // complex where like { not: null, gte: date }
      if (v.not !== undefined) clauses.push(`"${k}" IS NOT NULL`);
      if (v.gte) clauses.push(`"${k}" >= '${v.gte.toISOString()}'`);
      if (v.lte) clauses.push(`"${k}" <= '${v.lte.toISOString()}'`);
    } else if (v instanceof Date) {
      clauses.push(`"${k}" = '${v.toISOString()}'`);
    } else {
      clauses.push(`"${k}" = '${String(v).replace(/'/g, "''")}'`);
    }
  }
  return clauses.length > 0 ? 'AND ' + clauses.join(' AND ') : '';
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
  const where = buildWhere(req.nextUrl.searchParams);
  const N = await getN(where);

  // Fetch all matching rows for JSON aggregation fields
  const allRows = await prisma.surveyResponse.findMany({
    where,
    select: {
      filterValue: true,
      discovChannels: true,
      socialExposure: true,
      adoptYear: true,
      acquisitionMode: true,
      priceCat: true,
      adoptDelay: true,
      discount: true,
      learningTime: true,
      tutorials: true,
      learningDifficulty: true,
      weeklyDistance: true,
      mainUse: true,
      transportReplace: true,
      carAccess: true,
      comparison: true,
      limitingFactors: true,
      protections: true,
      regulationStatus: true,
      regulationInfluence: true,
      regulationRenounced: true,
      socialCircle: true,
      groupRides: true,
      onlineCommunity: true,
      perception: true,
      futureLikelihood: true,
      barriers: true,
      hedonic: true,
      instrumental: true,
      socialMci: true,
      symbolic: true,
      cognitive: true,
      age: true,
      gender: true,
      country: true,
      citySize: true,
      occupation: true,
      income: true,
    },
  });

  // Q1 routing
  const q1Counts = {};
  allRows.forEach((r) => { q1Counts[r.filterValue] = (q1Counts[r.filterValue] || 0) + 1; });
  const q1Dist = Object.entries(q1Counts).map(([k, v]) => ({ name: k, value: v })).sort((a, b) => b.value - a.value);

  // Helper: simple frequency from allRows
  const freq = (field) => {
    const c = {};
    allRows.forEach((r) => {
      const v = r[field];
      if (v != null) { c[v] = (c[v] || 0) + 1; }
    });
    return Object.entries(c).map(([k, v]) => ({ key: k, label: k, count: v })).sort((a, b) => b.count - a.count);
  };

  const freqMulti = (field) => {
    const c = {};
    allRows.forEach((r) => {
      const v = r[field];
      if (Array.isArray(v)) v.forEach((x) => { c[x] = (c[x] || 0) + 1; });
    });
    return Object.entries(c).map(([k, v]) => ({ key: k, label: k, count: v })).sort((a, b) => b.count - a.count);
  };

  // Likert matrix:
  const matrix = (field) => {
    return jsonFreq(allRows, field);
  };
  const matrixMeans = (field) => {
    return jsonMeans(allRows, field);
  };

  // Age stats
  const ages = allRows.map((r) => r.age).filter((a) => a != null);
  const ageMedian = ages.length > 0 ? ages.sort((a, b) => a - b)[Math.floor(ages.length / 2)] : null;
  const ageMean = ages.length > 0 ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length) : null;

  // MCI by profile for radar comparison
  const mciByProfile = {};
  const profileGroups = { 'actifs': ['reg', 'occ'], 'anciens': ['ex'], 'non_users': ['curious', 'never', 'skip'] };
  const mciFields = ['hedonic', 'instrumental', 'socialMci', 'symbolic', 'cognitive'];
  const mciLabels = { hedonic: 'Hédonique', instrumental: 'Instrumental', socialMci: 'Social', symbolic: 'Symbolique', cognitive: 'Cognitif' };

  for (const [groupName, profiles] of Object.entries(profileGroups)) {
    const groupRows = allRows.filter((r) => profiles.includes(r.filterValue));
    const radarData = [];
    for (const field of mciFields) {
      const { means } = jsonMeans(groupRows, field);
      const avg = Object.values(means).length > 0
        ? Math.round(Object.values(means).reduce((s, v) => s + v, 0) / Object.values(means).length * 100) / 100
        : 0;
      radarData.push({ axis: mciLabels[field], value: avg });
    }
    mciByProfile[groupName] = radarData;
  }

  // Overall MCI
  const mciOverall = [];
  for (const field of mciFields) {
    const { means } = jsonMeans(allRows, field);
    const avg = Object.values(means).length > 0
      ? Math.round(Object.values(means).reduce((s, v) => s + v, 0) / Object.values(means).length * 100) / 100
      : 0;
    mciOverall.push({ axis: mciLabels[field], value: avg });
  }

  // Comparison means
  const compMeans = jsonMeans(allRows, 'comparison');

  // Perception matrix for non-users
  const nonUserRows = allRows.filter((r) => ['curious', 'never'].includes(r.filterValue));

  return NextResponse.json({
    N,
    q1Dist,

    // Section 1
    discovChannels: freqMulti('discovChannels'),
    socialExposure: freq('socialExposure'),

    // Section 2
    adoptYear: freq('adoptYear'),
    acquisitionMode: freq('acquisitionMode'),
    priceCat: freq('priceCat'),
    adoptDelay: freq('adoptDelay'),
    discount: freq('discount'),
    learningTime: freq('learningTime'),
    tutorials: freq('tutorials'),
    learningDifficulty: freq('learningDifficulty'),

    // Section 3
    weeklyDistance: freq('weeklyDistance'),
    mainUse: freq('mainUse'),
    transportReplace: freq('transportReplace'),
    carAccess: freq('carAccess'),
    comparisonMatrix: matrix('comparison'),
    comparisonMeans: compMeans,

    // Section 4
    limitingFactorsMatrix: matrix('limitingFactors'),
    limitingFactorsMeans: jsonMeans(allRows, 'limitingFactors'),
    protections: freqMulti('protections'),
    regulationStatus: freq('regulationStatus'),
    regulationInfluence: freq('regulationInfluence'),
    regulationRenounced: freq('regulationRenounced'),

    // Section 5
    socialCircle: freq('socialCircle'),
    groupRides: freq('groupRides'),
    onlineCommunity: freq('onlineCommunity'),

    // Section 6
    perceptionMatrix: matrix('perception'),
    perceptionMeans: jsonMeans(nonUserRows, 'perception'),
    futureLikelihood: freq('futureLikelihood'),
    barriers: freqMulti('barriers'),

    // Section 7 — MCI
    mciOverall,
    mciByProfile,
    hedonicMatrix: matrix('hedonic'),
    hedonicMeans: jsonMeans(allRows, 'hedonic'),
    instrumentalMatrix: matrix('instrumental'),
    instrumentalMeans: jsonMeans(allRows, 'instrumental'),
    socialMatrix: matrix('socialMci'),
    socialMeans: jsonMeans(allRows, 'socialMci'),
    symbolicMatrix: matrix('symbolic'),
    symbolicMeans: jsonMeans(allRows, 'symbolic'),
    cognitiveMatrix: matrix('cognitive'),
    cognitiveMeans: jsonMeans(allRows, 'cognitive'),

    // Section 8
    ageStats: { ages, ageMedian, ageMean, min: Math.min(...ages) || null, max: Math.max(...ages) || null },
    gender: freq('gender'),
    countries: freq('country').slice(0, 15),
    citySize: freq('citySize'),
    occupation: freq('occupation'),
    income: freq('income'),

    // Section 9 — Cross-tabs
    crossTabChannelsProfile: buildCrossTab(allRows, 'discovChannels', true),
    crossTabMciProfile: mciByProfile,
    crossTabAgeProfile: buildCrossTab(allRows, 'age', false, true),
  });
}

function buildCrossTab(rows, field, multi = false, isAge = false) {
  const profiles = ['reg', 'occ', 'ex', 'curious', 'never', 'skip'];
  const result = [];

  if (multi) {
    // Build unique keys from the data
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
    const buckets = { '<20': (a) => a < 20, '21-30': (a) => a >= 20 && a < 31, '31-40': (a) => a >= 31 && a < 41, '41-50': (a) => a >= 41 && a < 51, '51+': (a) => a >= 51 };
    for (const [label, fn] of Object.entries(buckets)) {
      const row = { category: label };
      profiles.forEach((p) => { row[p] = 0; });
      rows.forEach((r) => { if (r.age != null && fn(r.age)) row[r.filterValue] = (row[r.filterValue] || 0) + 1; });
      result.push(row);
    }
  }

  return result;
}
