'use client';
import React from 'react';

const TXT = {
  fr: { empty: 'Aucune donnée', total: 'Total' },
  en: { empty: 'No data', total: 'Total' },
};

/**
 * Pure CSS-Grid heatmap.
 * rows: [{ key, label }]
 * cols: [{ key, label }]
 * data: { rowKey: { colKey: count } }
 *
 * Visual goal: each row reads as a horizontal density gradient — darker cell ≡
 * more votes on that rating. We add a per-row total column to anchor scale.
 */
export default function HeatmapGrid({
  rows = [], cols = [], data = {}, title, description, lang = 'fr',
  // 'sequential' (orange) for intensity scales, 'teal' for agree/disagree
  scheme = 'teal',
}) {
  const t = TXT[lang] || TXT.fr;
  if (rows.length === 0 || cols.length === 0) return <p style={{ color: '#999', fontStyle: 'italic' }}>{t.empty}</p>;

  // Normalise per-row so that within a question the strongest category pops, not the row with most respondents.
  const rowMaxes = {};
  let grandMax = 0;
  for (const r of rows) {
    let m = 0;
    for (const c of cols) {
      const v = data[r.key]?.[c.key] || 0;
      if (v > m) m = v;
      if (v > grandMax) grandMax = v;
    }
    rowMaxes[r.key] = m;
  }

  // Per-cell shade: blend white → accent based on row-max
  const baseRGB = scheme === 'sequential' ? [217, 77, 26] : [30, 74, 71];
  const intensity = (val, rowMax) => {
    if (val === 0) return '#fafaf8';
    const ratio = rowMax > 0 ? val / rowMax : 0;
    const alpha = 0.10 + ratio * 0.78;
    return `rgba(${baseRGB[0]}, ${baseRGB[1]}, ${baseRGB[2]}, ${alpha.toFixed(2)})`;
  };
  const textColor = (val, rowMax) => {
    if (val === 0) return '#bdbab2';
    const ratio = rowMax > 0 ? val / rowMax : 0;
    return ratio > 0.55 ? '#fff' : '#1b1f2a';
  };

  // Per-row total
  const rowTotals = {};
  for (const r of rows) {
    let s = 0;
    for (const c of cols) s += data[r.key]?.[c.key] || 0;
    rowTotals[r.key] = s;
  }

  return (
    <section style={{ marginBottom: '2rem' }}>
      {title && (
        <header style={{ marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1b1f2a', margin: 0, lineHeight: 1.3 }}>{title}</h3>
          {description && <p style={{ fontSize: '0.78rem', color: '#6b6f7d', margin: '0.25rem 0 0', lineHeight: 1.5 }}>{description}</p>}
        </header>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `minmax(160px, 1.6fr) repeat(${cols.length}, minmax(0, 1fr)) 56px`,
        border: '1px solid #e8e5df',
        borderRadius: 10,
        overflow: 'hidden',
        fontSize: '0.78rem',
        background: '#fff',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {/* Header */}
        <div style={{ ...cell, fontWeight: 600, background: '#f8f6f1', color: '#6b6f7d' }} />
        {cols.map((c) => (
          <div key={c.key} style={{ ...cell, fontWeight: 600, background: '#f8f6f1', color: '#3a4050', textAlign: 'center', whiteSpace: 'normal', lineHeight: 1.25, fontSize: '0.72rem' }}>
            {c.label}
          </div>
        ))}
        <div style={{ ...cell, fontWeight: 600, background: '#f8f6f1', color: '#6b6f7d', textAlign: 'center', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.total}</div>

        {/* Data rows */}
        {rows.map((r) => (
          <React.Fragment key={r.key}>
            <div style={{ ...cell, fontWeight: 600, background: '#fafaf9', color: '#1b1f2a', borderRight: '1px solid #ece9e1' }}>{r.label}</div>
            {cols.map((c) => {
              const val = data[r.key]?.[c.key] || 0;
              const rowMax = rowMaxes[r.key];
              return (
                <div key={c.key} title={`${r.label} · ${c.label}: ${val}`}
                  style={{ ...cell, textAlign: 'center', background: intensity(val, rowMax), color: textColor(val, rowMax), fontWeight: val === rowMax && val > 0 ? 700 : 500 }}>
                  {val > 0 ? val : '·'}
                </div>
              );
            })}
            <div style={{ ...cell, textAlign: 'center', background: '#fafaf9', color: '#6b6f7d', fontWeight: 600 }}>{rowTotals[r.key]}</div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

const cell = { padding: '0.55rem 0.6rem', borderBottom: '1px solid #ece9e1' };
