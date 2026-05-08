'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AreaChartBlock({ data, xKey = 'day', areas = [{ dataKey: 'count', fill: 'var(--ember, #d94d1a)', stroke: '#d94d1a' }], title, height = 280 }) {
  if (!data || data.length === 0) return <p style={{ color: '#999', fontStyle: 'italic' }}>Aucune donnée</p>;

  return (
    <section style={{ marginBottom: '2rem' }}>
      {title && <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            {areas.map((area, i) => (
              <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={area.stroke || area.fill} stopOpacity={0.3} />
                <stop offset="95%" stopColor={area.stroke || area.fill} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          {areas.map((area, i) => (
            <Area
              key={i}
              type="monotone"
              dataKey={area.dataKey}
              stroke={area.stroke || '#d94d1a'}
              fill={`url(#grad-${i})`}
              name={area.name || area.dataKey}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}
