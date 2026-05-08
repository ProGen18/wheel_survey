import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Top 5 influencers by total descendants
    prisma.$queryRaw`
      WITH influencer_filleuls AS (
        SELECT rn.id, rn.code, rn.label,
          (SELECT COUNT(*) FROM "ReferralNode" c
           WHERE c."parentId" = rn.id) AS directs,
          (SELECT COUNT(*) FROM "ReferralNode"
           WHERE id IN (
             WITH RECURSIVE d AS (
               SELECT id FROM "ReferralNode" WHERE "parentId" = rn.id
               UNION ALL
               SELECT c.id FROM "ReferralNode" c INNER JOIN d ON c."parentId" = d.id
             )
             SELECT id FROM d
           )) AS total_descendants
        FROM "ReferralNode" rn
        WHERE rn."nodeType" = 'INFLUENCER'
      )
      SELECT * FROM influencer_filleuls
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
  ]);

  // Share rate: % of respondent nodes with at least 1 child
  let shareRate = 0;
  if (totalRespondentNodes > 0) {
    const withChildren = await prisma.referralNode.count({
      where: { nodeType: 'RESPONDENT', children: { some: {} } },
    });
    shareRate = Math.round((withChildren / totalRespondentNodes) * 100);
  }

  return NextResponse.json({
    kpis: {
      totalRespondents,
      todaySubmissions,
      weekSubmissions,
      activeLinks,
      expiredLinks,
      shareRate,
    },
    submissionsByDay,
    topInfluencers,
    recentSubmissions: recentSubmissions.map((r) => ({
      code: r.node.code,
      lang: r.node.lang,
      parentCode: r.node.parent?.code || null,
      filterValue: r.filterValue,
      submittedAt: r.completedAt,
      age: r.age,
      country: r.country,
    })),
  });
}
