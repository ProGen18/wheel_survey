'use client';

import { useState, useEffect } from 'react';
import { I18N } from './i18n';

const STORAGE_KEY = 'gyro_cookies_ok';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lang, setLang] = useState('fr');

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch (_) {}

    const supported = ['fr', 'en'];
    const bl = (navigator.languages?.[0] ?? navigator.language ?? 'fr')
      .split('-')[0]
      .toLowerCase();
    if (supported.includes(bl)) setLang(bl);

    setVisible(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
    setTimeout(() => setVisible(false), 380);
  };

  if (!visible) return null;

  const T = I18N[lang]?.cookie ?? I18N.fr.cookie;

  return (
    <div
      className={`cookie-banner${dismissed ? ' is-dismissed' : ''}`}
      role="note"
      aria-label={lang === 'fr' ? 'Information cookies' : 'Cookie information'}
    >
      <p>{T.text}</p>
      <button type="button" className="cookie-btn" onClick={handleDismiss}>
        {T.btn}
      </button>
    </div>
  );
}
