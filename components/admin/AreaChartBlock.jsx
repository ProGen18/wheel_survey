'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CATEGORY_PALETTE, pickColor } from '@/lib/admin-palette';

const TXT = { fr: { empty: 'Aucune donnée' }, en: { empty: 'No data' } };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1b1f2a', color: '#f0e8da', padding: '10px 14px', borderRadius: 8, fontSize: 12, lineHeight: 1.55, boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.stroke || p.color }} />
          <span style={{ opacity: 0.85 }}>{p.name}</span>
          <strong style={{ marginLeft: 'auto', color: '#ffb38a' }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function AreaChartBlock({
  data, xKey = 'day', title, description,
  areas, // optional: [{ dataKey, stroke, name }]
  height = 280, lang = 'fr',
}) {
  const t = TXT[lang] || TXT.fr;
  const series = areas || [{
    dataKey: 'count',
    stroke: CATEGORY_PALETTE[0],
    name: lang === 'fr' ? 'Soumissions' : 'Submissions',
  }];

  // Auto-assign distinct colours when caller didn't specify
  const resolvedSeries = series.map((s, i) => ({
    ...s,
    stroke: s.stroke || pickColor(i, CATEGORY_PALETTE),
  }));

  if (!data || data.length === 0) return (
    <section style={{ marginBottom: '2rem' }}>
      {title && <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1b1f2a', marginBottom: '0.5rem' }}>{title}</h3>}
      <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.85rem' }}>{t.empty}</p>
    </section>
  );

  return (
    <section style={{ marginBottom: '2rem' }}>
      {title && (
        <header style={{ marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1b1f2a', margin: 0, lineHeight: 1.3 }}>{title}</h3>
          {description && <p style={{ fontSize: '0.78rem', color: '#6b6f7d', margin: '0.25rem 0 0', lineHeight: 1.5 }}>{description}</p>}
        </header>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            {resolvedSeries.map((area, i) => (
              <linearGradient key={i} id={`ag-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={area.stroke} stopOpacity={0.32} />
                <stop offset="95%" stopColor={area.stroke} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ece9e1" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#6b6f7d' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6b6f7d' }} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: resolvedSeries[0].stroke, strokeWidth: 1, strokeDasharray: '4 2' }} />
          {resolvedSeries.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />}
          {resolvedSeries.map((area, i) => (
            <Area key={i} type="monotone" dataKey={area.dataKey}
              stroke={area.stroke} strokeWidth={2.2}
              fill={`url(#ag-${i})`} name={area.name || area.dataKey}
              dot={false} activeDot={{ r: 5, fill: area.stroke, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}
