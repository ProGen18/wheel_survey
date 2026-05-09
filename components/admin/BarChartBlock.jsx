'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList, Legend,
} from 'recharts';
import { CATEGORY_PALETTE, pickColor } from '@/lib/admin-palette';

const TXT = {
  fr: { empty: 'Aucune donnée', resp: 'réponse', resps: 'réponses', total: 'Total' },
  en: { empty: 'No data', resp: 'response', resps: 'responses', total: 'Total' },
};

function CustomTooltip({ active, payload, label, total, lang }) {
  if (!active || !payload?.length) return null;
  const t = TXT[lang] || TXT.fr;
  const val = payload[0].value;
  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '—';
  const noun = val > 1 ? t.resps : t.resp;
  return (
    <div style={{ background: '#1b1f2a', color: '#f0e8da', padding: '10px 14px', borderRadius: 8, fontSize: 12, lineHeight: 1.55, boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#ffb38a' }}>{val}</span>
        <span style={{ opacity: 0.75 }}>{noun} · {pct} %</span>
      </div>
    </div>
  );
}

export default function BarChartBlock({
  data, dataKey, xKey, title, description,
  bars = [{ dataKey: dataKey || 'value', fill: CATEGORY_PALETTE[0] }],
  stacked = false, height = 320, lang = 'fr', horizontal = true,
  showPercentage = true,
  palette = CATEGORY_PALETTE,
}) {
  const t = TXT[lang] || TXT.fr;
  if (!data || data.length === 0) return <Empty title={title} lang={lang} />;

  const total = data.reduce((s, d) => s + (d.value ?? d[bars[0]?.dataKey] ?? 0), 0);
  const isMultiBar = bars.length > 1;

  // Pour les barres horizontales les axes sont inversés
  const layout = horizontal && !isMultiBar ? 'vertical' : 'horizontal';

  return (
    <section style={{ marginBottom: '2rem' }}>
      {title && (
        <header style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1b1f2a', margin: 0, lineHeight: 1.3 }}>{title}</h3>
            <span style={{ fontSize: '0.72rem', color: '#9a9d9c', fontVariantNumeric: 'tabular-nums' }}>n = {total}</span>
          </div>
          {description && <p style={{ fontSize: '0.78rem', color: '#6b6f7d', margin: '0.25rem 0 0', lineHeight: 1.5 }}>{description}</p>}
        </header>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 4, right: isMultiBar ? 16 : 56, left: horizontal && !isMultiBar ? 4 : 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ece9e1" horizontal={layout === 'horizontal'} vertical={layout === 'vertical'} />

          {layout === 'vertical' ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b6f7d' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey={xKey} tick={{ fontSize: 11, fill: '#3a4050' }} tickLine={false} axisLine={false} width={150} interval={0} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#3a4050' }} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: '#6b6f7d' }} tickLine={false} axisLine={false} allowDecimals={false} />
            </>
          )}

          <Tooltip
            content={isMultiBar ? undefined : <CustomTooltip total={total} lang={lang} />}
            cursor={{ fill: 'rgba(217,77,26,0.06)' }}
          />
          {isMultiBar && <Legend wrapperStyle={{ fontSize: 12 }} />}

          {bars.map((bar, i) =>
            stacked ? (
              <Bar key={i} dataKey={bar.dataKey} stackId="a" fill={bar.fill || pickColor(i, palette)}
                name={bar.name || bar.dataKey} radius={i === bars.length - 1 ? [3, 3, 0, 0] : 0} />
            ) : (
              <Bar key={i} dataKey={bar.dataKey} fill={bar.fill || pickColor(i, palette)}
                name={bar.name || bar.dataKey}
                radius={layout === 'vertical' ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                maxBarSize={36}
              >
                {!isMultiBar && data.map((_, j) => <Cell key={j} fill={pickColor(j, palette)} />)}
                {!isMultiBar && showPercentage && (
                  <LabelList
                    dataKey={bar.dataKey}
                    position={layout === 'vertical' ? 'right' : 'top'}
                    formatter={(v) => total > 0 ? `${v} (${((v / total) * 100).toFixed(0)}%)` : v}
                    style={{ fontSize: 10.5, fill: '#3a4050', fontWeight: 600 }}
                  />
                )}
              </Bar>
            )
          )}
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

function Empty({ title, lang }) {
  const t = TXT[lang] || TXT.fr;
  return (
    <section style={{ marginBottom: '2rem' }}>
      {title && <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1b1f2a', marginBottom: '0.5rem' }}>{title}</h3>}
      <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.85rem' }}>{t.empty}</p>
    </section>
  );
}
