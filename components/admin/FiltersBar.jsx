'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const FILTER_PROFILES = [
  { value: '', label: 'Tous les profils' },
  { value: 'reg', label: 'Réguliers' },
  { value: 'occ', label: 'Occasionnels' },
  { value: 'ex', label: 'Anciens' },
  { value: 'curious', label: 'Curieux' },
  { value: 'never', label: 'Jamais' },
  { value: 'skip', label: 'Sans réponse' },
];

const PERIODS = [
  { value: '', label: 'Toute période' },
  { value: '90', label: '90 derniers jours' },
  { value: '30', label: '30 derniers jours' },
  { value: '7', label: '7 derniers jours' },
];

export default function FiltersBar({ onFilter, showProfile = true, showPeriod = true, showLang = true }) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
          {FILTER_PROFILES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      )}
      {showPeriod && (
        <select
          value={currentPeriod}
          onChange={(e) => update('period', e.target.value)}
          style={selectStyle}
        >
          {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      )}
      {showLang && (
        <select
          value={currentLang}
          onChange={(e) => update('lang', e.target.value)}
          style={selectStyle}
        >
          <option value="">Toutes les langues</option>
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="ru">Русский</option>
          <option value="zh">中文</option>
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
