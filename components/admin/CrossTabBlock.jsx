'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FILTER_VALUE_COLORS, CATEGORY_PALETTE, pickColor } from '@/lib/admin-palette';
import { FILTER_VALUE_LABELS } from '@/lib/admin-labels';

const TXT = { fr: { empty: 'Aucune donnée' }, en: { empty: 'No data' } };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div style={{ background: '#1b1f2a', color: '#f0e8da', padding: '10px 14px', borderRadius: 8, fontSize: 12, lineHeight: 1.55, boxShadow: '0 4px 14px rgba(0,0,0,0.18)', minWidth: 180 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.filter((p) => p.value > 0).map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span style={{ opacity: 0.85 }}>{p.name}</span>
          <strong style={{ marginLeft: 'auto', color: '#ffb38a' }}>{p.value}</strong>
        </div>
      ))}
      {total > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
          <span>Total</span><strong>{total}</strong>
        </div>
      )}
    </div>
  );
}

/**
 * data: [{ category: 'YouTube', reg: 12, occ: 5, ... }]
 * groups: ['reg', 'occ', ...]
 */
export default function CrossTabBlock({ data = [], groups = [], title, description, height = 380, lang = 'fr' }) {
  const t = TXT[lang] || TXT.fr;
  const dict = FILTER_VALUE_LABELS[lang] || FILTER_VALUE_LABELS.fr;

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
        <BarChart data={data} layout="horizontal" margin={{ top: 12, right: 16, left: 0, bottom: 36 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ece9e1" vertical={false} />
          <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#3a4050' }} interval={0} angle={-20} textAnchor="end" height={56} />
          <YAxis tick={{ fontSize: 11, fill: '#6b6f7d' }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(217,77,26,0.04)' }} />
          <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {groups.map((g, i) => (
            <Bar key={g} dataKey={g} stackId="a"
              fill={FILTER_VALUE_COLORS[g] || pickColor(i, CATEGORY_PALETTE)}
              name={dict[g] || g} maxBarSize={48} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
