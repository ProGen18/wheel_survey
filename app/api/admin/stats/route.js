import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeJson } from '@/lib/json';

export const runtime = 'nodejs';

export async function GET() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 86400000);
  const sevenDaysAgo = new Date(now - 7 * 86400000);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalRespondents,
    todaySubmissions,
    weekSubmissions,
    activeLinks,
    expiredLinks,
    totalRespondentNodes,
    submissionsByDay,
    topInfluencers,
    recentSubmissions,
    q1DistRaw,
  ] = await Promise.all([
    prisma.surveyResponse.count({ where: { completedAt: { not: null } } }),
    prisma.surveyResponse.count({ where: { completedAt: { not: null, gte: today } } }),
    prisma.surveyResponse.count({ where: { completedAt: { not: null, gte: sevenDaysAgo } } }),
    prisma.referralNode.count({
      where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    }),
    prisma.referralNode.count({ where: { NOT: { expiresAt: null }, expiresAt: { lte: now } } }),
    prisma.referralNode.count({ where: { nodeType: 'RESPONDENT' } }),

    // Submissions per day — last 30 days
    prisma.$queryRaw`
      SELECT
        DATE("completedAt") AS day,
        COUNT(*)::int AS count
      FROM "SurveyResponse"
      WHERE "completedAt" IS NOT NULL AND "completedAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("completedAt")
      ORDER BY day ASC
    `,

    // Top 5 influencers by total descendants — single recursive CTE that tags
    // each descendant with its influencer root, then aggregates by root.
    prisma.$queryRaw`
      WITH RECURSIVE descendants AS (
        SELECT c.id, c."parentId" AS root
        FROM "ReferralNode" c
        INNER JOIN "ReferralNode" inf ON c."parentId" = inf.id
        WHERE inf."nodeType" = 'INFLUENCER'
        UNION ALL
        SELECT c.id, d.root
        FROM "ReferralNode" c
        INNER JOIN descendants d ON c."parentId" = d.id
      ),
      totals AS (
        SELECT root, COUNT(*)::int AS total FROM descendants GROUP BY root
      ),
      directs AS (
        SELECT "parentId" AS root, COUNT(*)::int AS cnt
        FROM "ReferralNode"
        GROUP BY "parentId"
      )
      SELECT
        inf.id, inf.code, inf.label,
        COALESCE(directs.cnt, 0)::int AS directs,
        COALESCE(totals.total, 0)::int AS total_descendants
      FROM "ReferralNode" inf
      LEFT JOIN directs ON directs.root = inf.id
      LEFT JOIN totals  ON totals.root  = inf.id
      WHERE inf."nodeType" = 'INFLUENCER'
      ORDER BY total_descendants DESC
      LIMIT 5
    `,

    // 10 most recent submissions
    prisma.surveyResponse.findMany({
      where: { completedAt: { not: null } },
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: { node: { include: { parent: { select: { code: true } } } } },
    }),

    // Global Q1 distribution (all completed responses)
    prisma.surveyResponse.groupBy({
      by: ['filterValue'],
      where: { completedAt: { not: null } },
      _count: true,
    }),
  ]);

  const q1Dist = q1DistRaw
    .filter((r) => r.filterValue != null)
    .map((r) => ({ name: r.filterValue, value: r._count }))
    .sort((a, b) => b.value - a.value);

  // Share rate: % of respondent nodes with at least 1 child
  let shareRate = 0;
  if (totalRespondentNodes > 0) {
    const withChildren = await prisma.referralNode.count({
      where: { nodeType: 'RESPONDENT', children: { some: {} } },
    });
    shareRate = Math.round((withChildren / totalRespondentNodes) * 100);
  }

  return safeJson({
    kpis: {
      totalRespondents,
      todaySubmissions,
      weekSubmissions,
      activeLinks,
      expiredLinks,
      shareRate,
    },
    submissionsByDay: submissionsByDay.map((d) => ({ day: d.day, count: Number(d.count) })),
    topInfluencers: topInfluencers.map((inf) => ({ ...inf, directs: Number(inf.directs), total_descendants: Number(inf.total_descendants) })),
    recentSubmissions: recentSubmissions.map((r) => ({
      code: r.node.code,
      lang: r.node.lang,
      parentCode: r.node.parent?.code || null,
      filterValue: r.filterValue,
      submittedAt: r.completedAt,
      age: r.age,
      country: r.country,
    })),
    q1Dist,
  });
}
