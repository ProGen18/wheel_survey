# Cookie Banner RGPD — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le bandeau de consentement bloquant existant par une bannière informative minimale conforme RGPD/CNIL — un seul bouton "Compris", pas de blocage, mémorisation via localStorage.

**Architecture:** Le `CookieBanner.jsx` existant (système bloquant à 3 boutons) est entièrement réécrit. `CookieContext.jsx` et `Gate.module.css` sont supprimés car ils ne servent plus. Le nouveau bandeau détecte la langue du navigateur, s'appuie sur une nouvelle clé `cookie` dans `I18N`, et utilise CSS `position: fixed; bottom: 0` avec un effet slide-out. Un sélecteur CSS `:has()` soulève automatiquement le `ProgressRing` quand le bandeau est visible — sans aucun prop supplémentaire dans `page.jsx`.

**Tech Stack:** React 19, Next.js 16, CSS vanilla (variables globales), localStorage

---

## Fichiers touchés

| Action | Fichier | Responsabilité |
|--------|---------|----------------|
| Modifier | `components/i18n.js` | Remplacer la clé `cookies` (complexe) par `cookie` (simple) en FR et EN |
| Réécrire | `components/CookieBanner.jsx` | Nouveau bandeau informatif — détection de langue, slot `cookie`, localStorage |
| Modifier | `app/layout.jsx` | Supprimer `CookieProvider` devenu inutile |
| Supprimer | `components/CookieContext.jsx` | N'est plus consommé par rien |
| Supprimer | `components/Gate.module.css` | N'est plus importé par rien |
| Modifier | `app/globals.css` | Ajouter `.cookie-banner`, `.cookie-btn`, rule `:has()` pour `ProgressRing` |

---

## Task 1 : Mettre à jour les textes i18n

**Files:**
- Modify: `components/i18n.js` (lignes 82–98 pour FR, 200–216 pour EN)

- [ ] **Step 1 : Remplacer la clé `cookies` du bloc FR**

Dans `components/i18n.js`, trouver le bloc suivant (FR, environ ligne 82) :

```js
    cookies: {
      gateTitle: "Avant de commencer",
      text: "Ce questionnaire utilise des cookies techniques ...",
      accept: "Accepter",
      refuse: "Refuser",
      customize: "Personnaliser",
      functional: "Cookies fonctionnels (obligatoires)",
      functionalDesc: "Session anonyme, code de parrainage. Nécessaires au fonctionnement.",
      analytics: "Cookies analytics (optionnels)",
      analyticsDesc: "Statistiques anonymes de participation.",
      blockedTitle: "Accès au questionnaire impossible",
      blockedText: "Vous avez refusé les cookies techniques ...",
      modifyChoice: "Modifier mon choix",
      savePreferences: "Enregistrer mes préférences",
      mandatory: "Obligatoire",
      optional: "Optionnel",
    },
```

Remplacer **exactement** par :

```js
    cookie: {
      text: "Ce site utilise uniquement des cookies strictement nécessaires au fonctionnement et à la sécurité du questionnaire (gestion de session, préférences de langue et navigation dans le formulaire). Aucun cookie publicitaire ou de suivi n'est utilisé. Conformément au RGPD et aux recommandations de la CNIL, ces cookies fonctionnels ne nécessitent pas de consentement préalable.",
      btn: "Compris",
    },
```

- [ ] **Step 2 : Remplacer la clé `cookies` du bloc EN**

Dans `components/i18n.js`, trouver le bloc suivant (EN, environ ligne 200) :

```js
    cookies: {
      gateTitle: "Before we begin",
      text: "This questionnaire uses technical cookies essential for its operation ...",
      accept: "Accept",
      refuse: "Decline",
      customize: "Customize",
      functional: "Functional cookies (required)",
      functionalDesc: "Anonymous session, referral code. Necessary for operation.",
      analytics: "Analytics cookies (optional)",
      analyticsDesc: "Anonymous participation statistics.",
      blockedTitle: "Questionnaire access unavailable",
      blockedText: "You have declined the technical cookies ...",
      modifyChoice: "Change my choice",
      savePreferences: "Save preferences",
      mandatory: "Required",
      optional: "Optional",
    },
```

