'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function InfluencersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: '20' });
    if (search) params.set('search', search);
    fetch(`/api/admin/influencers?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const form = e.target;
    const res = await fetch('/api/admin/influencers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code.value.trim(),
        label: form.label.value.trim() || null,
        expiresAt: form.expiresAt.value || null,
      }),
    });
    if (res.ok) {
      setShowCreate(false);
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error || 'Erreur à la création');
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Influenceurs</h2>
        <button onClick={() => setShowCreate(true)} style={{
          padding: '0.6rem 1.25rem',
          background: 'var(--ink)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          fontFamily: 'inherit',
        }}>
          + Créer un influenceur
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Rechercher par code ou label..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchData()}
          style={{ padding: '0.5rem 0.75rem', border: '1px solid #d4cfc8', borderRadius: '6px', fontSize: '0.85rem', width: '300px', fontFamily: 'inherit' }}
        />
        <button onClick={fetchData} style={{ padding: '0.5rem 1rem', border: '1px solid #d4cfc8', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
          Rechercher
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <form onSubmit={handleCreate} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90vw' }}>
            <h3 style={{ marginBottom: '1rem' }}>Créer un influenceur</h3>
            <label style={lbl}>Code *</label>
            <input name="code" required style={inp} placeholder="ex: INFLU_ALICE" />
            <label style={lbl}>Label</label>
            <input name="label" style={inp} placeholder="Nom ou description" />
            <label style={lbl}>Expiration</label>
            <input name="expiresAt" type="date" style={inp} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" style={{ padding: '0.6rem 1.25rem', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Créer</button>
              <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '0.6rem 1.25rem', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e8e5df' }}>
            <thead>
              <tr style={{ background: '#f8f6f1', textAlign: 'left' }}>
                <th style={th}>Code</th>
                <th style={th}>Label</th>
                <th style={th}>Langue</th>
                <th style={th}>Filleuls directs</th>
                <th style={th}>Filleuls totaux</th>
                <th style={th}>Visites</th>
                <th style={th}>Statut</th>
                <th style={th}>Créé le</th>
                <th style={th}>Expire le</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inf) => {
                const isActive = inf.isActive && (!inf.expiresAt || new Date(inf.expiresAt) > new Date());
                return (
                  <tr key={inf.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={td}><code>{inf.code}</code></td>
                    <td style={td}>{inf.label || '—'}</td>
                    <td style={td}>{inf.lang?.toUpperCase()}</td>
                    <td style={td}>{inf.directFilleuls}</td>
                    <td style={td}>{inf.totalFilleuls}</td>
                    <td style={td}>{inf.visitCount}</td>
                    <td style={td}>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem', background: isActive ? '#e8f5e9' : '#ffeaea', color: isActive ? '#2e7d32' : '#c62828' }}>
                        {isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={td}>{new Date(inf.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td style={td}>{inf.expiresAt ? new Date(inf.expiresAt).toLocaleDateString('fr-FR') : '—'}</td>
                    <td style={td}>
                      <Link href={`/admin/influencers/${inf.id}`} style={{ fontSize: '0.8rem', color: 'var(--ember)' }}>Voir arbre</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} style={{
                  padding: '0.4rem 0.8rem', border: p === page ? '2px solid var(--ember)' : '1px solid #ddd', borderRadius: '6px',
                  background: p === page ? 'rgba(217,77,26,0.05)' : '#fff', cursor: 'pointer', fontWeight: p === page ? 700 : 400,
                }}>
                  {p}
                </button>
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
const lbl = { display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', marginTop: '0.75rem', color: '#555', fontFamily: 'inherit' };
const inp = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d4cfc8', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' };
