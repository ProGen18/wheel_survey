'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useAdminLang } from '../layout';
import DonutBlock from '@/components/admin/DonutBlock';
import BarChartBlock from '@/components/admin/BarChartBlock';
import AreaChartBlock from '@/components/admin/AreaChartBlock';
import HeatmapGrid from '@/components/admin/HeatmapGrid';
import RadarBlock from '@/components/admin/RadarBlock';
import CrossTabBlock from '@/components/admin/CrossTabBlock';

const T = {
  fr: {
    title: 'Statistiques détaillées',
    allProfiles: 'Tous profils Q1',
    allPeriods: 'Toute période',
    days90: '90 jours',
    days30: '30 jours',
    days7: '7 jours',
    allLangs: 'Toutes langues',
    french: 'Français',
    english: 'English',
    russian: 'Русский',
    chinese: '中文',
    apply: 'Appliquer',
    respondentsN: 'répondants',
    loading: 'Chargement des statistiques...',
    error: 'Erreur de chargement.',
    loadingShort: 'Chargement...',
    disagree: 'Désaccord',
    agree: 'Accord',
    sectionLabel: 'Section',
    section0: 'Routage Q1',
    section1: 'Découverte (tous)',
    section2: 'Adoption (reg/occ/ex)',
    section3: 'Usage actuel (reg/occ)',
    section4: 'Facteurs limitants (tous)',
    section5: 'Communauté (reg/occ/ex)',
    section6: 'Perception (curious/never)',
    section7: 'Profil MCI (tous)',
    section8: 'Démographie (tous)',
    section9: 'Analyses croisées',
    q1Dist: 'Distribution des profils',
    q2Channels: 'Q2 — Canaux de découverte',
    q3SocialExposure: "Q3 — Exposition sociale préalable",
    q4AdoptYear: "Q4 — Année d'adoption",
    q5AcqMode: "Q5 — Mode d'acquisition",
    q6Price: 'Q6 — Prix',
    q7Delay: 'Q7 — Délai découverte→achat',
    q8Discount: 'Q8 — Achat avec réduction',
    q9Learning: "Q9 — Temps d'apprentissage",
    q10Tutorials: 'Q10 — Tutoriels',
    q11Difficulty: 'Q11 — Difficulté (1-3)',
    q12Dist: 'Q12 — Distance hebdo',
    q13MainUse: 'Q13 — Usage principal',
    q14Transport: 'Q14 — Transport remplacé',
    q15Car: 'Q15 — Accès voiture',
    q16Comparison: 'Q16 — EUC vs transport principal',
    q17Barriers: "Q17 — Freins à l'adoption",
    q18Protections: 'Q18 — Équipements de protection',
    q19RegStatus: 'Q19 — Statut réglementaire',
    q20RegInfluence: 'Q20 — Influence réglementation',
    q21RegRenounce: 'Q21 — Renoncement réglementation',
    q22SocialCircle: 'Q22 — Entourage',
    q23GroupRides: 'Q23 — Sorties collectives',
    q24Online: 'Q24 — Communauté en ligne',
    q25Perception: 'Q25 — Perception EUC',
    q26Future: 'Q26 — Probabilité adoption future',
    q27BarriersFuture: "Q27 — Freins à l'adoption",
    mciGlobal: 'Profil MCI global (5 dimensions)',
    mciComparative: 'Profil MCI comparatif (3 groupes)',
    mciH: 'MCI-H — Hédonique',
    mciI: 'MCI-I — Instrumental',
    mciS: 'MCI-S — Social',
    mciY: 'MCI-Y — Symbolique',
    mciC: 'MCI-C — Cognitif',
    ageStats: 'Âge : médian',
    q29Gender: 'Q29 — Genre',
    q31CitySize: 'Q31 — Taille de ville',
    q32Occupation: 'Q32 — Profession',
    q33Income: 'Q33 — Revenu mensuel',
    crossChannelsProfile: 'Canaux découverte × Profil Q1',
    crossAgeProfile: 'Âge × Profil Q1',
    activeGroup: 'Actifs',
    formerGroup: 'Anciens',
    nonUsersGroup: 'Non-users',
  },
  en: {
    title: 'Detailed statistics',
    allProfiles: 'All Q1 profiles',
    allPeriods: 'All periods',
    days90: '90 days',
    days30: '30 days',
    days7: '7 days',
    allLangs: 'All languages',
    french: 'Français',
    english: 'English',
    russian: 'Русский',
    chinese: '中文',
    apply: 'Apply',
    respondentsN: 'respondents',
    loading: 'Loading statistics...',
    error: 'Loading error.',
    loadingShort: 'Loading...',
    disagree: 'Disagree',
    agree: 'Agree',
    sectionLabel: 'Section',
    section0: 'Q1 Routing',
    section1: 'Discovery (all)',
    section2: 'Adoption (reg/occ/ex)',
    section3: 'Current usage (reg/occ)',
    section4: 'Limiting factors (all)',
    section5: 'Community (reg/occ/ex)',
    section6: 'Perception (curious/never)',
    section7: 'MCI Profile (all)',
    section8: 'Demographics (all)',
    section9: 'Cross-analysis',
    q1Dist: 'Profile distribution',
    q2Channels: 'Q2 — Discovery channels',
    q3SocialExposure: 'Q3 — Prior social exposure',
    q4AdoptYear: 'Q4 — Adoption year',
    q5AcqMode: 'Q5 — Acquisition mode',
    q6Price: 'Q6 — Price',
    q7Delay: 'Q7 — Discovery-to-purchase delay',
    q8Discount: 'Q8 — Purchase with discount',
    q9Learning: 'Q9 — Learning time',
    q10Tutorials: 'Q10 — Tutorials',
    q11Difficulty: 'Q11 — Difficulty (1-3)',
    q12Dist: 'Q12 — Weekly distance',
    q13MainUse: 'Q13 — Primary use',
    q14Transport: 'Q14 — Replaced transport',
    q15Car: 'Q15 — Car access',
    q16Comparison: 'Q16 — EUC vs primary transport',
    q17Barriers: 'Q17 — Adoption barriers',
    q18Protections: 'Q18 — Protective equipment',
    q19RegStatus: 'Q19 — Regulatory status',
    q20RegInfluence: 'Q20 — Regulation influence',
    q21RegRenounce: 'Q21 — Renounced due to regulation',
    q22SocialCircle: 'Q22 — Social circle',
    q23GroupRides: 'Q23 — Group rides',
    q24Online: 'Q24 — Online community',
    q25Perception: 'Q25 — EUC Perception',
    q26Future: 'Q26 — Future adoption likelihood',
    q27BarriersFuture: 'Q27 — Adoption barriers',
    mciGlobal: 'Global MCI profile (5 dimensions)',
    mciComparative: 'Comparative MCI profile (3 groups)',
    mciH: 'MCI-H — Hedonic',
    mciI: 'MCI-I — Instrumental',
    mciS: 'MCI-S — Social',
    mciY: 'MCI-Y — Symbolic',
    mciC: 'MCI-C — Cognitive',
    ageStats: 'Age: median',
    q29Gender: 'Q29 — Gender',
    q31CitySize: 'Q31 — City size',
    q32Occupation: 'Q32 — Occupation',
    q33Income: 'Q33 — Monthly income',
    crossChannelsProfile: 'Discovery channels × Q1 Profile',
    crossAgeProfile: 'Age × Q1 Profile',
    activeGroup: 'Active',
    formerGroup: 'Former',
    nonUsersGroup: 'Non-users',
  },
};

