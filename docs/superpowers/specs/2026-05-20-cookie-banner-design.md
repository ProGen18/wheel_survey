# Spec : Bannière d'information cookies RGPD

**Date :** 2026-05-20
**Projet :** Gyroroue — questionnaire académique Next.js/React
**Statut :** Approuvé

---

## Objectif

Ajouter une bannière informative minimale conforme RGPD/CNIL au bas de la page. Le questionnaire n'utilise que des cookies strictement nécessaires (session, langue, navigation) — aucun consentement préalable n'est requis selon les recommandations CNIL. La bannière informe l'utilisateur sans dark patterns ni choix multiples. Elle disparaît une fois l'utilisateur informé, et ce choix est mémorisé via `localStorage`.

---

## Architecture

### Nouveau composant : `components/CookieBanner.jsx`

**Responsabilité unique :** afficher la notice cookies et gérer sa dismissal.

**Props :**
| Prop | Type | Description |
|------|------|-------------|
| `lang` | `'fr' \| 'en'` | Langue active pour les textes |
| `onDismiss` | `() => void` | Callback appelé quand l'utilisateur clique "Compris" |

**Comportement interne :**
- Au montage (`useEffect`), lit `localStorage.getItem('gyro_cookies_ok')`. Si `'1'`, le composant retourne `null` immédiatement (pas de rendu, pas d'animation).
- Sinon, s'affiche avec classe CSS `.cookie-banner`.
- Clic sur le bouton → `localStorage.setItem('gyro_cookies_ok', '1')` → ajoute classe `.is-dismissed` → appelle `onDismiss()` après le délai de transition (350 ms).

**State interne :**
```js
const [visible, setVisible] = useState(false);   // init depuis localStorage au mount
const [dismissed, setDismissed] = useState(false); // déclenche l'animation de sortie
```

**Textes :** lus depuis `I18N[lang].cookie` (clés `text` et `btn`).

---

### Modifications dans `components/i18n.js`

Ajouter la clé `cookie` dans les deux objets de langue :

```js
// Français
cookie: {
  text: "Ce site utilise uniquement des cookies strictement nécessaires au fonctionnement et à la sécurité du questionnaire (gestion de session, préférences de langue et navigation dans le formulaire). Aucun cookie publicitaire ou de suivi n'est utilisé. Conformément au RGPD et aux recommandations de la CNIL, ces cookies fonctionnels ne nécessitent pas de consentement préalable.",
  btn: "Compris",
},

// English
cookie: {
  text: "This website only uses strictly necessary cookies required for the operation and security of the survey (session management, language preferences, and form navigation). No advertising or tracking cookies are used. In accordance with the GDPR and CNIL guidelines, these functional cookies do not require prior consent.",
  btn: "Got it",
},
```

---

### Modifications dans `app/page.jsx`

1. **Import** du composant `CookieBanner`.
2. **Nouveau state** dans `App()` :
   ```js
   const [cookieBannerVisible, setCookieBannerVisible] = useState(true);
   ```
   Ce state est mis à `false` par le callback `onDismiss` du composant.

3. **Prop `lift` au `ProgressRing`** : passer un style conditionnel pour élever la bague quand la bannière est visible et éviter le chevauchement :
   ```jsx
   <ProgressRing
     pct={pct}
     label={I.progress_label}
     visible={topbarVisible}
     style={{ bottom: cookieBannerVisible ? 'calc(1.5rem + 56px)' : '1.5rem' }}
   />
   ```
   > Le composant `ProgressRing` recevra un prop `style` optionnel appliqué en inline sur son wrapper `div`.

4. **Rendu du composant** dans le fragment, avant `<SurveyTweaks>` :
   ```jsx
   <CookieBanner lang={lang} onDismiss={() => setCookieBannerVisible(false)} />
   ```

---

### Modifications dans `app/globals.css`

Ajout d'un bloc `.cookie-banner` après le bloc `.topbar` existant :

```css
/* ---- COOKIE BANNER (RGPD) ---- */
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 45; /* entre progress-ring (40) et modal (50) */
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

.cookie-banner .cookie-btn {
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

.cookie-banner .cookie-btn:hover {
  background: var(--paper-soft);
  border-color: var(--ink-mute);
}

/* Dark mode */
[data-theme="dark"] .cookie-banner {
  background: var(--paper-deep);
  border-color: var(--rule);
}

/* Mobile : texte abrégé + layout colonne */
@media (max-width: 480px) {
  .cookie-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }
}
```

---

## Modifications sur `ProgressRing`

Le composant `ProgressRing` acceptera un prop optionnel `style` transmis au `div` wrapper :

```jsx
const ProgressRing = ({ pct, label, visible, style }) => {
  // ... inchangé ...
  return (
    <div className={`progress-ring ${visible ? "is-visible" : ""}`} style={style}>
      {/* ... */}
    </div>
  );
};
```

---

## Flux de données

```
localStorage['gyro_cookies_ok']
        │
        ▼ (au mount du CookieBanner)
   visible = false → null (pas de rendu)
   visible = true  → affiche bannière
                         │
                    [clic "Compris"]
                         │
                  dismissed = true → animation slide-down
                         │
                  localStorage.setItem(...)
                         │
                  onDismiss() → setCookieBannerVisible(false)
                                    │
                              ProgressRing bottom = 1.5rem
```

---

## Clé localStorage

| Clé | Valeur | Signification |
|-----|--------|---------------|
| `gyro_cookies_ok` | `'1'` | Utilisateur informé, bannière supprimée |

---

## Z-index

| Élément | Z-index |
|---------|---------|
| TopBar | 30 |
| ProgressRing | 40 |
| **CookieBanner** | **45** |
| Modal | 50 |
| Notification | 60 |

---

## Hors périmètre

- Aucune logique de consentement granulaire (inutile : que des cookies fonctionnels)
- Aucun lien vers une politique de confidentialité séparée (à ajouter manuellement si besoin)
- Aucune analytics, Matomo ou traceur tiers
- Pas de bouton "Refuser" (non applicable sans cookies marketing)
