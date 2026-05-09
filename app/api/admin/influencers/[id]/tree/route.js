import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeJson } from '@/lib/json';

export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  const { id } = await params;

  const tree = await prisma.$queryRaw`
    WITH RECURSIVE descendants AS (
      SELECT
        n.id, n.code, n."nodeType", n.label, n.lang, n."parentId",
        n."visitCount", n."isActive", n."createdAt", n."expiresAt",
        0 AS depth
      FROM "ReferralNode" n
      WHERE n.id = ${id}
      UNION ALL
      SELECT
        c.id, c.code, c."nodeType", c.label, c.lang, c."parentId",
        c."visitCount", c."isActive", c."createdAt", c."expiresAt",
        d.depth + 1
      FROM "ReferralNode" c
      INNER JOIN descendants d ON c."parentId" = d.id
    ),
    child_counts AS (
      SELECT "parentId", COUNT(*)::int AS cnt
      FROM "ReferralNode"
      WHERE "parentId" IN (SELECT id FROM descendants)
      GROUP BY "parentId"
    )
    SELECT
      d.*,
      COALESCE(cc.cnt, 0)::int AS "directFilleuls",
      sr."completedAt"
    FROM descendants d
    LEFT JOIN child_counts cc ON cc."parentId" = d.id
    LEFT JOIN "SurveyResponse" sr ON sr."nodeId" = d.id
    ORDER BY d.depth ASC, d."createdAt" ASC
  `;

  return safeJson({ tree });
}