const FILTER_LABELS = {
  reg: 'Réguliers', occ: 'Occasionnels', ex: 'Anciens',
  curious: 'Curieux', never: 'Jamais', skip: 'Sans réponse',
};

function FiltersBar({ onFilter, lang, t }) {
  const [profile, setProfile] = React.useState('');
  const [period, setPeriod] = React.useState('');
  const [fLang, setFLang] = React.useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProfile(params.get('profile') || '');
    setPeriod(params.get('period') || '');
    setFLang(params.get('lang') || '');
  }, []);

  const apply = () => {
    const params = new URLSearchParams();
    if (profile) params.set('profile', profile);
    if (period) params.set('period', period);
    if (fLang) params.set('lang', fLang);
    window.history.replaceState(null, '', `?${params.toString()}`);
    if (onFilter) onFilter();
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem', padding: '1rem', background: '#fff', borderRadius: '10px', border: '1px solid #e0dcd4' }}>
      <select value={profile} onChange={(e) => setProfile(e.target.value)} style={sel}>
        <option value="">{t.allProfiles}</option>
        {Object.entries(FILTER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <select value={period} onChange={(e) => setPeriod(e.target.value)} style={sel}>
        <option value="">{t.allPeriods}</option>
        <option value="90">{t.days90}</option>
        <option value="30">{t.days30}</option>
        <option value="7">{t.days7}</option>
      </select>
      <select value={fLang} onChange={(e) => setFLang(e.target.value)} style={sel}>
        <option value="">{t.allLangs}</option>
        <option value="fr">{t.french}</option><option value="en">{t.english}</option><option value="ru">{t.russian}</option><option value="zh">{t.chinese}</option>
      </select>
      <button onClick={apply} style={{ padding: '0.5rem 1.25rem', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
        {t.apply}
      </button>
    </div>
  );
}

function SectionTitle({ num, title, t }) {
  return <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem', borderBottom: '2px solid #e0dcd4', paddingBottom: '0.5rem' }}>
    {t.sectionLabel} {num} — {title}
  </h2>;
}

export default function StatsPage() {
  const lang = useAdminLang();
  const t = T[lang];
  return (
    <Suspense fallback={<p>{t.loadingShort}</p>}>
      <StatsPageInner lang={lang} t={t} />
    </Suspense>
  );
}

function StatsPageInner({ lang, t }) {
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

  if (loading) return <p>{t.loading}</p>;
  if (!data) return <p>{t.error}</p>;

  const { N } = data;
  const NLabel = `N = ${N} ${t.respondentsN}`;

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem' }}>{t.title}</h1>
      <FiltersBar onFilter={fetchData} lang={lang} t={t} />
      <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>{NLabel}</p>

      {/* Section 0 — Routage */}
      <SectionTitle num={0} title={t.section0} t={t} />
      <div style={{ maxWidth: 400 }}>
        <DonutBlock lang={lang} data={data.q1Dist} title={t.q1Dist} />
      </div>

      {/* Section 1 — Découverte */}
      <SectionTitle num={1} title={t.section1} t={t} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <BarChartBlock lang={lang} data={toChartData(data.discovChannels)} xKey="name" dataKey="value" title={t.q2Channels} />
        <DonutBlock lang={lang} data={(data.socialExposure || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title={t.q3SocialExposure} />
      </div>

      {/* Section 2 — Adoption */}
      <SectionTitle num={2} title={t.section2} t={t} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <BarChartBlock lang={lang} data={toChartData(data.adoptYear)} xKey="name" dataKey="value" title={t.q4AdoptYear} />
        <BarChartBlock lang={lang} data={toChartData(data.acquisitionMode)} xKey="name" dataKey="value" title={t.q5AcqMode} />
        <BarChartBlock lang={lang} data={toChartData(data.priceCat)} xKey="name" dataKey="value" title={t.q6Price} />
        <BarChartBlock lang={lang} data={toChartData(data.adoptDelay)} xKey="name" dataKey="value" title={t.q7Delay} />
        <DonutBlock lang={lang} data={(data.discount || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title={t.q8Discount} />
        <BarChartBlock lang={lang} data={toChartData(data.learningTime)} xKey="name" dataKey="value" title={t.q9Learning} />
        <DonutBlock lang={lang} data={(data.tutorials || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title={t.q10Tutorials} />
        <BarChartBlock lang={lang} data={toChartData(data.learningDifficulty)} xKey="name" dataKey="value" title={t.q11Difficulty} />
      </div>

      {/* Section 3 — Usage */}
      <SectionTitle num={3} title={t.section3} t={t} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <BarChartBlock lang={lang} data={toChartData(data.weeklyDistance)} xKey="name" dataKey="value" title={t.q12Dist} />
        <BarChartBlock lang={lang} data={toChartData(data.mainUse)} xKey="name" dataKey="value" title={t.q13MainUse} />
        <BarChartBlock lang={lang} data={toChartData(data.transportReplace)} xKey="name" dataKey="value" title={t.q14Transport} />
        <DonutBlock lang={lang} data={(data.carAccess || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title={t.q15Car} />
      </div>
      {data.comparisonMatrix && (
        <HeatmapGrid
          lang={lang}
          title={t.q16Comparison}
          rows={['faster', 'flexible', 'convenient', 'safer', 'eco', 'value'].map((k) => ({ key: k, label: k }))}
          cols={[1, 2].map((v) => ({ key: String(v), label: v === 1 ? t.disagree : t.agree }))}
          data={data.comparisonMatrix}
        />
      )}

      {/* Section 4 — Contraintes */}
      <SectionTitle num={4} title={t.section4} t={t} />
      {data.limitingFactorsMatrix && (
        <HeatmapGrid
          lang={lang}
          title={t.q17Barriers}
          rows={['price', 'learning', 'safety', 'regulation', 'infrastructure'].map((k) => ({ key: k, label: k }))}
          cols={[1, 2, 3].map((v) => ({ key: String(v), label: `Niv.${v}` }))}
          data={data.limitingFactorsMatrix}
        />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <BarChartBlock lang={lang} data={toChartData(data.protections)} xKey="name" dataKey="value" title={t.q18Protections} />
        <BarChartBlock lang={lang} data={toChartData(data.regulationStatus)} xKey="name" dataKey="value" title={t.q19RegStatus} />
        <BarChartBlock lang={lang} data={toChartData(data.regulationInfluence)} xKey="name" dataKey="value" title={t.q20RegInfluence} />
        <DonutBlock lang={lang} data={(data.regulationRenounced || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title={t.q21RegRenounce} />
      </div>

      {/* Section 5 — Communauté */}
      <SectionTitle num={5} title={t.section5} t={t} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <BarChartBlock lang={lang} data={toChartData(data.socialCircle)} xKey="name" dataKey="value" title={t.q22SocialCircle} />
        <BarChartBlock lang={lang} data={toChartData(data.groupRides)} xKey="name" dataKey="value" title={t.q23GroupRides} />
        <DonutBlock lang={lang} data={(data.onlineCommunity || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title={t.q24Online} />
      </div>

      {/* Section 6 — Perception non-utilisateurs */}
      <SectionTitle num={6} title={t.section6} t={t} />
      {data.perceptionMatrix && (
        <HeatmapGrid
          lang={lang}
          title={t.q25Perception}
          rows={['hard', 'dangerous', 'useful', 'expensive'].map((k) => ({ key: k, label: k }))}
          cols={[1, 2].map((v) => ({ key: String(v), label: v === 1 ? t.disagree : t.agree }))}
          data={data.perceptionMatrix}
        />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <BarChartBlock lang={lang} data={toChartData(data.futureLikelihood)} xKey="name" dataKey="value" title={t.q26Future} />
        <BarChartBlock lang={lang} data={toChartData(data.barriers)} xKey="name" dataKey="value" title={t.q27BarriersFuture} />
      </div>

      {/* Section 7 — MCI */}
      <SectionTitle num={7} title={t.section7} t={t} />
      <RadarBlock lang={lang} data={data.mciOverall} title={t.mciGlobal} />
      {data.mciByProfile && (
        <RadarBlock
          lang={lang}
          comparative={[
            { name: t.activeGroup, data: data.mciByProfile.actifs || [] },
            { name: t.formerGroup, data: data.mciByProfile.anciens || [] },
            { name: t.nonUsersGroup, data: data.mciByProfile.non_users || [] },
          ].filter((g) => g.data.length > 0)}
          title={t.mciComparative}
        />
      )}
      {data.hedonicMatrix && (
        <HeatmapGrid lang={lang} title={t.mciH} rows={['pleasure', 'stimulation', 'joy'].map((k) => ({ key: k, label: k }))} cols={[1, 2].map((v) => ({ key: String(v), label: `Niv.${v}` }))} data={data.hedonicMatrix} />
      )}
      {data.instrumentalMatrix && (
        <HeatmapGrid lang={lang} title={t.mciI} rows={['proven', 'risk', 'breadth'].map((k) => ({ key: k, label: k }))} cols={[1, 2].map((v) => ({ key: String(v), label: `Niv.${v}` }))} data={data.instrumentalMatrix} />
      )}
      {data.socialMatrix && (
        <HeatmapGrid lang={lang} title={t.mciS} rows={['discussion', 'early', 'peer', 'community'].map((k) => ({ key: k, label: k }))} cols={[1, 2].map((v) => ({ key: String(v), label: `Niv.${v}` }))} data={data.socialMatrix} />
      )}
      {data.symbolicMatrix && (
        <HeatmapGrid lang={lang} title={t.mciY} rows={['personality', 'image', 'identity', 'originality'].map((k) => ({ key: k, label: k }))} cols={[1, 2].map((v) => ({ key: String(v), label: `Niv.${v}` }))} data={data.symbolicMatrix} />
      )}
      {data.cognitiveMatrix && (
        <HeatmapGrid lang={lang} title={t.mciC} rows={['complex', 'time', 'difficult'].map((k) => ({ key: k, label: k }))} cols={[1, 2].map((v) => ({ key: String(v), label: `Niv.${v}` }))} data={data.cognitiveMatrix} />
      )}

      {/* Section 8 — Démo */}
      <SectionTitle num={8} title={t.section8} t={t} />
      {data.ageStats && (
        <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#555' }}>
          {t.ageStats} {data.ageStats.ageMedian} · moyen {data.ageStats.ageMean} · min {data.ageStats.min} · max {data.ageStats.max} · {data.ageStats.ages.length} réponses
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <DonutBlock lang={lang} data={(data.gender || []).map((d) => ({ name: d.label || d.key, value: d.count }))} title={t.q29Gender} />
        <BarChartBlock lang={lang} data={toChartData(data.citySize)} xKey="name" dataKey="value" title={t.q31CitySize} />
        <BarChartBlock lang={lang} data={toChartData(data.occupation)} xKey="name" dataKey="value" title={t.q32Occupation} height={400} />
        <BarChartBlock lang={lang} data={toChartData(data.income)} xKey="name" dataKey="value" title={t.q33Income} />
      </div>

      {/* Section 9 — Croisements */}
      <SectionTitle num={9} title={t.section9} t={t} />
      {data.crossTabChannelsProfile && data.crossTabChannelsProfile.length > 0 && (
        <CrossTabBlock
          lang={lang}
          data={data.crossTabChannelsProfile}
          groups={['reg', 'occ', 'ex', 'curious', 'never', 'skip']}
          title={t.crossChannelsProfile}
        />
      )}
      {data.crossTabAgeProfile && data.crossTabAgeProfile.length > 0 && (
        <CrossTabBlock
          lang={lang}
          data={data.crossTabAgeProfile}
          groups={['reg', 'occ', 'ex', 'curious', 'never', 'skip']}
          title={t.crossAgeProfile}
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
