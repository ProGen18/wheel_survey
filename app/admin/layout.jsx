'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/admin', label: 'Vue d\'ensemble', en: 'Overview' },
  { href: '/admin/links', label: 'Liens', en: 'Links' },
  { href: '/admin/influencers', label: 'Influenceurs', en: 'Influencers' },
  { href: '/admin/respondents', label: 'Répondants', en: 'Respondents' },
  { href: '/admin/stats', label: 'Statistiques', en: 'Stats' },
  { href: '/admin/export', label: 'Exports', en: 'Exports' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f7f6f3',
      fontFamily: "'Inter Tight', 'Inter', sans-serif",
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        background: 'var(--ink, #1b1f2a)',
        color: '#fff',
        padding: '1.5rem 0',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '0 1.25rem', marginBottom: '2rem' }}>
          <Link href="/admin" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.15rem', fontWeight: 700 }}>
            Gyroroue
          </Link>
          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>Dashboard admin</div>
        </div>

        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'block',
                  padding: '0.6rem 1.25rem',
                  color: active ? '#fff' : '#999',
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  borderLeft: active ? '3px solid var(--ember)' : '3px solid transparent',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'all 0.15s',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>
            ← Retour au questionnaire
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#aaa',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