Remplacer **exactement** par :

```js
    cookie: {
      text: "This website only uses strictly necessary cookies required for the operation and security of the survey (session management, language preferences, and form navigation). No advertising or tracking cookies are used. In accordance with the GDPR and CNIL guidelines, these functional cookies do not require prior consent.",
      btn: "Got it",
    },
```

- [ ] **Step 3 : Vérifier la syntaxe du fichier**

```bash
node -e "require('./components/i18n.js'); console.log('OK')"
```

Résultat attendu : `OK` sans erreur.

- [ ] **Step 4 : Commit**

```bash
git add components/i18n.js
git commit -m "refactor(i18n): replace blocking cookies key with minimal cookie key (fr + en)"
```

---

## Task 2 : Réécrire CookieBanner.jsx

**Files:**
- Rewrite: `components/CookieBanner.jsx`

Le composant actuel est un gate bloquant plein-écran avec 3 boutons. On le remplace intégralement par un bandeau informatif non-bloquant.

- [ ] **Step 1 : Réécrire le fichier**

Remplacer **tout le contenu** de `components/CookieBanner.jsx` par :

```jsx
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
```

- [ ] **Step 2 : Vérifier l'absence d'import de Gate.module.css et CookieContext**

```bash
grep -n "Gate.module\|CookieContext\|useCookieConsent" components/CookieBanner.jsx
```

Résultat attendu : aucune ligne affichée.

- [ ] **Step 3 : Commit**

```bash
git add components/CookieBanner.jsx
git commit -m "refactor(cookie): replace blocking consent gate with minimal informative banner"
```

---

## Task 3 : Nettoyer layout.jsx

**Files:**
- Modify: `app/layout.jsx`

`CookieProvider` n'est plus nécessaire — le nouveau `CookieBanner` gère son propre état en interne.

- [ ] **Step 1 : Modifier layout.jsx**

Remplacer **tout le contenu** de `app/layout.jsx` par :

```jsx
import "./globals.css";
import CookieWrapper from "@/components/CookieWrapper";

export const metadata = {
  title: "Gyroroue — Are you wheeling it? International survey",
  description: "Adoption and use of electric unicycles — an international survey of riders, the curious, and the skeptics.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-theme="light" data-font="serif" data-density="default">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CookieWrapper>{children}</CookieWrapper>
      </body>
    </html>
  );
}
```

- [ ] **Step 2 : Vérifier l'absence de CookieProvider dans layout.jsx**

```bash
grep -n "CookieProvider\|CookieContext" app/layout.jsx
```

Résultat attendu : aucune ligne.

- [ ] **Step 3 : Commit**

```bash
git add app/layout.jsx
git commit -m "refactor(layout): remove CookieProvider — no longer needed"
```

---

## Task 4 : Supprimer les fichiers devenus inutiles

**Files:**
- Delete: `components/CookieContext.jsx`
- Delete: `components/Gate.module.css`

- [ ] **Step 1 : Vérifier qu'aucun autre fichier n'importe ces deux modules**

```bash
grep -rn "CookieContext\|Gate\.module" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" .
```

Résultat attendu : **aucune ligne** (sauf éventuellement dans `node_modules`, à ignorer).

- [ ] **Step 2 : Supprimer les fichiers**

```bash
git rm components/CookieContext.jsx components/Gate.module.css
```

- [ ] **Step 3 : Commit**

```bash
git commit -m "chore: delete CookieContext and Gate.module.css — replaced by simple banner"
```

---

## Task 5 : Ajouter le CSS du nouveau bandeau

**Files:**
- Modify: `app/globals.css`

Le nouveau composant utilise des classes globales (pas CSS Modules). Ajouter les styles après le bloc `.topbar` existant (environ ligne 1252 dans globals.css).

- [ ] **Step 1 : Trouver le bon emplacement**

```bash
grep -n "TOPBAR\|topbar\|branch-banner\|BRANCH" app/globals.css | head -10
```

