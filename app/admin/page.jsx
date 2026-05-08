'use client';
import React, { useEffect, useState } from 'react';
import StatsCard from '@/components/admin/StatsCard';
import AreaChartBlock from '@/components/admin/AreaChartBlock';
import DonutBlock from '@/components/admin/DonutBlock';
import BarChartBlock from '@/components/admin/BarChartBlock';

const FILTER_LABELS = {
  reg: 'Réguliers', occ: 'Occasionnels', ex: 'Anciens',
  curious: 'Curieux', never: 'Jamais', skip: 'Sans réponse',
};

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (!data) return <p>Erreur de chargement des données.</p>;

  const { kpis, submissionsByDay, topInfluencers, recentSubmissions } = data;

  // Build Q1 distribution for donut
  const q1Dist = recentSubmissions.reduce((acc, r) => {
    const key = r.filterValue || 'skip';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const donutData = Object.entries(q1Dist).map(([k, v]) => ({
    name: FILTER_LABELS[k] || k,
    value: v,
  }));

  // Top influencers data for bar chart
  const topInfData = topInfluencers.map((inf) => ({
    name: inf.code,
    directs: inf.directs || 0,
    total_descendants: inf.total_descendants || 0,
  }));

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Vue d'ensemble</h2>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatsCard title="Total répondants" value={kpis.totalRespondents} />
        <StatsCard title="Aujourd'hui" value={kpis.todaySubmissions} subtitle="Soumissions J" />
        <StatsCard title="Cette semaine" value={kpis.weekSubmissions} subtitle="7 derniers jours" />
        <StatsCard title="Liens actifs" value={kpis.activeLinks} />
        <StatsCard title="Liens expirés" value={kpis.expiredLinks} />
        <StatsCard title="Taux de partage" value={`${kpis.shareRate}%`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <AreaChartBlock
            data={(submissionsByDay || []).map((d) => ({ day: String(d.day).slice(0, 10), count: d.count }))}
            xKey="day"
            title="Soumissions / jour (30j)"
            areas={[{ dataKey: 'count', stroke: '#d94d1a', fill: 'rgba(217,77,26,0.2)' }]}
            height={250}
          />
        </div>
        <div>
          <DonutBlock data={donutData} title="Distribution Q1" />
        </div>
      </div>

      <BarChartBlock
        data={topInfData}
        xKey="name"
        dataKey="total_descendants"
        title="Top 5 influenceurs par filleuls totaux"
        bars={[
          { dataKey: 'directs', fill: '#f0985a', name: 'Directs' },
          { dataKey: 'total_descendants', fill: '#d94d1a', name: 'Totaux' },
        ]}
        stacked={false}
        height={280}
      />

      {/* Recent submissions table */}
      <section>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>10 dernières soumissions</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e8e5df' }}>
          <thead>
            <tr style={{ background: '#f8f6f1', textAlign: 'left' }}>
              <th style={th}>Code</th>
              <th style={th}>Langue</th>
              <th style={th}>Parrain</th>
              <th style={th}>Profil</th>
              <th style={th}>Date</th>
              <th style={th}>Âge</th>
              <th style={th}>Pays</th>
            </tr>
          </thead>
          <tbody>
            {recentSubmissions.map((r) => (
              <tr key={r.code} style={{ borderTop: '1px solid #eee' }}>
                <td style={td}><code>{r.code}</code></td>
                <td style={td}>{r.lang?.toUpperCase()}</td>
                <td style={td}>{r.parentCode || '—'}</td>
                <td style={td}>{FILTER_LABELS[r.filterValue] || r.filterValue}</td>
                <td style={td}>{new Date(r.submittedAt).toLocaleDateString('fr-FR')}</td>
                <td style={td}>{r.age || '—'}</td>
                <td style={td}>{r.country || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

const th = { padding: '0.6rem 0.75rem', fontWeight: 600, color: '#555', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.03em' };
const td = { padding: '0.5rem 0.75rem', verticalAlign: 'middle' };
