'use client';

import { useState, useEffect, useRef } from 'react';
import { I18N } from './i18n';

const STORAGE_KEY = 'gyro_cookies_ok';
const TWEAKS_STORAGE_KEY = '__tweaks_persistence';
const LANGUAGE_CHANGE_EVENT = 'gyro:languagechange';
const SUPPORTED_LANGS = Object.keys(I18N).filter((lang) => I18N[lang]?.cookie);

function normalizeLang(value) {
  if (typeof value !== 'string') return null;
  const lang = value.split('-')[0]?.toLowerCase();
  return SUPPORTED_LANGS.includes(lang) ? lang : null;
}

function getStoredLang() {
  try {
    const saved = localStorage.getItem(TWEAKS_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    return normalizeLang(parsed?.lang);
  } catch (_) {
    return null;
  }
}

function getBrowserLang() {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    const normalized = normalizeLang(lang);
    if (normalized) return normalized;
  }
  return null;
}

function getDocumentLang() {
  return normalizeLang(document.documentElement.lang);
}

function getCurrentLang() {
  return getStoredLang() ?? getDocumentLang() ?? getBrowserLang() ?? 'en';
}

export default function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lang, setLang] = useState('en');
  const timeoutRef = useRef(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch (_) {}

    setLang(getCurrentLang());

    setMounted(true);

    const syncLang = (event) => {
      setLang(normalizeLang(event.detail?.lang) ?? getCurrentLang());
    };
    const syncStoredLang = (event) => {
      if (event.key === TWEAKS_STORAGE_KEY) setLang(getCurrentLang());
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, syncLang);
    window.addEventListener('storage', syncStoredLang);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, syncLang);
      window.removeEventListener('storage', syncStoredLang);
    };
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
    timeoutRef.current = setTimeout(() => setMounted(false), 380);
  };

  if (!mounted) return null;

  const T = I18N[lang]?.cookie ?? I18N.fr.cookie;

  return (
    <div
      className={`cookie-banner${dismissed ? ' is-dismissed' : ''}`}
      role="note"
      dir={lang === 'ar' ? 'rtl' : undefined}
      aria-label={T.label ?? I18N.en.cookie.label}
    >
      <p>{T.text}</p>
      <button type="button" className="cookie-btn" onClick={handleDismiss}>
        {T.btn}
      </button>
    </div>
  );
}
