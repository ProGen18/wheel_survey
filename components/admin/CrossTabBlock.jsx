'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TXT = { fr: 'Aucune donnée', en: 'No data' };

/**
 * data: [{ category: 'YouTube', reg: 12, occ: 5, ... }, ...]
 * groups: ['reg', 'occ', ...]
 */
export default function CrossTabBlock({ data = [], groups = [], title, height = 350, lang = 'fr' }) {
  if (!data || data.length === 0) return <p style={{ color: '#999', fontStyle: 'italic' }}>{TXT[lang] || TXT.fr}</p>;
  const COLORS = ['#d94d1a', '#e87235', '#f0985a', '#1e4a47', '#8b5cf6', '#3b82f6', '#f59e0b'];

  return (
    <section style={{ marginBottom: '2rem' }}>
      {title && <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="category" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {groups.map((g, i) => (
            <Bar key={g} dataKey={g} fill={COLORS[i % COLORS.length]} name={g} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
