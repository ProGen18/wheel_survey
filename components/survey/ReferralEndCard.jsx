'use client';
import React, { useState, useCallback } from 'react';

export default function ReferralEndCard({ lang, referralCode, referralLink }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const input = document.createElement('input');
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [referralLink]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;

  return (
    <div className="ref-end-card">
      <div className="ref-thankyou">
        <h2 className="display-l">{t.title}</h2>
        <p className="lede">{t.lede}</p>
      </div>

      <div className="ref-link-box">
        <p className="ref-label">{t.share}</p>
        <div className="ref-input-row">
          <input
            type="text"
            className="ref-link-input"
            value={referralLink}
            readOnly
            onClick={(e) => e.target.select()}
          />
          <button className="btn ref-copy-btn" onClick={handleCopy}>
            {copied ? t.copied : t.copy}
          </button>
        </div>
        {copied && <span className="ref-copied-toast">{t.confirm}</span>}
        <p className="ref-code-info">{t.code} <strong>{referralCode}</strong></p>
      </div>

      <p className="ref-note">{t.note}</p>
    </div>
  );
}

const TRANSLATIONS = {
  fr: {
    title: 'Merci pour votre participation !',
    lede: 'Vos réponses ont bien été enregistrées. Partagez ce lien avec vos contacts pour faire grandir la communauté !',
    share: 'Votre lien de parrainage :',
    copy: 'Copier le lien',
    copied: 'Copié !',
    confirm: 'Lien copié !',
    code: 'Votre code :',
    note: 'Chaque personne qui répondra via votre lien sera reliée à vous dans l\'arbre de l\'étude. Une fois le questionnaire terminé via votre lien, son code personnel lui sera remis.',
  },
  en: {
    title: 'Thank you for participating!',
    lede: 'Your responses have been recorded. Share this link with others to grow the community!',
    share: 'Your referral link:',
    copy: 'Copy link',
    copied: 'Copied!',
    confirm: 'Link copied!',
    code: 'Your code:',
    note: 'Everyone who answers via your link will be connected to you in the study tree. Once the questionnaire is completed via your link, their personal code will be given to them.',
  },
};
