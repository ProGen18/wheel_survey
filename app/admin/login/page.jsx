'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        const redirect = params.get('redirect') || '/admin';
        router.push(redirect);
      } else {
        setError(data.error === 'invalid_password' ? 'Identifiants incorrects' : 'Erreur serveur');
        if (data.remaining !== undefined) setRemaining(data.remaining);
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg, #f4ede1)',
      fontFamily: "'Inter Tight', sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '360px',
      }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>
          Gyroroue Admin
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
          Accès sécurisé au dashboard
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          autoFocus
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '1px solid #d4cfc8',
            borderRadius: '8px',
            fontSize: '1rem',
            marginBottom: '1rem',
            fontFamily: 'inherit',
          }}
        />

        {error && (
          <p style={{ color: 'var(--ember)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            {error}
            {remaining != null && remaining > 0 && ` (${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''})`}
            {remaining === 0 && ' — Compte bloqué 1 heure'}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'var(--ink, #1b1f2a)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading || !password ? 0.6 : 1,
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
