'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_PALETTE, pickColor } from '@/lib/admin-palette';

const TXT = { fr: { empty: 'Aucune donnée', total: 'Total' }, en: { empty: 'No data', total: 'Total' } };

function CustomTooltip({ active, payload, lang }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: row } = payload[0];
  const total = row._total;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '—';
  return (
    <div style={{ background: '#1b1f2a', color: '#f0e8da', padding: '10px 14px', borderRadius: 8, fontSize: 12, lineHeight: 1.5, boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#ffb38a' }}>{value}</span>
        <span style={{ opacity: 0.75 }}>· {pct} %</span>
      </div>
    </div>
  );
}

export default function DonutBlock({
  data, dataKey = 'value', nameKey = 'name', title, description,
  innerRadius = 64, lang = 'fr',
  palette = CATEGORY_PALETTE,
  colorMap, // optional { [name]: '#hex' } to override per-slice colour
}) {
  const t = TXT[lang] || TXT.fr;
  if (!data || data.length === 0) return (
    <section style={{ marginBottom: '2rem' }}>
      {title && <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1b1f2a', marginBottom: '0.5rem' }}>{title}</h3>}
      <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.85rem' }}>{t.empty}</p>
    </section>
  );

  const total = data.reduce((s, d) => s + (d[dataKey] || 0), 0);
  const enriched = data.map((d, i) => ({
    ...d,
    _total: total,
    _color: (colorMap && colorMap[d[nameKey]]) || pickColor(i, palette),
  }));

  return (
    <section style={{ marginBottom: '2rem' }}>
      {title && (
        <header style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1b1f2a', margin: 0, lineHeight: 1.3 }}>{title}</h3>
            <span style={{ fontSize: '0.72rem', color: '#9a9d9c', fontVariantNumeric: 'tabular-nums' }}>n = {total}</span>
          </div>
          {description && <p style={{ fontSize: '0.78rem', color: '#6b6f7d', margin: '0.25rem 0 0', lineHeight: 1.5 }}>{description}</p>}
        </header>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 240px) 1fr', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={enriched} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={100}
                dataKey={dataKey} nameKey={nameKey} paddingAngle={2} strokeWidth={0}>
                {enriched.map((d, i) => <Cell key={i} fill={d._color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip lang={lang} />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: '1.55rem', fontWeight: 700, color: '#1b1f2a', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{total}</div>
            <div style={{ fontSize: '0.62rem', color: '#6b6f7d', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{t.total}</div>
          </div>
        </div>
        <CustomLegend data={enriched} dataKey={dataKey} nameKey={nameKey} total={total} />
      </div>
    </section>
  );
}

function CustomLegend({ data, dataKey, nameKey, total }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
      {data.map((d, i) => {
        const v = d[dataKey] || 0;
        const pct = total > 0 ? ((v / total) * 100).toFixed(1) : '—';
        return (
          <li key={i} style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto auto', gap: 8, alignItems: 'center', padding: '4px 6px', borderRadius: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d._color, display: 'block' }} />
            <span style={{ color: '#3a4050', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d[nameKey]}>{d[nameKey]}</span>
            <span style={{ color: '#1b1f2a', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
            <span style={{ color: '#9a9d9c', fontVariantNumeric: 'tabular-nums', minWidth: 44, textAlign: 'right' }}>{pct} %</span>
          </li>
        );
      })}
    </ul>
  );
}
