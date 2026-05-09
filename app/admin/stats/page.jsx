'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useAdminLang } from '../layout';
import DonutBlock from '@/components/admin/DonutBlock';
import BarChartBlock from '@/components/admin/BarChartBlock';
import HeatmapGrid from '@/components/admin/HeatmapGrid';
import RadarBlock from '@/components/admin/RadarBlock';
import CrossTabBlock from '@/components/admin/CrossTabBlock';
import { labelFreq, labelFilterValue, getMatrixRows, getMatrixCols, FILTER_VALUE_LABELS } from '@/lib/admin-labels';
import { FILTER_VALUE_COLORS } from '@/lib/admin-palette';

const T = {
  fr: {
    title: 'Statistiques détaillées',
    subtitle: 'Tableau de bord des réponses au questionnaire — réparti par section, profil et dimension MCI.',
    allProfiles: 'Tous profils Q1',
    allPeriods: 'Toute période',
    days90: '90 jours', days30: '30 jours', days7: '7 jours',
    allLangs: 'Toutes langues',
    french: 'Français', english: 'English', russian: 'Русский', chinese: '中文',
    apply: 'Appliquer',
    respondentsN: 'répondants',
    loading: 'Chargement des statistiques…',
    error: 'Erreur de chargement.',
    loadingShort: 'Chargement…',
    section0: 'Routage Q1',
    section1: 'Découverte',
    section2: 'Adoption (utilisateurs et anciens)',
    section3: 'Usage actuel (réguliers et occasionnels)',
    section4: 'Facteurs limitants',
    section5: 'Communauté',
    section6: 'Perception (curieux et jamais)',
    section7: 'Profil MCI',
    section8: 'Démographie',
    section9: 'Analyses croisées',
    activeGroup: 'Actifs (reg+occ)',
    formerGroup: 'Anciens (ex)',
    nonUsersGroup: 'Non-users',
    medianAge: 'Âge médian', meanAge: 'Âge moyen', minAge: 'Min', maxAge: 'Max', totalAge: 'Effectif',
    mciH: 'MCI-H · Hédonique',
    mciI: 'MCI-I · Instrumental',
    mciS: 'MCI-S · Social',
    mciY: 'MCI-Y · Symbolique',
    mciC: 'MCI-C · Cognitif',
  },
  en: {
    title: 'Detailed statistics',
    subtitle: 'Survey dashboard — broken down by section, profile and MCI dimension.',
    allProfiles: 'All Q1 profiles',
    allPeriods: 'All periods',
    days90: '90 days', days30: '30 days', days7: '7 days',
    allLangs: 'All languages',
    french: 'Français', english: 'English', russian: 'Русский', chinese: '中文',
    apply: 'Apply',
    respondentsN: 'respondents',
    loading: 'Loading statistics…',
    error: 'Loading error.',
    loadingShort: 'Loading…',
    section0: 'Q1 routing',
    section1: 'Discovery',
    section2: 'Adoption (users and former)',
    section3: 'Current usage (regular and occasional)',
    section4: 'Limiting factors',
    section5: 'Community',
    section6: 'Perception (curious and never)',
    section7: 'MCI profile',
    section8: 'Demographics',
    section9: 'Cross-analyses',
    activeGroup: 'Active (reg+occ)',
    formerGroup: 'Former (ex)',
    nonUsersGroup: 'Non-users',
    medianAge: 'Median age', meanAge: 'Mean age', minAge: 'Min', maxAge: 'Max', totalAge: 'Sample',
    mciH: 'MCI-H · Hedonic',
    mciI: 'MCI-I · Instrumental',
    mciS: 'MCI-S · Social',
    mciY: 'MCI-Y · Symbolic',
    mciC: 'MCI-C · Cognitive',
  },
};

