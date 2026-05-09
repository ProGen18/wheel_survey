'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#d94d1a', '#e87235', '#f0985a', '#f4b880', '#f8d4a8', '#e8d5c4'];

const TXT = { fr: 'Aucune donnée', en: 'No data' };

export default function BarChartBlock({ data, dataKey, xKey, title, bars = [{ dataKey, fill: 'var(--ember, #d94d1a)' }], stacked = false, height = 300, lang = 'fr' }) {
  if (!data || data.length === 0) return <Empty title={title} lang={lang} />;

  return (
    <section style={{ marginBottom: '2rem' }}>
      {title && <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          {bars.map((bar, i) => (
            stacked ? (
              <Bar key={i} dataKey={bar.dataKey} stackId="a" fill={bar.fill || COLORS[i % COLORS.length]} name={bar.name || bar.dataKey} />
            ) : (
              <Bar key={i} dataKey={bar.dataKey} fill={bar.fill || COLORS[i % COLORS.length]} name={bar.name || bar.dataKey}>
                {!stacked && data.map((_, j) => <Cell key={j} fill={COLORS[j % COLORS.length]} />)}
              </Bar>
            )
          ))}
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

function Empty({ title, lang }) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      {title && <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{title}</h3>}
      <p style={{ color: '#999', fontStyle: 'italic' }}>{TXT[lang] || TXT.fr}</p>
    </section>
  );
}
