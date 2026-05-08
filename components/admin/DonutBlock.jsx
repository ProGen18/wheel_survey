'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#d94d1a', '#e87235', '#f0985a', '#1e4a47', '#8b5cf6', '#3b82f6', '#f59e0b'];

export default function DonutBlock({ data, dataKey = 'value', nameKey = 'name', title, innerRadius = 55 }) {
  if (!data || data.length === 0) return <p style={{ color: '#999', fontStyle: 'italic' }}>Aucune donnée</p>;

  return (
    <section style={{ marginBottom: '2rem' }}>
      {title && <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={100} dataKey={dataKey} nameKey={nameKey} paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </section>
  );
}
