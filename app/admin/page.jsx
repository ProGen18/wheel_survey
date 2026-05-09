'use client';
import React, { useEffect, useState } from 'react';
import { useAdminLang } from './layout';
import StatsCard from '@/components/admin/StatsCard';
import AreaChartBlock from '@/components/admin/AreaChartBlock';
import DonutBlock from '@/components/admin/DonutBlock';
import BarChartBlock from '@/components/admin/BarChartBlock';

const T = {
  fr: {
    overview: "Vue d'ensemble",
    totalRespondents: 'Total répondants',
    today: "Aujourd'hui",
    thisWeek: 'Cette semaine',
    activeLinks: 'Liens actifs',
    expiredLinks: 'Liens expirés',
    shareRate: 'Taux de partage',
    submissionsToday: 'Soumissions J',
    last7Days: '7 derniers jours',
    submissionsPerDay: 'Soumissions / jour (30j)',
    q1Distribution: 'Distribution Q1',
    top5: 'Top 5 influenceurs par filleuls totaux',
    last10: '10 dernières soumissions',
    thCode: 'Code',
    thLang: 'Langue',
    thReferrer: 'Parrain',
    thProfile: 'Profil',
    thDate: 'Date',
    thAge: 'Âge',
    thCountry: 'Pays',
    loading: 'Chargement...',
    error: 'Erreur de chargement des données.',
    directs: 'Directs',
    total: 'Totaux',
  },
  en: {
    overview: 'Overview',
    totalRespondents: 'Total respondents',
    today: 'Today',
    thisWeek: 'This week',
    activeLinks: 'Active links',
    expiredLinks: 'Expired links',
    shareRate: 'Share rate',
    submissionsToday: "Today's submissions",
    last7Days: 'Last 7 days',
    submissionsPerDay: 'Submissions / day (30d)',
    q1Distribution: 'Q1 Distribution',
    top5: 'Top 5 influencers by total referrals',
    last10: 'Last 10 submissions',
    thCode: 'Code',
    thLang: 'Language',
    thReferrer: 'Referrer',
    thProfile: 'Profile',
    thDate: 'Date',
    thAge: 'Age',
    thCountry: 'Country',
    loading: 'Loading...',
    error: 'Data loading error.',
    directs: 'Direct',
    total: 'Total',
  },
};

const FILTER_LABELS = {
  reg: 'Réguliers', occ: 'Occasionnels', ex: 'Anciens',
  curious: 'Curieux', never: 'Jamais', skip: 'Sans réponse',
};

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const lang = useAdminLang();
  const t = T[lang];

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>{t.loading}</p>;
  if (!data) return <p>{t.error}</p>;

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
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>{t.overview}</h2>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatsCard title={t.totalRespondents} value={kpis.totalRespondents} />
        <StatsCard title={t.today} value={kpis.todaySubmissions} subtitle={t.submissionsToday} />
        <StatsCard title={t.thisWeek} value={kpis.weekSubmissions} subtitle={t.last7Days} />
        <StatsCard title={t.activeLinks} value={kpis.activeLinks} />
        <StatsCard title={t.expiredLinks} value={kpis.expiredLinks} />
        <StatsCard title={t.shareRate} value={`${kpis.shareRate}%`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <AreaChartBlock
            lang={lang}
            data={(submissionsByDay || []).map((d) => ({ day: String(d.day).slice(0, 10), count: d.count }))}
            xKey="day"
            title={t.submissionsPerDay}
            areas={[{ dataKey: 'count', stroke: '#d94d1a', fill: 'rgba(217,77,26,0.2)' }]}
            height={250}
          />
        </div>
        <div>
          <DonutBlock lang={lang} data={donutData} title={t.q1Distribution} />
        </div>
      </div>

      <BarChartBlock
        lang={lang}
        data={topInfData}
        xKey="name"
        dataKey="total_descendants"
        title={t.top5}
        bars={[
          { dataKey: 'directs', fill: '#f0985a', name: t.directs },
          { dataKey: 'total_descendants', fill: '#d94d1a', name: t.total },
        ]}
        stacked={false}
        height={280}
      />

      {/* Recent submissions table */}
      <section>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>{t.last10}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e8e5df' }}>
          <thead>
            <tr style={{ background: '#f8f6f1', textAlign: 'left' }}>
              <th style={th}>{t.thCode}</th>
              <th style={th}>{t.thLang}</th>
              <th style={th}>{t.thReferrer}</th>
              <th style={th}>{t.thProfile}</th>
              <th style={th}>{t.thDate}</th>
              <th style={th}>{t.thAge}</th>
              <th style={th}>{t.thCountry}</th>
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
