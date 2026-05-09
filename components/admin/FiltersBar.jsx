'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const TXT = {
  fr: {
    allProfiles: 'Tous les profils',
    allPeriods: 'Toute période',
    days90: '90 derniers jours',
    days30: '30 derniers jours',
    days7: '7 derniers jours',
    allLangs: 'Toutes les langues',
    french: 'Français',
    english: 'English',
    russian: 'Русский',
    chinese: '中文',
    reg: 'Réguliers',
    occ: 'Occasionnels',
    ex: 'Anciens',
    curious: 'Curieux',
    never: 'Jamais',
    skip: 'Sans réponse',
  },
  en: {
    allProfiles: 'All profiles',
    allPeriods: 'All periods',
    days90: 'Last 90 days',
    days30: 'Last 30 days',
    days7: 'Last 7 days',
    allLangs: 'All languages',
    french: 'Français',
    english: 'English',
    russian: 'Русский',
    chinese: '中文',
    reg: 'Regular',
    occ: 'Occasional',
    ex: 'Former',
    curious: 'Curious',
    never: 'Never',
    skip: 'No answer',
  },
};

const FILTER_PROFILES = ['', 'reg', 'occ', 'ex', 'curious', 'never', 'skip'];
const PERIODS = ['', '90', '30', '7'];

export default function FiltersBar({ onFilter, showProfile = true, showPeriod = true, showLang = true, lang = 'fr' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = TXT[lang] || TXT.fr;

  const currentProfile = searchParams.get('profile') || '';
  const currentPeriod = searchParams.get('period') || '';
  const currentLang = searchParams.get('lang') || '';

  const update = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
    if (onFilter) onFilter();
  };

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      alignItems: 'center',
      padding: '1rem',
      background: '#fff',
      borderRadius: '10px',
      border: '1px solid #e8e5df',
      marginBottom: '1.5rem',
    }}>
      {showProfile && (
        <select
          value={currentProfile}
          onChange={(e) => update('profile', e.target.value)}
          style={selectStyle}
        >
          <option value="">{t.allProfiles}</option>
          {FILTER_PROFILES.filter(Boolean).map((v) => <option key={v} value={v}>{t[v] || v}</option>)}
        </select>
      )}
      {showPeriod && (
        <select
          value={currentPeriod}
          onChange={(e) => update('period', e.target.value)}
          style={selectStyle}
        >
          <option value="">{t.allPeriods}</option>
          {PERIODS.filter(Boolean).map((v) => {
            const labels = { '90': t.days90, '30': t.days30, '7': t.days7 };
            return <option key={v} value={v}>{labels[v] || v}</option>;
          })}
        </select>
      )}
      {showLang && (
        <select
          value={currentLang}
          onChange={(e) => update('lang', e.target.value)}
          style={selectStyle}
        >
          <option value="">{t.allLangs}</option>
          <option value="fr">{t.french}</option>
          <option value="en">{t.english}</option>
          <option value="ru">{t.russian}</option>
          <option value="zh">{t.chinese}</option>
        </select>
      )}
    </div>
  );
}

const selectStyle = {
  padding: '0.5rem 0.75rem',
  border: '1px solid #d4cfc8',
  borderRadius: '6px',
  fontSize: '0.85rem',
  background: '#fff',
  color: 'var(--ink)',
  cursor: 'pointer',
  minWidth: '150px',
  fontFamily: 'inherit',
};
