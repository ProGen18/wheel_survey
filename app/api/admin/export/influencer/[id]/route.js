import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDescendants } from '@/lib/referral';
import { buildCSVRow, buildExportColumns, buildCSVExportRow } from '@/lib/csv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const { id } = await params;
  const columns = buildExportColumns(true);

  // Get all descendant IDs
  const tree = await getDescendants(id);
  const ids = tree.map((n) => n.id);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(buildCSVRow(columns) + '\n'));

      // Process in batches
      for (let i = 0; i < ids.length; i += 100) {
        const batch = ids.slice(i, i + 100);
        const responses = await prisma.surveyResponse.findMany({
          where: { nodeId: { in: batch }, completedAt: { not: null } },
          include: { node: { include: { parent: { select: { code: true } } } } },
        });

        for (const row of responses) {
          const line = buildCSVExportRow(row, row.node.parent?.code || null, columns);
          controller.enqueue(encoder.encode(line + '\n'));
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="influencer_filleuls.csv"`,
    },
  });
}
