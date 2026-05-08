'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TreeView from '@/components/admin/TreeView';

export default function InfluencerDetailPage() {
  const params = useParams();
  const { id } = params;
  const [inf, setInf] = useState(null);
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/admin/influencers/${id}`).then((r) => r.json()),
      fetch(`/api/admin/influencers/${id}/tree`).then((r) => r.json()),
    ])
      .then(([infData, treeData]) => {
        setInf(infData);
        setTree(treeData.tree || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!inf) return <p>Influenceur introuvable.</p>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <code>{inf.code}</code>
        </h2>
        {inf.label && <p style={{ color: '#666', marginBottom: '0.5rem' }}>{inf.label}</p>}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <Stat label="Filleuls directs" value={inf.directFilleuls} />
          <Stat label="Filleuls totaux" value={inf.totalFilleuls} />
          <Stat label="Questionnaires complétés" value={inf.completedFilleuls} />
          <Stat label="Visites" value={inf.visitCount} />
          <Stat label="Langue" value={inf.lang?.toUpperCase()} />
          <Stat label="Statut" value={inf.isActive && (!inf.expiresAt || new Date(inf.expiresAt) > new Date()) ? 'Actif' : 'Inactif'} />
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Arbre de parrainage</h3>
      <TreeView tree={tree} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{value}</div>
    </div>
  );
}
