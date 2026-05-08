'use client';
import React from 'react';

export default function StatsCard({ title, value, subtitle, delta }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '10px',
      padding: '1.25rem',
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
      border: '1px solid #e8e5df',
    }}>
      <div style={{ fontSize: '0.8rem', color: '#777', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {title}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)' }}>
        {value}
        {delta != null && (
          <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem', color: delta > 0 ? '#16a34a' : '#dc2626' }}>
            {delta > 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      {subtitle && <div style={{ fontSize: '0.78rem', color: '#999', marginTop: '0.2rem' }}>{subtitle}</div>}
    </div>
  );
}