Repérer la ligne du commentaire `/* ---- ROUTE/BRANCH BANNER */` ou similaire pour insérer juste avant.

- [ ] **Step 2 : Ajouter le bloc CSS**

Dans `app/globals.css`, juste avant le commentaire `/* ---- ROUTE/BRANCH BANNER */` (environ ligne 1253), insérer :

```css
/* ---- COOKIE BANNER (RGPD) ---- */
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 45;
  background: var(--paper-deep);
  border-top: 1px solid var(--rule);
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-family: var(--f-sans);
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--ink-mute);
  transform: translateY(0);
  transition: transform 0.35s var(--ease);
}

.cookie-banner.is-dismissed {
  transform: translateY(100%);
}

.cookie-banner p {
  flex: 1;
  margin: 0;
}

.cookie-btn {
  flex-shrink: 0;
  padding: 0.4rem 1rem;
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  background: var(--paper);
  color: var(--ink);
  font-family: var(--f-sans);
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.cookie-btn:hover {
  background: var(--paper-soft);
  border-color: var(--ink-mute);
}

/* Soulève le ProgressRing quand le bandeau est visible */
body:has(.cookie-banner:not(.is-dismissed)) .progress-ring {
  bottom: calc(1.5rem + 64px);
  transition: bottom 0.35s var(--ease);
}

[data-theme="dark"] .cookie-banner {
  background: var(--paper-deep);
  border-color: var(--rule);
}

@media (max-width: 480px) {
  .cookie-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }
}
```

- [ ] **Step 3 : Commit**

```bash
git add app/globals.css
git commit -m "feat(css): add cookie-banner styles with progress-ring lift via :has()"
```

---

## Task 6 : Vérification manuelle

- [ ] **Step 1 : Démarrer le serveur de développement**

```bash
npm run dev
```

Ouvrir `http://localhost:8080` dans le navigateur.

- [ ] **Step 2 : Vérifier l'affichage initial**

- Le bandeau s'affiche en bas de page dès l'arrivée sur le site.
- Le contenu du questionnaire (Hero, etc.) est **accessible immédiatement** — il n'y a plus de gate bloquant.
- Le texte correspond à la langue du navigateur (FR si navigateur français, EN sinon).
- Le bouton "Compris" / "Got it" est visible.

- [ ] **Step 3 : Vérifier la dismissal**

- Cliquer sur "Compris".
- Le bandeau doit glisser vers le bas et disparaître.
- Le `ProgressRing` (visible après scroll) doit redescendre à sa position normale.
- Recharger la page : le bandeau ne doit **pas réapparaître** (localStorage mémorisé).

- [ ] **Step 4 : Tester le reset**

Dans la console du navigateur :

```js
localStorage.removeItem('gyro_cookies_ok');
location.reload();
```

Le bandeau doit réapparaître.

- [ ] **Step 5 : Tester dark mode**

Via le `TweaksPanel` (si `showTweaks` activé), passer en thème dark. Le bandeau doit rester lisible.

- [ ] **Step 6 : Tester mobile (viewport 375px)**

Avec DevTools, simuler un écran de 375px. Le bandeau doit passer en layout colonne (texte + bouton empilés verticalement).

- [ ] **Step 7 : Vérifier le build**

```bash
npm run build
```

Résultat attendu : `✓ Compiled successfully` sans erreur ni avertissement sur les fichiers modifiés.

---

## Récapitulatif des commits attendus

```
chore: delete CookieContext and Gate.module.css — replaced by simple banner
refactor(layout): remove CookieProvider — no longer needed
refactor(cookie): replace blocking consent gate with minimal informative banner
refactor(i18n): replace blocking cookies key with minimal cookie key (fr + en)
feat(css): add cookie-banner styles with progress-ring lift via :has()
```

---

## Notes de vérification post-implémentation

- [ ] `localStorage.getItem('gyro_cookies_ok')` renvoie `'1'` après dismissal
- [ ] Aucune console error dans le navigateur
- [ ] `npm run build` passe sans erreur
- [ ] Le questionnaire est accessible sans consentement préalable
- [ ] Le bandeau ne bloque plus l'accès au contenu
