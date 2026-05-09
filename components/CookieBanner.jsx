'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { I18N } from './i18n';
import { useCookieConsent } from './CookieContext';
import s from './Gate.module.css';

export default function CookieBanner() {
  const { consent, setConsent } = useCookieConsent();
  const pathname = usePathname();
  const isRgpdPage = pathname === '/rgpd';

  const [lang, setLang] = useState('fr');
  const [showPanel, setShowPanel] = useState(false);
  const [analyticsOpt, setAnalyticsOpt] = useState(false);

  useEffect(() => {
    const docLang = document.documentElement.lang;
    if (docLang && I18N[docLang]) setLang(docLang);
  }, []);

  const blocking = consent !== 'accepted' && !isRgpdPage;

  useEffect(() => {
    if (!blocking) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => { html.style.overflow = prev; };
  }, [blocking]);

  const handleAccept = useCallback(() => {
    setConsent('accepted');
    setShowPanel(false);
  }, [setConsent]);

  const handleRefuse = useCallback(() => {
    setConsent('refused');
    setShowPanel(false);
  }, [setConsent]);

  const handleSavePreferences = useCallback(() => {
    try { localStorage.setItem('gyro_cookie_analytics', analyticsOpt ? '1' : '0'); } catch (_) {}
    setConsent('accepted');
    setShowPanel(false);
  }, [setConsent, analyticsOpt]);

  const handleModifyChoice = useCallback(() => {
    setConsent('pending');
  }, [setConsent]);

  const T = I18N[lang]?.cookies ?? I18N.fr.cookies;

  if (consent === 'accepted') return null;

  const PendingActions = (
    <>
      <button type="button" className="btn" onClick={handleAccept}>
        {T.accept}
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => setShowPanel((v) => !v)}>
        {T.customize}
      </button>
      <button type="button" className="btn btn-ghost" onClick={handleRefuse}>
        {T.refuse}
      </button>
    </>
  );

  const Panel = showPanel && (
    <div className={s.modalBackdrop} onClick={() => setShowPanel(false)}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="gate-modal-title">
        <h3 id="gate-modal-title" className={s.modalTitle}>{T.customize}</h3>

        <div className={s.modalRow}>
          <div className={s.modalInfo}>
            <span className={s.modalLabel}>{T.functional}</span>
            <span className={s.modalDesc}>{T.functionalDesc}</span>
          </div>
          <span className={`${s.toggle} ${s.toggleDisabled}`} aria-label={`${T.functional} — ${T.mandatory}`}>
            <span className={s.toggleKnob} />
          </span>
          <span className={`${s.badge} ${s.badgeMandatory}`}>{T.mandatory}</span>
        </div>

        <div className={s.modalRow}>
          <div className={s.modalInfo}>
            <span className={s.modalLabel}>{T.analytics}</span>
            <span className={s.modalDesc}>{T.analyticsDesc}</span>
          </div>
          <button
            type="button"
            className={`${s.toggle} ${analyticsOpt ? s.toggleActive : ''}`}
            onClick={() => setAnalyticsOpt((v) => !v)}
            aria-pressed={analyticsOpt}
            aria-label={`${T.analytics} — ${T.optional}`}
          >
            <span className={s.toggleKnob} />
          </button>
        </div>

        <div className={s.modalActions}>
          <button type="button" className="btn" onClick={handleSavePreferences}>
            {T.savePreferences}
          </button>
        </div>
      </div>
    </div>
  );

  // Refused — full block off-RGPD, persistent notice on RGPD
  if (consent === 'refused') {
    if (isRgpdPage) {
      return (
        <aside className={s.notice} role="alertdialog" aria-labelledby="gate-rgpd-text">
          <p id="gate-rgpd-text" className={s.noticeText}>{T.blockedText}</p>
          <div className={s.noticeActions}>
            <button type="button" className="btn" onClick={handleModifyChoice}>
              {T.modifyChoice}
            </button>
          </div>
        </aside>
      );
    }
    return (
      <div className={s.gate} role="alertdialog" aria-modal="true" aria-labelledby="gate-blocked-title">
        <div className={s.gateBox}>
          <h2 id="gate-blocked-title" className={s.gateTitle}>{T.blockedTitle}</h2>
          <p className={s.gateText}>{T.blockedText}</p>
          <div className={s.gateActions}>
            <button type="button" className="btn" onClick={handleModifyChoice}>
              {T.modifyChoice}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pending — non-blocking notice on RGPD, blocking gate elsewhere
  if (isRgpdPage) {
    return (
      <>
        <aside className={s.notice} role="alertdialog" aria-labelledby="gate-text">
          <p id="gate-text" className={s.noticeText}>{T.text}</p>
          <div className={s.noticeActions}>{PendingActions}</div>
        </aside>
        {Panel}
      </>
    );
  }

  return (
    <>
      <div className={s.gate} role="alertdialog" aria-modal="true" aria-labelledby="gate-pending-title" aria-describedby="gate-pending-text">
        <div className={s.gateBox}>
          <h2 id="gate-pending-title" className={s.gateTitle}>{T.gateTitle}</h2>
          <p id="gate-pending-text" className={s.gateText}>{T.text}</p>
          <div className={s.gateActions}>{PendingActions}</div>
        </div>
      </div>
      {Panel}
    </>
  );
}
