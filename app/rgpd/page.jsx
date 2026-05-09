'use client';

import Link from 'next/link';
import { RGPD_CONTENT } from '@/components/rgpd-content';
import { useTweaks, TWEAK_DEFAULTS, SurveyTweaks } from '@/components/survey-tweaks';

const emailLabels = { fr: 'Courriel : ', en: 'Email: ', ru: 'Email: ', zh: '邮箱: ' };
const lastUpdatedLabel = { fr: 'Dernière mise à jour : ', en: 'Last updated: ', ru: 'Последнее обновление: ', zh: '最后更新: ' };

export default function RGPDPage() {
  const [tweaks, setTweaks] = useTweaks(TWEAK_DEFAULTS);
  const { lang } = tweaks;

  const content = RGPD_CONTENT[lang] || RGPD_CONTENT.fr;

  return (
    <>
      <main className="rgpd-page">
        <article className="rgpd-article">
          <Link href="/" className="rgpd-back link-ghost">
            {content.back}
          </Link>

          <h1 className="display-l rgpd-title">{content.title}</h1>

          <p className="lede rgpd-lede">
            {lastUpdatedLabel[lang]}
            {content.lastUpdated}
          </p>

          {content.sections.map((section, idx) => (
            <div key={idx} className="rgpd-section">
              <h2 className="h-section rgpd-h">{section.title}</h2>

              {section.paragraphs && section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}

              {section.contact && !section.list && (
                <div className="rgpd-contact-card">
                  <p>
                    <strong>{section.contact.label || 'Contact'}</strong>
                    <br />
                    {section.contact.name}
                    <br />
                    {section.contact.org}
                    <br />
                    {section.contact.addr}
                    <br />
                    {emailLabels[lang]}
                    <a href={`mailto:${section.contact.email}`}>
                      {section.contact.email}
                    </a>
                  </p>
                </div>
              )}

              {section.list && (
                <ul>
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}

              {section.paragraphs2 && section.paragraphs2.map((p, i) => (
                <p key={i}>{p}</p>
              ))}

              {section.contact && section.list && (
                <div className="rgpd-contact-card">
                  <p>
                    <strong>{section.contact.name}</strong>
                    <br />
                    {emailLabels[lang]}
                    <a href={`mailto:${section.contact.email}`}>
                      {section.contact.email}
                    </a>
                    <br />
                    {section.contact.org}
                    <br />
                    {section.contact.addr}
                  </p>
                </div>
              )}
            </div>
          ))}

          <hr className="rgpd-rule" />

          <p className="rgpd-footer-note">{content.footerNote}</p>

          <Link href="/" className="btn btn-ghost rgpd-cta">
            {content.back}
          </Link>
        </article>
      </main>

      <SurveyTweaks tweaks={tweaks} setTweaks={setTweaks} />
    </>
  );
}