const SECTION_DESC = {
  fr: {
    0: 'Question filtre du questionnaire — distribue chaque répondant vers les sections pertinentes. La taille de chaque profil détermine le n disponible pour les sections suivantes.',
    1: 'Première porte d\'entrée : par quels canaux les répondants découvrent-ils la gyroroue ? Posée à tout le monde (n = total).',
    2: 'Réservée aux répondants qui ont déjà possédé une gyroroue (réguliers, occasionnels, anciens). Permet de reconstituer un parcours d\'achat moyen.',
    3: 'Pratique quotidienne des utilisateurs encore actifs. Distances, contexte d\'usage, transports remplacés et comparaison subjective vs trajet principal.',
    4: 'Quels obstacles empêchent l\'adoption ou freinent l\'usage ? Posée à tous, sur 5 facteurs (échelle 1-7), plus questions sur la réglementation et les protections.',
    5: 'Densité de l\'écosystème social autour de la gyroroue : entourage pratiquant, sorties collectives, communautés en ligne.',
    6: 'Image de la gyroroue chez ceux qui n\'en ont pas (encore). Mesure les a priori, l\'intention d\'adoption et les freins anticipés.',
    7: 'Échelle MCI (Motivations de Consommation et d\'Innovation) — chaque dimension agrège plusieurs items en score 1-7. Permet de positionner les répondants sur 5 axes.',
    8: 'Profil sociodémographique — utile pour pondérer ou redresser l\'échantillon, et lire les autres résultats à travers ces variables.',
    9: 'Croisements clés : comment certains comportements (canaux de découverte, âge) varient selon le profil Q1.',
  },
  en: {
    0: 'Survey routing question — sends each respondent to the relevant sections. Each profile size determines the n available for downstream sections.',
    1: 'First entry point: through which channels did respondents discover EUCs? Asked to everyone (n = total).',
    2: 'Restricted to respondents who already owned an EUC (regular, occasional, former). Reconstructs the average purchase journey.',
    3: 'Daily practice of currently-active riders. Distances, use context, replaced transport and subjective comparison with main commute.',
    4: 'What obstacles prevent adoption or curb usage? Asked to everyone on 5 factors (1-7 scale), plus regulation and protective gear.',
    5: 'Density of the social ecosystem around EUCs: riding peers, group rides, online communities.',
    6: 'EUC image among non-owners. Measures preconceptions, future-adoption intent and anticipated barriers.',
    7: 'MCI scale (Motivations for Consumption and Innovation) — each dimension aggregates several items into a 1-7 score, positioning respondents on 5 axes.',
    8: 'Socio-demographic profile — useful for weighting or rebalancing the sample, and for reading other results through these variables.',
    9: 'Key cross-tabulations: how certain behaviours (discovery channels, age) vary by Q1 profile.',
  },
};

const FILTER_OPTS = [
  { k: 'reg', fr: 'Réguliers', en: 'Regular' },
  { k: 'occ', fr: 'Occasionnels', en: 'Occasional' },
  { k: 'ex', fr: 'Anciens', en: 'Former' },
  { k: 'curious', fr: 'Curieux', en: 'Curious' },
  { k: 'never', fr: 'Jamais', en: 'Never' },
  { k: 'skip', fr: 'Sans réponse', en: 'Skipped' },
];

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
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem', padding: '1rem 1.1rem', background: '#fff', borderRadius: 10, border: '1px solid #e8e5df', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <select value={profile} onChange={(e) => setProfile(e.target.value)} style={sel}>
        <option value="">{t.allProfiles}</option>
        {FILTER_OPTS.map((o) => <option key={o.k} value={o.k}>{o[lang]}</option>)}
      </select>
      <select value={period} onChange={(e) => setPeriod(e.target.value)} style={sel}>
        <option value="">{t.allPeriods}</option>
        <option value="90">{t.days90}</option>
        <option value="30">{t.days30}</option>
        <option value="7">{t.days7}</option>
      </select>
      <select value={fLang} onChange={(e) => setFLang(e.target.value)} style={sel}>
        <option value="">{t.allLangs}</option>
        <option value="fr">{t.french}</option><option value="en">{t.english}</option>
        <option value="ru">{t.russian}</option><option value="zh">{t.chinese}</option>
      </select>
      <button onClick={apply} style={{ padding: '0.55rem 1.25rem', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
        {t.apply}
      </button>
    </div>
  );
}

