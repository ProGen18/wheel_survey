'use client';
import React, { useState } from 'react';
import { useAdminLang } from '../layout';

const T = {
  fr: {
    title: 'Exports CSV',
    globalTitle: 'Export global',
    globalDesc: 'Tous les répondants (questionnaires complétés) — colonnes individuelles + matrices JSON aplaties + code parrain.',
    globalBtn: '📥 Exporter tous les répondants (CSV)',
    downloading: 'Téléchargement...',
    infTitle: 'Export par influenceur',
    infDesc: "Filleuls directs + indirects d'un influenceur, avec chaîne complète.",
    infPlaceholder: "ID de l'influenceur",
    infBtn: 'Exporter',
    errorPrefix: 'Erreur export: ',
  },
  en: {
    title: 'CSV Exports',
    globalTitle: 'Global export',
    globalDesc: 'All respondents (completed surveys) — individual columns + flattened JSON matrices + referrer code.',
    globalBtn: '📥 Export all respondents (CSV)',
    downloading: 'Downloading...',
    infTitle: 'Per-influencer export',
    infDesc: 'Direct + indirect referrals of an influencer, with full chain.',
    infPlaceholder: 'Influencer ID',
    infBtn: 'Export',
    errorPrefix: 'Export error: ',
  },
};

export default function ExportPage() {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [infId, setInfId] = useState('');
  const [infLoading, setInfLoading] = useState(false);
  const lang = useAdminLang();
  const t = T[lang];

  const downloadGlobal = async () => {
    setGlobalLoading(true);
    try {
      const res = await fetch('/api/admin/export/respondents');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'respondents.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(t.errorPrefix + e.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  const downloadInf = async () => {
    if (!infId.trim()) return;
    setInfLoading(true);
    try {
      const res = await fetch(`/api/admin/export/influencer/${infId.trim()}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `influencer_${infId.trim()}_filleuls.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(t.errorPrefix + e.message);
    } finally {
      setInfLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>{t.title}</h2>

      <div style={{ display: 'grid', gap: '2rem', maxWidth: '600px' }}>
        {/* Global export */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e8e5df' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>{t.globalTitle}</h3>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {t.globalDesc}
          </p>
          <button onClick={downloadGlobal} disabled={globalLoading} style={{
            padding: '0.6rem 1.25rem',
            background: 'var(--ink)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: globalLoading ? 'wait' : 'pointer',
            fontWeight: 600,
            fontFamily: 'inherit',
            opacity: globalLoading ? 0.6 : 1,
          }}>
            {globalLoading ? t.downloading : t.globalBtn}
          </button>
        </div>

        {/* Per-influencer export */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e8e5df' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>{t.infTitle}</h3>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {t.infDesc}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder={t.infPlaceholder}
              value={infId}
              onChange={(e) => setInfId(e.target.value)}
              style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #d4cfc8', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'inherit' }}
            />
            <button onClick={downloadInf} disabled={infLoading || !infId.trim()} style={{
              padding: '0.5rem 1.25rem',
              background: 'var(--ink)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: !infId.trim() || infLoading ? 'default' : 'pointer',
              fontWeight: 600,
              fontFamily: 'inherit',
              opacity: !infId.trim() || infLoading ? 0.5 : 1,
            }}>
              {infLoading ? '...' : t.infBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
