import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildCSVRow, buildExportColumns, buildCSVExportRow } from '@/lib/csv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const columns = buildExportColumns(true);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(buildCSVRow(columns) + '\n'));

      let cursor;
      const batchSize = 100;

      while (true) {
        const batch = await prisma.surveyResponse.findMany({
          where: { completedAt: { not: null } },
          orderBy: { completedAt: 'asc' },
          take: batchSize,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
          include: { node: { include: { parent: { select: { code: true } } } } },
        });

        if (batch.length === 0) break;

        for (const row of batch) {
          const line = buildCSVExportRow(row, row.node.parent?.code || null, columns);
          controller.enqueue(encoder.encode(line + '\n'));
        }

        cursor = batch[batch.length - 1].id;
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="respondents.csv"',
    },
  });
}
