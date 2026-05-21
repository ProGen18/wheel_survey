'use client';

import { useState, useEffect, useRef } from 'react';
import { I18N } from './i18n';

const STORAGE_KEY = 'gyro_cookies_ok';

export default function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lang, setLang] = useState('fr');
  const timeoutRef = useRef(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch (_) {}

    const supported = ['fr', 'en', 'ru', 'zh', 'ar'];
    const bl = (navigator.languages?.[0] ?? navigator.language ?? 'fr')
      .split('-')[0]
      .toLowerCase();
    if (supported.includes(bl)) setLang(bl);

    setMounted(true);

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
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
      aria-label={lang === 'fr' ? 'Information cookies' : 'Cookie information'}
    >
      <p>{T.text}</p>
      <button type="button" className="cookie-btn" onClick={handleDismiss}>
        {T.btn}
      </button>
    </div>
  );
}
