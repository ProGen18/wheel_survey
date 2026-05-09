'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CookieContext = createContext();
const STORAGE_KEY = 'gyro_cookie_consent';

export function CookieProvider({ children }) {
  const [consent, setConsent] = useState('pending'); // 'pending' | 'accepted' | 'refused'

  useEffect(() => {
    const stored = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; } })();
    if (stored === 'accepted' || stored === 'refused') {
      setConsent(stored);
    }
  }, []);

  const updateConsent = useCallback((value) => {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (_) {}
    setConsent(value);
  }, []);

  return (
    <CookieContext.Provider value={{ consent, setConsent: updateConsent }}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieContext);
  if (!ctx) throw new Error('useCookieConsent must be used within CookieProvider');
  return ctx;
}
