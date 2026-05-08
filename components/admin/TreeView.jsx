'use client';
import React, { useState } from 'react';

function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.directFilleuls > 0 || (node.children && node.children.length > 0);
  const children = node.children || [];

  return (
    <div style={{ marginLeft: depth > 0 ? '1.5rem' : 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.5rem',
          borderRadius: '6px',
          cursor: hasChildren ? 'pointer' : 'default',
          background: depth === 0 ? '#f0ede6' : 'transparent',
          fontWeight: depth === 0 ? 600 : 400,
          fontSize: depth === 0 ? '0.95rem' : '0.88rem',
          borderLeft: depth > 0 ? '2px solid #e0dcd4' : 'none',
        }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren && <span style={{ fontSize: '0.7rem', width: '1rem' }}>{open ? '▼' : '▶'}</span>}
        <span style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: node.nodeType === 'INFLUENCER' ? 'var(--ember)' : node.completedAt ? 'var(--teal)' : '#999',
          flexShrink: 0,
        }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>{node.code}</span>
        {node.label && <span style={{ color: '#666', fontSize: '0.8rem' }}>({node.label})</span>}
        <span style={{ fontSize: '0.75rem', color: '#aaa', marginLeft: 'auto' }}>
          {node.directFilleuls > 0 ? `${node.directFilleuls} filleul${node.directFilleuls > 1 ? 's' : ''}` : ''}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#ccc' }}>{node.lang?.toUpperCase()}</span>
      </div>
      {open && hasChildren && children.map((child) => (
        <TreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function TreeView({ tree = [] }) {
  if (!tree || tree.length === 0) return <p style={{ color: '#999', fontStyle: 'italic' }}>Arbre vide</p>;

  // Build tree structure from flat list
  const root = tree.find((n) => n.depth === 0);
  if (!root) return <p style={{ color: '#999' }}>Nœud racine introuvable</p>;

  const buildChildren = (parentId) => {
    return tree
      .filter((n) => n.parentId === parentId)
      .map((n) => ({ ...n, children: buildChildren(n.id) }));
  };

  const rootWithChildren = { ...root, children: buildChildren(root.id) };

  return (
    <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '0.5rem 0' }}>
      <TreeNode node={rootWithChildren} />
    </div>
  );
}
