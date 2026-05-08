'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChainView from '@/components/admin/ChainView';

export default function RespondentDetailPage() {
  const params = useParams();
  const { id } = params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/respondents/${id}/chain`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!data) return <p>Répondant introuvable.</p>;

  const { responder, chain } = data;
  const answers = responder.answers || {};

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Répondant <code>{responder.code}</code>
      </h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        {responder.lang?.toUpperCase()} · Profil Q1 : {responder.filterValue || '—'} ·{' '}
        {responder.completedAt ? 'Complété le ' + new Date(responder.completedAt).toLocaleDateString('fr-FR') : 'Brouillon'}
      </p>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Chaîne ascendante</h3>
      <ChainView chain={chain} />

      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '2rem', marginBottom: '0.75rem' }}>Réponses</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
        {Object.entries(answers).map(([key, val]) => {
          if (val == null || val === '') return null;
          let display = val;
          if (typeof val === 'object') display = JSON.stringify(val, null, 1);
          else if (typeof val === 'string') display = val;
          else display = String(val);

          return (
            <div key={key} style={{ background: '#fff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e8e5df' }}>
              <div style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.25rem' }}>{key}</div>
              <div style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{display}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
