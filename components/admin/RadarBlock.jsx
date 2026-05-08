'use client';
import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

/**
 * data: [{ axis: 'Hédonique', value: 3.2 }, ...]
 * comparative: [{ name: 'Actifs', data: [{ axis: '...', value: ... }] }, { name: 'Non-users', data: [...] }]
 */
export default function RadarBlock({ data, comparative, title, height = 350 }) {
  const hasCompare = comparative && comparative.length > 0;
  const viewData = hasCompare ? comparativeToFlat(comparative) : data;

  if (!viewData || viewData.length === 0) return <p style={{ color: '#999', fontStyle: 'italic' }}>Aucune donnée</p>;

  return (
    <section style={{ marginBottom: '2rem' }}>
      {title && <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={viewData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 10 }} />
          {hasCompare ? (
            comparative.map((group, i) => (
              <Radar
                key={group.name}
                name={group.name}
                dataKey={group.name}
                data={group.data.map((d) => ({ ...d, [group.name]: d.value }))}
                stroke={COLORS[i]}
                fill={COLORS[i]}
                fillOpacity={0.15}
              />
            ))
          ) : (
            <Radar name="Score" dataKey="value" stroke="#d94d1a" fill="#d94d1a" fillOpacity={0.2} />
          )}
          {hasCompare && <Legend />}
        </RadarChart>
      </ResponsiveContainer>
    </section>
  );
}

const COLORS = ['#d94d1a', '#1e4a47', '#8b5cf6'];

function comparativeToFlat(comparative) {
  if (!comparative[0]) return [];
  return comparative[0].data.map((d) => {
    const row = { axis: d.axis };
    comparative.forEach((g) => {
      const match = g.data.find((dd) => dd.axis === d.axis);
      row[g.name] = match?.value || 0;
    });
    return row;
  });
}
