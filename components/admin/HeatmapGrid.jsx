'use client';
import React from 'react';

/**
 * Pure CSS Grid heatmap.
 * rows: [{ key, label }]
 * cols: [{ key, label }]
 * data: { rowKey: { colKey: count } } — cell values N
 */
export default function HeatmapGrid({ rows = [], cols = [], data = {}, title }) {
  if (rows.length === 0 || cols.length === 0) return <p style={{ color: '#999', fontStyle: 'italic' }}>Aucune donnée</p>;

  // Find max value for intensity scaling
  let maxVal = 0;
  for (const r of rows) {
    for (const c of cols) {
      const v = data[r.key]?.[c.key] || 0;
      if (v > maxVal) maxVal = v;
    }
  }

  const intensity = (val) => {
    if (maxVal === 0 || val === 0) return 'rgba(30,74,71,0.02)';
    const alpha = 0.08 + (val / maxVal) * 0.85;
    return `rgba(30,74,71,${alpha.toFixed(2)})`;
  };

  return (
    <section style={{ marginBottom: '2rem' }}>
      {title && <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>{title}</h3>}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `minmax(120px, auto) repeat(${cols.length}, 1fr)`,
        border: '1px solid #e0dcd4',
        borderRadius: '8px',
        overflow: 'hidden',
        fontSize: '0.82rem',
        background: '#fff',
      }}>
        {/* Header row */}
        <div style={{ ...cell, fontWeight: 600, background: '#f8f6f1', color: '#555' }} />
        {cols.map((c) => (
          <div key={c.key} style={{ ...cell, fontWeight: 600, background: '#f8f6f1', color: '#555', textAlign: 'center' }}>
            {c.label}
          </div>
        ))}

        {/* Data rows */}
        {rows.map((r) => (
          <React.Fragment key={r.key}>
            <div style={{ ...cell, fontWeight: 500, background: '#fafaf9' }}>{r.label}</div>
            {cols.map((c) => {
              const val = data[r.key]?.[c.key] || 0;
              return (
                <div key={c.key} style={{ ...cell, textAlign: 'center', background: intensity(val) }}>
                  {val > 0 ? val : '·'}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

const cell = { padding: '0.5rem 0.6rem', borderRight: '1px solid #eee', borderBottom: '1px solid #eee' };
