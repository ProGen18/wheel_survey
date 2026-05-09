'use client';
import React from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { COMPARATIVE_COLORS } from '@/lib/admin-palette';

const TXT = {
  fr: { empty: 'Aucune donnée', score: 'Score moyen' },
  en: { empty: 'No data', score: 'Mean score' },
};

function CustomTooltip({ active, payload, label, lang }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1b1f2a', color: '#f0e8da', padding: '10px 14px', borderRadius: 8, fontSize: 12, lineHeight: 1.55, boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.stroke || p.color }} />
          <span style={{ opacity: 0.85 }}>{p.name}</span>
          <strong style={{ marginLeft: 'auto', color: '#ffb38a' }}>{Number(p.value).toFixed(2)}</strong>
        </div>
      ))}
    </div>
  );
}

export default function RadarBlock({ data, comparative, title, description, height = 360, lang = 'fr' }) {
  const t = TXT[lang] || TXT.fr;
  const hasCompare = comparative && comparative.length > 0;
  const viewData = hasCompare ? comparativeToFlat(comparative) : data;

  if (!viewData || viewData.length === 0) return (
    <section style={{ marginBottom: '1.5rem' }}>
      {title && <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1b1f2a', marginBottom: '0.5rem' }}>{title}</h3>}
      <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.85rem' }}>{t.empty}</p>
    </section>
  );

  return (
    <section style={{ marginBottom: '1rem' }}>
      {title && (
        <header style={{ marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1b1f2a', margin: 0, lineHeight: 1.3 }}>{title}</h3>
          {description && <p style={{ fontSize: '0.78rem', color: '#6b6f7d', margin: '0.25rem 0 0', lineHeight: 1.5 }}>{description}</p>}
        </header>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={viewData} margin={{ top: 12, right: 32, bottom: 8, left: 32 }}>
          <PolarGrid stroke="#e8e5df" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: '#3a4050', fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 7]} tick={{ fontSize: 9, fill: '#aaa' }} tickCount={5} />
          <Tooltip content={<CustomTooltip lang={lang} />} />
          {hasCompare ? (
            comparative.map((group, i) => (
              <Radar key={group.name} name={group.name} dataKey={group.name}
                stroke={COMPARATIVE_COLORS[i % COMPARATIVE_COLORS.length]}
                fill={COMPARATIVE_COLORS[i % COMPARATIVE_COLORS.length]}
                fillOpacity={0.16} strokeWidth={2.2}
                dot={{ r: 3, fill: COMPARATIVE_COLORS[i % COMPARATIVE_COLORS.length], strokeWidth: 0 }}
              />
            ))
          ) : (
            <Radar name={t.score} dataKey="value" stroke="#d94d1a" fill="#d94d1a"
              fillOpacity={0.18} strokeWidth={2.2} dot={{ r: 3.5, fill: '#d94d1a', strokeWidth: 0 }} />
          )}
          {hasCompare && <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />}
        </RadarChart>
      </ResponsiveContainer>
    </section>
  );
}

function comparativeToFlat(comparative) {
  if (!comparative[0]) return [];
  return comparative[0].data.map((d) => {
    const row = { axis: d.axis };
    comparative.forEach((g) => {
      const match = g.data.find((dd) => dd.axis === d.axis);
      row[g.name] = match?.value ?? 0;
    });
    return row;
  });
}
