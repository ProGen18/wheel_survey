'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const FILTER_LABELS = {
  reg: 'Réguliers', occ: 'Occasionnels', ex: 'Anciens',
  curious: 'Curieux', never: 'Jamais', skip: 'Sans réponse',
};

export default function RespondentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [fProfile, setFProfile] = useState('');
  const [fLang, setFLang] = useState('');

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: '20' });
    if (search) params.set('search', search);
    if (fProfile) params.set('filterValue', fProfile);
    if (fLang) params.set('lang', fLang);
    fetch(`/api/admin/respondents?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Répondants</h2>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input placeholder="Recherche code/pays..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', border: '1px solid #d4cfc8', borderRadius: '6px', fontSize: '0.85rem', width: '220px', fontFamily: 'inherit' }} />
        <select value={fProfile} onChange={(e) => setFProfile(e.target.value)} style={sel}>
          <option value="">Tous les profils</option>
          {Object.entries(FILTER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={fLang} onChange={(e) => setFLang(e.target.value)} style={sel}>
          <option value="">Toutes langues</option>
          <option value="fr">FR</option><option value="en">EN</option><option value="ru">RU</option><option value="zh">ZH</option>
        </select>
        <button onClick={() => { setPage(1); fetchData(); }} style={{ padding: '0.5rem 1rem', border: '1px solid #d4cfc8', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
          Filtrer
        </button>
      </div>

      {loading ? <p>Chargement...</p> : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e8e5df' }}>
            <thead>
              <tr style={{ background: '#f8f6f1', textAlign: 'left' }}>
                <th style={th}>Code</th>
                <th style={th}>Langue</th>
                <th style={th}>Profil Q1</th>
                <th style={th}>Parrain</th>
                <th style={th}>Pays</th>
                <th style={th}>Âge</th>
                <th style={th}>Date</th>
                <th style={th}>Complété</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={td}><code>{r.code}</code></td>
                  <td style={td}>{r.lang?.toUpperCase()}</td>
                  <td style={td}>{FILTER_LABELS[r.filterValue] || r.filterValue}</td>
                  <td style={td}>{r.parentCode || '—'}</td>
                  <td style={td}>{r.country || '—'}</td>
                  <td style={td}>{r.age || '—'}</td>
                  <td style={td}>{new Date(r.startedAt).toLocaleDateString('fr-FR')}</td>
                  <td style={td}>{r.completedAt ? '✅' : '⏳ Brouillon'}</td>
                  <td style={td}>
                    <Link href={`/admin/respondents/${r.nodeId}`} style={{ color: 'var(--ember)', fontSize: '0.8rem' }}>
                      Voir chaîne
                    </Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: '#999' }}>Aucun répondant trouvé</td></tr>}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} style={{
                  padding: '0.4rem 0.8rem', border: p === page ? '2px solid var(--ember)' : '1px solid #ddd', borderRadius: '6px',
                  background: p === page ? 'rgba(217,77,26,0.05)' : '#fff', cursor: 'pointer', fontWeight: p === page ? 700 : 400,
                }}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const th = { padding: '0.6rem 0.75rem', fontWeight: 600, color: '#555', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' };
const td = { padding: '0.5rem 0.75rem', verticalAlign: 'middle' };
const sel = { padding: '0.5rem 0.75rem', border: '1px solid #d4cfc8', borderRadius: '6px', fontSize: '0.85rem', background: '#fff', fontFamily: 'inherit' };
