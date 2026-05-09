'use client';
import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminLang } from '../layout';

const T = {
  fr: {
    title: 'Gyroroue Admin',
    subtitle: 'Accès sécurisé au dashboard',
    password: 'Mot de passe',
    invalid: 'Identifiants incorrects',
    serverError: 'Erreur serveur',
    networkError: 'Erreur réseau',
    sessionExpired: 'Session expirée, veuillez réessayer',
    locked: 'Compte bloqué 1 heure',
    attempts: 'tentative',
    attemptsPl: 'tentatives',
    remaining: 'restante',
    remainingPl: 'restantes',
    signIn: 'Se connecter',
    signingIn: 'Connexion...',
    loading: 'Chargement...',
  },
  en: {
    title: 'Gyroroue Admin',
    subtitle: 'Secure dashboard access',
    password: 'Password',
    invalid: 'Incorrect credentials',
    serverError: 'Server error',
    networkError: 'Network error',
    sessionExpired: 'Session expired, please try again',
    locked: 'Account locked for 1 hour',
    attempts: 'attempt',
    attemptsPl: 'attempts',
    remaining: 'remaining',
    remainingPl: 'remaining',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    loading: 'Loading...',
  },
};

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? match[1] : '';
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const lang = useAdminLang();
  const t = T[lang];

  // Fetch CSRF token on mount
  useEffect(() => {
    fetch('/api/admin/auth/login')
      .then(() => {
        setCsrfToken(getCsrfToken());
      })
      .catch(() => {
        // Non-blocking: if GET fails, csrfToken stays empty and POST will fail with csrf_invalid
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || getCsrfToken(),
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        const redirect = params.get('redirect') || '/admin';
        router.push(redirect);
      } else {
        if (data.error === 'csrf_invalid') {
          // Refresh token and let user retry
          setError(t.sessionExpired);
          setCsrfToken('');
          fetch('/api/admin/auth/login').then(() => setCsrfToken(getCsrfToken()));
        } else {
          setError(data.error === 'invalid_password' ? t.invalid : t.serverError);
        }
        if (data.remaining !== undefined) setRemaining(data.remaining);
      }
    } catch {
      setError(t.networkError);
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
          {t.title}
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
          {t.subtitle}
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t.password}
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
            {remaining != null && remaining > 0 && ` (${remaining} ${remaining > 1 ? t.attemptsPl : t.attempts} ${remaining > 1 ? t.remainingPl : t.remaining})`}
            {remaining === 0 && ` — ${t.locked}`}
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
          {loading ? t.signingIn : t.signIn}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  const lang = useAdminLang();
  const t = T[lang];
  return (
    <Suspense fallback={<p style={{textAlign:'center',padding:'3rem',color:'#666'}}>{t.loading}</p>}>
      <LoginForm />
    </Suspense>
  );
}
