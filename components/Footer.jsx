"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { I18N } from "./i18n";

export default function Footer({ lang: langProp = "fr" }) {
  const [lang, setLang] = useState(langProp);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const htmlLang = document.documentElement.lang;
      if (htmlLang && I18N[htmlLang]) {
        setLang(htmlLang);
      }
    }
  }, []);

  const t = I18N[lang]?.footer ?? I18N.fr.footer;

  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-line">{t.line}</span>
        <span className="footer-sep" aria-hidden="true">
          ·
        </span>
        <Link href="/rgpd" className="footer-link">
          {t.privacy}
        </Link>
        <span className="footer-sep" aria-hidden="true">
          ·
        </span>
        <span className="footer-a11y">{t.accessibility}</span>
      </div>
    </footer>
  );
}
