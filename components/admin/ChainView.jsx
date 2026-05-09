'use client';
import React from 'react';

const TXT = {
  fr: { empty: 'Chaîne vide', influencer: 'Influenceur', respondent: 'Répondant' },
  en: { empty: 'Empty chain', influencer: 'Influencer', respondent: 'Respondent' },
};

export default function ChainView({ chain = [], lang = 'fr' }) {
  const t = TXT[lang] || TXT.fr;

  if (!chain || chain.length === 0) return <p style={{ color: '#999', fontStyle: 'italic' }}>{t.empty}</p>;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.25rem',
      padding: '1rem',
      background: '#fff',
      borderRadius: '10px',
      border: '1px solid #e8e5df',
    }}>
      {chain.map((node, i) => (
        <React.Fragment key={node.id}>
          {i > 0 && <span style={{ color: '#ccc', fontWeight: 700, fontSize: '1.1rem' }}>→</span>}
          <div style={{
            padding: '0.5rem 0.75rem',
            background: node.nodeType === 'INFLUENCER' ? 'rgba(217,77,26,0.08)' : 'rgba(30,74,71,0.08)',
            borderRadius: '8px',
            border: `2px solid ${node.nodeType === 'INFLUENCER' ? 'var(--ember)' : 'var(--teal)'}`,
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600 }}>
              {node.code}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#888' }}>
              {node.nodeType === 'INFLUENCER' ? t.influencer : t.respondent}
              {node.label ? ` — ${node.label}` : ''}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
