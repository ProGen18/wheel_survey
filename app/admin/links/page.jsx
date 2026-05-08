'use client';
import React, { useEffect, useState } from 'react';

const STATUS = { active: 'Actif', expired: 'Expiré', revoked: 'Révoqué' };

export default function LinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({ type: '', status: '', lang: '' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: '20' });
    if (filter.type) params.set('type', filter.type);
    if (filter.status) params.set('status', filter.status);
    if (filter.lang) params.set('lang', filter.lang);

    fetch(`/api/admin/links?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setLinks(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filter]);

  const handleAction = async (id, action) => {
    if (!confirm(`Confirmer : ${action === 'revoke' ? 'révoquer' : 'régénérer'} ce lien ?`)) return;
    await fetch(`/api/admin/links/${id}/${action}`, { method: 'PUT' });
    // Refresh
    const params = new URLSearchParams({ page, limit: '20' });
    const res = await fetch(`/api/admin/links?${params}`);
    const data = await res.json();
    setLinks(data.items || []);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Gestion des liens</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <select value={filter.type} onChange={(e) => { setFilter({ ...filter, type: e.target.value }); setPage(1); }} style={selectStyle}>
          <option value="">Tous les types</option>
          <option value="INFLUENCER">Influenceurs</option>
          <option value="RESPONDENT">Répondants</option>
        </select>
        <select value={filter.status} onChange={(e) => { setFilter({ ...filter, status: e.target.value }); setPage(1); }} style={selectStyle}>
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="expired">Expirés</option>
          <option value="revoked">Révoqués</option>
        </select>
        <select value={filter.lang} onChange={(e) => { setFilter({ ...filter, lang: e.target.value }); setPage(1); }} style={selectStyle}>
          <option value="">Toutes les langues</option>
          <option value="fr">FR</option>
          <option value="en">EN</option>
          <option value="ru">RU</option>
          <option value="zh">ZH</option>
        </select>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', background: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e8e5df' }}>
            <thead>
              <tr style={{ background: '#f8f6f1', textAlign: 'left' }}>
                <th style={th}>Code</th>
                <th style={th}>Type</th>
                <th style={th}>Parrain</th>
                <th style={th}>Filleuls directs</th>
                <th style={th}>Visites</th>
                <th style={th}>Statut</th>
                <th style={th}>Créé le</th>
                <th style={th}>Expire le</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={td}><code>{link.code}</code></td>
                  <td style={td}>{link.nodeType === 'INFLUENCER' ? 'Influenceur' : 'Répondant'}</td>
                  <td style={td}>{link.parentCode || '—'}</td>
                  <td style={td}>{link.directFilleuls}</td>
                  <td style={td}>{link.visitCount}</td>
                  <td style={td}>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      background: link.isActive && (!link.expiresAt || new Date(link.expiresAt) > new Date()) ? '#e8f5e9' : '#ffeaea',
                      color: link.isActive && (!link.expiresAt || new Date(link.expiresAt) > new Date()) ? '#2e7d32' : '#c62828',
                    }}>
                      {link.isActive && (!link.expiresAt || new Date(link.expiresAt) > new Date()) ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={td}>{new Date(link.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td style={td}>{link.expiresAt ? new Date(link.expiresAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td style={td}>
                    <button onClick={() => handleAction(link.id, 'revoke')} style={actionBtn}>Révoquer</button>
                    <button onClick={() => handleAction(link.id, 'regenerate')} style={actionBtn}>Régénérer</button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: '#999' }}>Aucun lien trouvé</td></tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} style={{
                  padding: '0.4rem 0.8rem',
                  border: p === page ? '2px solid var(--ember)' : '1px solid #ddd',
                  borderRadius: '6px',
                  background: p === page ? 'rgba(217,77,26,0.05)' : '#fff',
                  cursor: 'pointer',
                  fontWeight: p === page ? 700 : 400,
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
const selectStyle = { padding: '0.5rem 0.75rem', border: '1px solid #d4cfc8', borderRadius: '6px', fontSize: '0.85rem', background: '#fff', fontFamily: 'inherit', color: 'var(--ink)' };
const actionBtn = { marginRight: '0.25rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' };
