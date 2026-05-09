'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAdminLang } from '../../layout';
import TreeView from '@/components/admin/TreeView';

const T = {
  fr: {
    directFilleuls: 'Filleuls directs',
    totalFilleuls: 'Filleuls totaux',
    completed: 'Questionnaires complétés',
    visits: 'Visites',
    language: 'Langue',
    status: 'Statut',
    active: 'Actif',
    inactive: 'Inactif',
    refTree: 'Arbre de parrainage',
    loading: 'Chargement...',
    notFound: 'Influenceur introuvable.',
  },
  en: {
    directFilleuls: 'Direct referrals',
    totalFilleuls: 'Total referrals',
    completed: 'Completed surveys',
    visits: 'Visits',
    language: 'Language',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    refTree: 'Referral tree',
    loading: 'Loading...',
    notFound: 'Influencer not found.',
  },
};

export default function InfluencerDetailPage() {
  const params = useParams();
  const { id } = params;
  const [inf, setInf] = useState(null);
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const lang = useAdminLang();
  const t = T[lang];

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

  if (loading) return <p>{t.loading}</p>;
  if (!inf) return <p>{t.notFound}</p>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <code>{inf.code}</code>
        </h2>
        {inf.label && <p style={{ color: '#666', marginBottom: '0.5rem' }}>{inf.label}</p>}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <Stat label={t.directFilleuls} value={inf.directFilleuls} />
          <Stat label={t.totalFilleuls} value={inf.totalFilleuls} />
          <Stat label={t.completed} value={inf.completedFilleuls} />
          <Stat label={t.visits} value={inf.visitCount} />
          <Stat label={t.language} value={inf.lang?.toUpperCase()} />
          <Stat label={t.status} value={inf.isActive && (!inf.expiresAt || new Date(inf.expiresAt) > new Date()) ? t.active : t.inactive} />
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>{t.refTree}</h3>
      <TreeView lang={lang} tree={tree} />
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