function SectionTitle({ num, title, desc }) {
  return (
    <div style={{ marginTop: '3rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.4rem' }}>
        <span style={{ background: '#d94d1a', color: '#fff', borderRadius: 6, minWidth: 28, height: 28, padding: '0 0.45rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{num}</span>
        <h2 style={{ fontSize: '1.12rem', fontWeight: 700, margin: 0, color: '#1b1f2a' }}>{title}</h2>
      </div>
      {desc && <p style={{ margin: '0 0 0 2.3rem', fontSize: '0.83rem', color: '#6b6f7d', lineHeight: 1.6, maxWidth: 880 }}>{desc}</p>}
      <div style={{ borderBottom: '1px solid #e8e5df', marginTop: '0.85rem' }} />
    </div>
  );
}

const card = { background: '#fff', borderRadius: 12, padding: '1.25rem 1.4rem', border: '1px solid #e8e5df', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };

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

  // Description helpers (FR/EN)
  const desc = (fr, en) => lang === 'fr' ? fr : en;

  const isFr = lang === 'fr';

  return (
    <div>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: '0.4rem', color: '#1b1f2a' }}>{t.title}</h1>
        <p style={{ color: '#6b6f7d', fontSize: '0.92rem', margin: 0, lineHeight: 1.55 }}>{t.subtitle}</p>
      </header>

      <FiltersBar onFilter={fetchData} lang={lang} t={t} />

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#1b1f2a', color: '#f0e8da', padding: '0.5rem 0.9rem', borderRadius: 999, fontSize: '0.82rem', marginBottom: '1rem' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffb38a' }} />
        <strong style={{ fontVariantNumeric: 'tabular-nums' }}>n = {N}</strong>
        <span style={{ opacity: 0.75 }}>{t.respondentsN}</span>
      </div>

      {/* ─────────── Section 0 — Routage Q1 ─────────── */}
      <SectionTitle num={0} title={t.section0} desc={SECTION_DESC[lang][0]} />
      <div style={{ maxWidth: 620, ...card }}>
        <DonutBlock lang={lang} title={isFr ? 'Q1 — Distribution des profils' : 'Q1 — Profile distribution'}
          description={desc(
            'Réponse à la question filtre. Détermine quelles sections sont visibles pour chaque répondant.',
            'Answer to the routing question. Determines which sections each respondent sees.'
          )}
          colorMap={Object.fromEntries(Object.entries(FILTER_VALUE_COLORS).map(([k, v]) => [FILTER_VALUE_LABELS[lang][k], v]))}
          data={labelFilterValue(data.q1Dist || [], lang)} />
      </div>

      {/* ─────────── Section 1 — Découverte ─────────── */}
      <SectionTitle num={1} title={t.section1} desc={SECTION_DESC[lang][1]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        <div style={card}>
          <BarChartBlock lang={lang}
            data={labelFreq(data.discovChannels, 'discovChannels', lang)}
            xKey="name" dataKey="value"
            title={isFr ? 'Q2 — Canaux de découverte' : 'Q2 — Discovery channels'}
            description={desc(
              'Choix multiples. Chaque barre indique le nombre de répondants qui ont cité ce canal — le total dépasse n car plusieurs choix sont possibles.',
              'Multi-choice. Each bar is the number of respondents who cited that channel — total exceeds n because multiple selections are allowed.'
            )} />
        </div>
        <div style={card}>
          <DonutBlock lang={lang}
            data={labelFreq(data.socialExposure, 'socialExposure', lang)}
            title={isFr ? 'Q3 — Exposition sociale préalable' : 'Q3 — Prior social exposure'}
            description={desc(
              'Avait-on déjà vu quelqu\'un de son entourage rouler avant d\'adopter ?',
              'Had they seen someone in their circle ride before adopting?'
            )} />
        </div>
      </div>

      {/* ─────────── Section 2 — Adoption ─────────── */}
      <SectionTitle num={2} title={t.section2} desc={SECTION_DESC[lang][2]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={card}>
          <BarChartBlock lang={lang} horizontal={false}
            data={(data.adoptYear || []).map((d) => ({ name: String(d.label || d.key), value: d.count })).sort((a, b) => Number(a.name) - Number(b.name))}
            xKey="name" dataKey="value"
            title={isFr ? 'Q4 — Année d\'adoption' : 'Q4 — Adoption year'}
            description={desc(
              'Année d\'achat de la première gyroroue. Permet de visualiser les vagues d\'adoption.',
              'Year of first EUC purchase. Visualises adoption waves.'
            )} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.acquisitionMode, 'acquisitionMode', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q5 — Mode d\'acquisition' : 'Q5 — Acquisition mode'}
            description={desc('Achat neuf, occasion, prêt, cadeau…', 'New, second-hand, loan, gift…')} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.priceCat, 'priceCat', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q6 — Tranche de prix' : 'Q6 — Price range'}
            description={desc(
              'Prix payé pour la première roue. Échelle ordonnée — utile pour situer le panier moyen.',
              'Price paid for the first wheel. Ordered scale — useful for placing the average ticket.'
            )} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.adoptDelay, 'adoptDelay', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q7 — Délai découverte → achat' : 'Q7 — Discovery → purchase delay'}
            description={desc(
              'Temps écoulé entre la première découverte et le premier achat. Indicateur de maturité de la décision.',
              'Time between first discovery and first purchase. Indicator of decision maturity.'
            )} />
        </div>
        <div style={card}>
          <DonutBlock lang={lang} data={labelFreq(data.discount, 'discount', lang)}
            title={isFr ? 'Q8 — Achat avec réduction' : 'Q8 — Purchase with discount'}
            description={desc('La transaction a-t-elle bénéficié d\'une réduction ?', 'Did the purchase benefit from a discount?')} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.learningTime, 'learningTime', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q9 — Temps d\'apprentissage' : 'Q9 — Learning time'}
            description={desc(
              'Durée déclarée pour atteindre une maîtrise jugée suffisante.',
              'Self-reported time to reach a skill level considered sufficient.'
            )} />
        </div>
        <div style={card}>
          <DonutBlock lang={lang} data={labelFreq(data.tutorials, 'tutorials', lang)}
            title={isFr ? 'Q10 — Recours aux tutoriels' : 'Q10 — Tutorial use'}
            description={desc('Vidéos ou tutoriels utilisés lors de l\'apprentissage.', 'Videos or tutorials used during learning.')} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} horizontal={false}
            data={(data.learningDifficulty || []).map((d) => ({ name: String(d.label || d.key), value: d.count })).sort((a, b) => Number(a.name) - Number(b.name))}
            xKey="name" dataKey="value"
            title={isFr ? 'Q11 — Difficulté perçue (1-7)' : 'Q11 — Perceived difficulty (1-7)'}
            description={desc(
              'Échelle Likert 1 (très facile) → 7 (très difficile). La concentration des votes indique la perception dominante.',
              'Likert scale 1 (very easy) → 7 (very hard). Concentration of votes shows the dominant perception.'
            )} />
        </div>
      </div>

      {/* ─────────── Section 3 — Usage ─────────── */}
      <SectionTitle num={3} title={t.section3} desc={SECTION_DESC[lang][3]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.weeklyDistance, 'weeklyDistance', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q12 — Distance hebdomadaire' : 'Q12 — Weekly distance'}
            description={desc('Kilométrage typique parcouru en gyroroue chaque semaine.', 'Typical weekly mileage covered by EUC.')} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.mainUse, 'mainUse', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q13 — Usage principal' : 'Q13 — Primary use'}
            description={desc('Domicile-travail, loisirs, sport, trajets courts…', 'Commute, leisure, sport, short trips…')} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.transportReplace, 'transportReplace', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q14 — Transport remplacé' : 'Q14 — Replaced transport'}
            description={desc(
              'Mode auquel la gyroroue se substitue le plus souvent. Lecture clé pour l\'impact carbone.',
              'Mode the EUC most often replaces. Key reading for carbon impact.'
            )} />
        </div>
        <div style={card}>
          <DonutBlock lang={lang} data={labelFreq(data.carAccess, 'carAccess', lang)}
            title={isFr ? 'Q15 — Accès à une voiture' : 'Q15 — Car access'}
            description={desc('Le répondant a-t-il un accès régulier à une voiture ?', 'Does the respondent have regular car access?')} />
        </div>
      </div>
      {data.comparisonMatrix && (
        <div style={{ ...card, marginTop: '1.5rem' }}>
          <HeatmapGrid lang={lang}
            title={isFr ? 'Q16 — Comparaison gyroroue vs transport principal' : 'Q16 — EUC vs primary transport'}
            description={desc(
              'Pour chaque dimension, accord (1-7) avec « la gyroroue est mieux que mon transport principal ». Plus la cellule est foncée, plus cette opinion est fréquente dans cette ligne.',
              'For each dimension, agreement (1-7) with "the EUC is better than my main transport". Darker cells indicate more frequent agreement in that row.'
            )}
            rows={getMatrixRows('comparison', lang)}
            cols={getMatrixCols('agree', lang)}
            data={data.comparisonMatrix} />
        </div>
      )}

      {/* ─────────── Section 4 — Contraintes ─────────── */}
      <SectionTitle num={4} title={t.section4} desc={SECTION_DESC[lang][4]} />
      {data.limitingFactorsMatrix && (
        <div style={{ ...card, marginBottom: '1.5rem' }}>
          <HeatmapGrid lang={lang}
            title={isFr ? 'Q17 — Facteurs limitant l\'adoption' : 'Q17 — Adoption limiting factors'}
            description={desc(
              'Intensité du frein perçu sur 5 dimensions, échelle 1 (pas du tout) → 7 (très fortement). Lire en ligne : où se concentrent les votes pour chaque facteur.',
              'Perceived intensity of each barrier across 5 dimensions, scale 1 (not at all) → 7 (very strongly). Read by row: where votes cluster for each factor.'
            )}
            scheme="sequential"
            rows={getMatrixRows('limitingFactors', lang)}
            cols={getMatrixCols('intensity', lang)}
            data={data.limitingFactorsMatrix} />
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.protections, 'protections', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q18 — Équipements de protection' : 'Q18 — Protective equipment'}
            description={desc(
              'Choix multiples. Casque, protège-poignets, genouillères… plusieurs réponses possibles, le total dépasse n.',
              'Multi-choice. Helmet, wrist guards, knee pads… multiple selections allowed, total exceeds n.'
            )} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.regulationStatus, 'regulationStatus', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q19 — Statut réglementaire' : 'Q19 — Regulatory status'}
            description={desc('Légalité de la gyroroue dans le pays du répondant.', 'Legal status of EUCs in the respondent\'s country.')} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.regulationInfluence, 'regulationInfluence', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q20 — Influence de la réglementation' : 'Q20 — Regulation influence'}
            description={desc('Dans quelle mesure la réglementation pèse-t-elle sur l\'usage ou l\'achat ?', 'How much does regulation weigh on usage or purchase?')} />
        </div>
        <div style={card}>
          <DonutBlock lang={lang} data={labelFreq(data.regulationRenounced, 'regulationRenounced', lang)}
            title={isFr ? 'Q21 — Renoncement réglementaire' : 'Q21 — Renounced due to regulation'}
            description={desc('A-t-on déjà renoncé à acheter ou utiliser à cause de la réglementation ?', 'Did regulation lead to giving up purchase or use?')} />
        </div>
      </div>

      {/* ─────────── Section 5 — Communauté ─────────── */}
      <SectionTitle num={5} title={t.section5} desc={SECTION_DESC[lang][5]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.socialCircle, 'socialCircle', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q22 — Entourage pratiquant' : 'Q22 — Riding circle'}
            description={desc('Nombre de personnes proches qui pratiquent également.', 'Number of close contacts who also ride.')} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.groupRides, 'groupRides', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q23 — Sorties collectives' : 'Q23 — Group rides'}
            description={desc('Fréquence de participation à des balades organisées.', 'Frequency of participation in organised rides.')} />
        </div>
        <div style={card}>
          <DonutBlock lang={lang} data={labelFreq(data.onlineCommunity, 'onlineCommunity', lang)}
            title={isFr ? 'Q24 — Communauté en ligne' : 'Q24 — Online community'}
            description={desc('Forums, Discord, groupes Facebook…', 'Forums, Discord, Facebook groups…')} />
        </div>
      </div>

      {/* ─────────── Section 6 — Perception non-utilisateurs ─────────── */}
      <SectionTitle num={6} title={t.section6} desc={SECTION_DESC[lang][6]} />
      {data.perceptionMatrix && (
        <div style={{ ...card, marginBottom: '1.5rem' }}>
          <HeatmapGrid lang={lang}
            title={isFr ? 'Q25 — Perception (curieux et jamais)' : 'Q25 — Perception (curious and never)'}
            description={desc(
              'Niveau d\'accord (1-7) avec chaque proposition, parmi les répondants qui n\'ont jamais possédé de gyroroue.',
              'Agreement level (1-7) with each statement, among respondents who never owned an EUC.'
            )}
            rows={getMatrixRows('perception', lang)}
            cols={getMatrixCols('agree', lang)}
            data={data.perceptionMatrix} />
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.futureLikelihood, 'futureLikelihood', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q26 — Probabilité d\'adoption future' : 'Q26 — Future adoption likelihood'}
            description={desc(
              'Très improbable → Très probable. Indicateur d\'intention déclarée.',
              'Very unlikely → Very likely. Self-reported intent indicator.'
            )} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.barriers, 'barriers', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q27 — Freins anticipés' : 'Q27 — Anticipated barriers'}
            description={desc(
              'Choix multiples. Ce qui empêcherait d\'utiliser une gyroroue selon les non-adoptants.',
              'Multi-choice. What would prevent non-adopters from using an EUC.'
            )} />
        </div>
      </div>

      {/* ─────────── Section 7 — MCI ─────────── */}
      <SectionTitle num={7} title={t.section7} desc={SECTION_DESC[lang][7]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={card}>
          <RadarBlock lang={lang} data={data.mciOverall}
            title={isFr ? 'MCI global — 5 dimensions' : 'Global MCI — 5 dimensions'}
            description={desc(
              'Score moyen 1-7 par dimension, tous profils confondus. Plus la surface est étendue, plus les motivations sont marquées.',
              'Mean 1-7 score per dimension, all profiles. The wider the surface, the stronger the motivations.'
            )} />
        </div>
        {data.mciByProfile && (
          <div style={card}>
            <RadarBlock lang={lang}
              comparative={[
                { name: t.activeGroup, data: data.mciByProfile.actifs || [] },
                { name: t.formerGroup, data: data.mciByProfile.anciens || [] },
                { name: t.nonUsersGroup, data: data.mciByProfile.non_users || [] },
              ].filter((g) => g.data.length > 0)}
              title={isFr ? 'MCI comparatif — 3 groupes' : 'Comparative MCI — 3 groups'}
              description={desc(
                'Superposition des trois grands segments du routage Q1 sur les 5 dimensions MCI. Lit la différence de profil motivationnel.',
                'Overlay of the three Q1-routing segments on the 5 MCI dimensions. Reads differences in motivational profile.'
              )} />
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {data.hedonicMatrix && <div style={card}><HeatmapGrid lang={lang} title={t.mciH} description={desc('Items hédoniques. Échelle 1 (désaccord) → 7 (accord).', 'Hedonic items. Scale 1 (disagree) → 7 (agree).')} rows={getMatrixRows('hedonic', lang)} cols={getMatrixCols('agree', lang)} data={data.hedonicMatrix} /></div>}
        {data.instrumentalMatrix && <div style={card}><HeatmapGrid lang={lang} title={t.mciI} description={desc('Items instrumentaux (utilité, fiabilité). Échelle 1-7.', 'Instrumental items (utility, reliability). 1-7 scale.')} rows={getMatrixRows('instrumental', lang)} cols={getMatrixCols('agree', lang)} data={data.instrumentalMatrix} /></div>}
        {data.socialMatrix && <div style={card}><HeatmapGrid lang={lang} title={t.mciS} description={desc('Items sociaux (influence, communauté). Échelle 1-7.', 'Social items (influence, community). 1-7 scale.')} rows={getMatrixRows('socialMci', lang)} cols={getMatrixCols('agree', lang)} data={data.socialMatrix} /></div>}
        {data.symbolicMatrix && <div style={card}><HeatmapGrid lang={lang} title={t.mciY} description={desc('Items symboliques (identité, image). Échelle 1-7.', 'Symbolic items (identity, image). 1-7 scale.')} rows={getMatrixRows('symbolic', lang)} cols={getMatrixCols('agree', lang)} data={data.symbolicMatrix} /></div>}
        {data.cognitiveMatrix && <div style={card}><HeatmapGrid lang={lang} title={t.mciC} description={desc('Items cognitifs (apprentissage, maîtrise). Échelle 1-7.', 'Cognitive items (learning, mastery). 1-7 scale.')} rows={getMatrixRows('cognitive', lang)} cols={getMatrixCols('agree', lang)} data={data.cognitiveMatrix} /></div>}
      </div>

      {/* ─────────── Section 8 — Démo ─────────── */}
      <SectionTitle num={8} title={t.section8} desc={SECTION_DESC[lang][8]} />
      {data.ageStats && (
        <div style={{ ...card, marginBottom: '1.5rem' }}>
          <header style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1b1f2a', margin: 0 }}>
              {isFr ? 'Q28 — Âge des répondants' : 'Q28 — Respondent age'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#6b6f7d', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
              {desc('Statistiques agrégées sur les âges renseignés.', 'Aggregated statistics over reported ages.')}
            </p>
          </header>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {[
              { label: t.medianAge, value: data.ageStats.ageMedian },
              { label: t.meanAge, value: data.ageStats.ageMean },
              { label: t.minAge, value: data.ageStats.min },
              { label: t.maxAge, value: data.ageStats.max },
              { label: t.totalAge, value: data.ageStats.ages.length },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center', minWidth: 76 }}>
                <div style={{ fontSize: '1.7rem', fontWeight: 700, color: '#d94d1a', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value ?? '—'}</div>
                <div style={{ fontSize: '0.7rem', color: '#6b6f7d', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={card}>
          <DonutBlock lang={lang} data={labelFreq(data.gender, 'gender', lang)}
            title={isFr ? 'Q29 — Genre' : 'Q29 — Gender'}
            description={desc('Répartition selon le genre déclaré.', 'Breakdown by self-reported gender.')} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.citySize, 'citySize', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q31 — Taille de la ville' : 'Q31 — City size'}
            description={desc('Type d\'agglomération de résidence.', 'Type of urban area of residence.')} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.occupation, 'occupation', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q32 — Profession' : 'Q32 — Occupation'} height={420}
            description={desc('Catégorie socioprofessionnelle déclarée.', 'Self-reported socio-professional category.')} />
        </div>
        <div style={card}>
          <BarChartBlock lang={lang} data={labelFreq(data.income, 'income', lang)} xKey="name" dataKey="value"
            title={isFr ? 'Q33 — Revenu mensuel' : 'Q33 — Monthly income'}
            description={desc('Tranche de revenu mensuel net déclaré.', 'Self-reported monthly net income bracket.')} />
        </div>
      </div>

      {/* ─────────── Section 9 — Croisements ─────────── */}
      <SectionTitle num={9} title={t.section9} desc={SECTION_DESC[lang][9]} />
      {data.crossTabChannelsProfile && data.crossTabChannelsProfile.length > 0 && (
        <div style={{ ...card, marginBottom: '1.5rem' }}>
          <CrossTabBlock lang={lang}
            data={prettyCrossTabChannels(data.crossTabChannelsProfile, lang)}
            groups={['reg', 'occ', 'ex', 'curious', 'never', 'skip']}
            title={isFr ? 'Canaux de découverte × Profil Q1' : 'Discovery channels × Q1 profile'}
            description={desc(
              'Barres empilées : pour chaque canal, contribution de chaque profil Q1. Permet de voir si certains canaux recrutent davantage tel ou tel segment.',
              'Stacked bars: for each channel, contribution of each Q1 profile. Reveals whether certain channels recruit specific segments more.'
            )} />
        </div>
      )}
      {data.crossTabAgeProfile && data.crossTabAgeProfile.length > 0 && (
        <div style={card}>
          <CrossTabBlock lang={lang}
            data={data.crossTabAgeProfile}
            groups={['reg', 'occ', 'ex', 'curious', 'never', 'skip']}
            title={isFr ? 'Tranche d\'âge × Profil Q1' : 'Age bracket × Q1 profile'}
            description={desc(
              'Distribution des âges décomposée par profil Q1.',
              'Age distribution broken down by Q1 profile.'
            )} />
        </div>
      )}
    </div>
  );
}

/**
 * The cross-tab returns categories as raw indices ("0", "1"…) for discovChannels.
 * Translate them to the option text using SURVEY metadata.
 */
function prettyCrossTabChannels(rows, lang) {
  if (!Array.isArray(rows)) return [];
  // Re-use labelFreq to get a mapping idx → label
  const idxToLabel = {};
  // We can derive labels from a single artificial freq array
  const probe = rows.map((r) => ({ key: r.category, label: r.category, count: 1 }));
  const labelled = labelFreq(probe, 'discovChannels', lang);
  rows.forEach((r, i) => { idxToLabel[r.category] = labelled[i]?.name || r.category; });
  return rows.map((r) => ({ ...r, category: idxToLabel[r.category] || r.category }));
}

const sel = { padding: '0.55rem 0.85rem', border: '1px solid #d4cfc8', borderRadius: 6, fontSize: '0.85rem', background: '#fff', fontFamily: 'inherit', color: 'var(--ink)', minWidth: 150 };
