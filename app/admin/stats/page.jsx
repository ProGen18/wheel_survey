'use client';
import React, { useEffect, useState, Suspense } from 'react';
import DonutBlock from '@/components/admin/DonutBlock';
import BarChartBlock from '@/components/admin/BarChartBlock';
import AreaChartBlock from '@/components/admin/AreaChartBlock';
import HeatmapGrid from '@/components/admin/HeatmapGrid';
import RadarBlock from '@/components/admin/RadarBlock';
import CrossTabBlock from '@/components/admin/CrossTabBlock';

const FILTER_LABELS = {
  reg: 'Réguliers', occ: 'Occasionnels', ex: 'Anciens',
  curious: 'Curieux', never: 'Jamais', skip: 'Sans réponse',
};

function FiltersBar({ onFilter }) {
  const [profile, setProfile] = React.useState('');
  const [period, setPeriod] = React.useState('');
  const [lang, setLang] = React.useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProfile(params.get('profile') || '');
    setPeriod(params.get('period') || '');
    setLang(params.get('lang') || '');
  }, []);

  const apply = () => {
    const params = new URLSearchParams();
    if (profile) params.set('profile', profile);
    if (period) params.set('period', period);
    if (lang) params.set('lang', lang);
    window.history.replaceState(null, '', `?${params.toString()}`);
    if (onFilter) onFilter();
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem', padding: '1rem', background: '#fff', borderRadius: '10px', border: '1px solid #e0dcd4' }}>
      <select value={profile} onChange={(e) => setProfile(e.target.value)} style={sel}>
        <option value="">Tous profils Q1</option>
        {Object.entries(FILTER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <select value={period} onChange={(e) => setPeriod(e.target.value)} style={sel}>
        <option value="">Toute période</option>
        <option value="90">90 jours</option>
        <option value="30">30 jours</option>
        <option value="7">7 jours</option>
      </select>
      <select value={lang} onChange={(e) => setLang(e.target.value)} style={sel}>
        <option value="">Toutes langues</option>
        <option value="fr">Français</option><option value="en">English</option><option value="ru">Русский</option><option value="zh">中文</option>
      </select>
      <button onClick={apply} style={{ padding: '0.5rem 1.25rem', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
        Appliquer
      </button>
    </div>
  );
}

function SectionTitle({ num, title }) {
  return <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', borderBottom: '2px solid #e0dcd4', paddingBottom: '0.5rem' }}>
    Section {num} — {title}
  </h2>;
}

export default function StatsPage() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <StatsPageInner />
    </Suspense>
  );
}

function StatsPageInner() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    const search = window.location.search || '';
    fetch(`/api/admin/stats/full${search}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  if (loading) return <p>Chargement des statistiques...</p>;
  if (!data) return <p>Erreur de chargement.</p>;

  const { N } = data;
  const NLabel = `N = ${N} répondants`;

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem' }}>Statistiques détaillées</h1>
      <FiltersBar onFilter={fetchData} />
      <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>{NLabel}</p>

      {/* Section 0 — Routage */}
      <SectionTitle num={0} title="Routage Q1" />
      <div style={{ maxWidth: 400 }}>
        <DonutBlock data={data.q1Dist} title="Distribution des profils" />
      </div>

      {/* Section 1 — Découverte */}
      <SectionTitle num={1} title="Découverte (tous)" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <BarChartBlock data={toChartData(data.discovChannels)} xKey="name" dataKey="value" title="Q2 — Canaux de découverte" />
        <DonutBlock data={(data.socialExposure || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title="Q3 — Exposition sociale préalable" />
      </div>

      {/* Section 2 — Adoption */}
      <SectionTitle num={2} title="Adoption (reg/occ/ex)" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <BarChartBlock data={toChartData(data.adoptYear)} xKey="name" dataKey="value" title="Q4 — Année d'adoption" />
        <BarChartBlock data={toChartData(data.acquisitionMode)} xKey="name" dataKey="value" title="Q5 — Mode d'acquisition" />
        <BarChartBlock data={toChartData(data.priceCat)} xKey="name" dataKey="value" title="Q6 — Prix" />
        <BarChartBlock data={toChartData(data.adoptDelay)} xKey="name" dataKey="value" title="Q7 — Délai découverte→achat" />
        <DonutBlock data={(data.discount || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title="Q8 — Achat avec réduction" />
        <BarChartBlock data={toChartData(data.learningTime)} xKey="name" dataKey="value" title="Q9 — Temps d'apprentissage" />
        <DonutBlock data={(data.tutorials || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title="Q10 — Tutoriels" />
        <BarChartBlock data={toChartData(data.learningDifficulty)} xKey="name" dataKey="value" title="Q11 — Difficulté (1-3)" />
      </div>

      {/* Section 3 — Usage */}
      <SectionTitle num={3} title="Usage actuel (reg/occ)" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <BarChartBlock data={toChartData(data.weeklyDistance)} xKey="name" dataKey="value" title="Q12 — Distance hebdo" />
        <BarChartBlock data={toChartData(data.mainUse)} xKey="name" dataKey="value" title="Q13 — Usage principal" />
        <BarChartBlock data={toChartData(data.transportReplace)} xKey="name" dataKey="value" title="Q14 — Transport remplacé" />
        <DonutBlock data={(data.carAccess || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title="Q15 — Accès voiture" />
      </div>
      {data.comparisonMatrix && (
        <HeatmapGrid
          title="Q16 — EUC vs transport principal"
          rows={['faster', 'flexible', 'convenient', 'safer', 'eco', 'value'].map((k) => ({ key: k, label: k }))}
          cols={[1, 2].map((v) => ({ key: String(v), label: v === 1 ? 'Désaccord' : 'Accord' }))}
          data={data.comparisonMatrix}
        />
      )}

      {/* Section 4 — Contraintes */}
      <SectionTitle num={4} title="Facteurs limitants (tous)" />
      {data.limitingFactorsMatrix && (
        <HeatmapGrid
          title="Q17 — Freins à l'adoption"
          rows={['price', 'learning', 'safety', 'regulation', 'infrastructure'].map((k) => ({ key: k, label: k }))}
          cols={[1, 2, 3].map((v) => ({ key: String(v), label: `Niv.${v}` }))}
          data={data.limitingFactorsMatrix}
        />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <BarChartBlock data={toChartData(data.protections)} xKey="name" dataKey="value" title="Q18 — Équipements de protection" />
        <BarChartBlock data={toChartData(data.regulationStatus)} xKey="name" dataKey="value" title="Q19 — Statut réglementaire" />
        <BarChartBlock data={toChartData(data.regulationInfluence)} xKey="name" dataKey="value" title="Q20 — Influence réglementation" />
        <DonutBlock data={(data.regulationRenounced || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title="Q21 — Renoncement réglementation" />
      </div>

      {/* Section 5 — Communauté */}
      <SectionTitle num={5} title="Communauté (reg/occ/ex)" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <BarChartBlock data={toChartData(data.socialCircle)} xKey="name" dataKey="value" title="Q22 — Entourage" />
        <BarChartBlock data={toChartData(data.groupRides)} xKey="name" dataKey="value" title="Q23 — Sorties collectives" />
        <DonutBlock data={(data.onlineCommunity || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title="Q24 — Communauté en ligne" />
      </div>

      {/* Section 6 — Perception non-utilisateurs */}
      <SectionTitle num={6} title="Perception (curious/never)" />
      {data.perceptionMatrix && (
        <HeatmapGrid
          title="Q25 — Perception EUC"
          rows={['hard', 'dangerous', 'useful', 'expensive'].map((k) => ({ key: k, label: k }))}
          cols={[1, 2].map((v) => ({ key: String(v), label: v === 1 ? 'Désaccord' : 'Accord' }))}
          data={data.perceptionMatrix}
        />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <BarChartBlock data={toChartData(data.futureLikelihood)} xKey="name" dataKey="value" title="Q26 — Probabilité adoption future" />
        <BarChartBlock data={toChartData(data.barriers)} xKey="name" dataKey="value" title="Q27 — Freins à l'adoption" />
      </div>

      {/* Section 7 — MCI */}
      <SectionTitle num={7} title="Profil MCI (tous)" />
      <RadarBlock data={data.mciOverall} title="Profil MCI global (5 dimensions)" />
      {data.mciByProfile && (
        <RadarBlock
          comparative={[
            { name: 'Actifs', data: data.mciByProfile.actifs || [] },
            { name: 'Anciens', data: data.mciByProfile.anciens || [] },
            { name: 'Non-users', data: data.mciByProfile.non_users || [] },
          ].filter((g) => g.data.length > 0)}
          title="Profil MCI comparatif (3 groupes)"
        />
      )}
      {data.hedonicMatrix && (
        <HeatmapGrid title="MCI-H — Hédonique" rows={['pleasure', 'stimulation', 'joy'].map((k) => ({ key: k, label: k }))} cols={[1, 2].map((v) => ({ key: String(v), label: `Niv.${v}` }))} data={data.hedonicMatrix} />
      )}
      {data.instrumentalMatrix && (
        <HeatmapGrid title="MCI-I — Instrumental" rows={['proven', 'risk', 'breadth'].map((k) => ({ key: k, label: k }))} cols={[1, 2].map((v) => ({ key: String(v), label: `Niv.${v}` }))} data={data.instrumentalMatrix} />
      )}
      {data.socialMatrix && (
        <HeatmapGrid title="MCI-S — Social" rows={['discussion', 'early', 'peer', 'community'].map((k) => ({ key: k, label: k }))} cols={[1, 2].map((v) => ({ key: String(v), label: `Niv.${v}` }))} data={data.socialMatrix} />
      )}
      {data.symbolicMatrix && (
        <HeatmapGrid title="MCI-Y — Symbolique" rows={['personality', 'image', 'identity', 'originality'].map((k) => ({ key: k, label: k }))} cols={[1, 2].map((v) => ({ key: String(v), label: `Niv.${v}` }))} data={data.symbolicMatrix} />
      )}
      {data.cognitiveMatrix && (
        <HeatmapGrid title="MCI-C — Cognitif" rows={['complex', 'time', 'difficult'].map((k) => ({ key: k, label: k }))} cols={[1, 2].map((v) => ({ key: String(v), label: `Niv.${v}` }))} data={data.cognitiveMatrix} />
      )}

      {/* Section 8 — Démo */}
      <SectionTitle num={8} title="Démographie (tous)" />
      {data.ageStats && (
        <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#555' }}>
          Âge : médian {data.ageStats.ageMedian} · moyen {data.ageStats.ageMean} · min {data.ageStats.min} · max {data.ageStats.max} · {data.ageStats.ages.length} réponses
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <DonutBlock data={(data.gender || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title="Q29 — Genre" />
        <BarChartBlock data={toChartData(data.citySize)} xKey="name" dataKey="value" title="Q31 — Taille de ville" />
        <BarChartBlock data={toChartData(data.occupation)} xKey="name" dataKey="value" title="Q32 — Profession" height={400} />
        <BarChartBlock data={toChartData(data.income)} xKey="name" dataKey="value" title="Q33 — Revenu mensuel" />
      </div>

      {/* Section 9 — Croisements */}
      <SectionTitle num={9} title="Analyses croisées" />
      {data.crossTabChannelsProfile && data.crossTabChannelsProfile.length > 0 && (
        <CrossTabBlock
          data={data.crossTabChannelsProfile}
          groups={['reg', 'occ', 'ex', 'curious', 'never', 'skip']}
          title="Canaux découverte × Profil Q1"
        />
      )}
      {data.crossTabAgeProfile && data.crossTabAgeProfile.length > 0 && (
        <CrossTabBlock
          data={data.crossTabAgeProfile}
          groups={['reg', 'occ', 'ex', 'curious', 'never', 'skip']}
          title="Âge × Profil Q1"
        />
      )}
    </div>
  );
}

function toChartData(arr, keyName = 'key') {
  if (!arr) return [];
  return arr.map((d) => ({ name: d.label || d[keyName] || d.name, value: d.count || d.value }));
}

const sel = { padding: '0.5rem 0.75rem', border: '1px solid #d4cfc8', borderRadius: '6px', fontSize: '0.85rem', background: '#fff', fontFamily: 'inherit', color: 'var(--ink)', minWidth: '140px' };
