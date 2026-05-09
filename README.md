# Gyroroue — *Are you wheeling it?*

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-087ea4?logo=react)](https://react.dev/)
[![Languages](https://img.shields.io/badge/i18n-FR%20%7C%20EN%20%7C%20RU%20%7C%20ZH-8b5cf6)](./components/i18n.js)
[![License](https://img.shields.io/badge/license-Open%20Access-3a5f3a)](./LICENSE)
[![Build](https://img.shields.io/badge/build-Turbopack-ff6f00?logo=turbopack)](https://nextjs.org/docs/app/api-reference/turbopack)

**Enquête internationale sur l'adoption et l'usage des gyroroues électriques (EUC).**

Étude académique en accès ouvert menée par **Huihui Ding**, **Hanane El Bahraoui** et **Matthieu Manant** (RITM — Université Paris-Saclay). Application web interactive construite avec Next.js 16 et React 19.

---

## Aperçu

Gyroroue est un questionnaire interactif à **révélation progressive** : les sections apparaissent au fur et à mesure des réponses, avec un routage conditionnel qui adapte le parcours au profil de chaque répondant. Une mascotte interactive accompagne l'utilisateur tout au long de l'expérience.

- **33 questions** réparties en **8 parties**
- **6 profils** de répondants (rider régulier, occasionnel, ancien, curieux, jamais, sans réponse)
- **4 langues** : français, anglais, russe, mandarin
- **Parcours personnalisé** selon la réponse à la question filtre (Q1)
- **Sauvegarde automatique** côté serveur (debounce 800 ms + `navigator.sendBeacon`)
- **Système de parrainage viral** : codes influenceurs (manuels) + codes répondants (auto-générés)
- **Dashboard admin** complet : KPIs, statistiques par question, exports CSV, arbre de parrainage
- **Conformité RGPD** : bannière de consentement, page de politique de confidentialité, anonymisation IP

---

## Stack technique

| Élément          | Technologie                                                   |
| ---------------- | ------------------------------------------------------------- |
| Framework        | [Next.js 16](https://nextjs.org/) (App Router, Turbopack)    |
| UI               | [React 19](https://react.dev/)                                |
| Styles           | CSS vanilla (custom properties, `@media`, animations)         |
| Typographie      | Crimson Pro, Instrument Serif, Inter Tight, JetBrains Mono    |
| Base de données  | [Supabase Postgres](https://supabase.com/) (pooler pgbouncer) |
| ORM              | [Prisma 6](https://www.prisma.io/)                            |
| Charts admin     | [Recharts 3](https://recharts.org/)                           |
| Auth admin       | bcryptjs + cookie HMAC-SHA256 (Web Crypto)                    |
| Hébergement      | [Netlify](https://www.netlify.com/) (App Router + Functions)  |
| Build            | `prisma generate && next build`                               |
| Runtime          | Node.js (API routes), Edge (middleware auth)                  |

---

## Démarrage

```bash
# Installation
npm install

# Serveur de développement (localhost:8080)
npm run dev

# Build production
npm run build

# Serveur production
npm start

# Linter
npm run lint

# Base de données
npm run db:push      # Appliquer le schéma Prisma (sans migration)
npm run db:studio    # Interface graphique Prisma Studio
npm run db:seed      # Peupler 3 influenceurs + 18 répondants de démo
```

---

## Structure du projet

```
Gyroroue/
├── app/
│   ├── layout.jsx                          # HTML racine, métadonnées, fonts Google
│   ├── page.jsx                            # Application principale (questionnaire)
│   ├── globals.css                         # Styles globaux (thème, layout, animations)
│   ├── admin/
│   │   ├── layout.jsx                      # Sidebar + nav admin (bascule FR/EN, logout)
│   │   ├── page.jsx                        # Dashboard (KPIs, graphiques 30 j, top influenceurs)
│   │   ├── login/page.jsx                  # Formulaire de connexion (CSRF token)
│   │   ├── links/page.jsx                  # Gestion des liens de parrainage
│   │   ├── influencers/
│   │   │   ├── page.jsx                    # Liste des influenceurs (recherche, pagination)
│   │   │   └── [id]/page.jsx               # Détail influenceur + arbre des descendants
│   │   ├── respondents/
│   │   │   ├── page.jsx                    # Liste des répondants (filtre profil)
│   │   │   └── [id]/page.jsx               # Détail répondant + chaîne ascendante
│   │   ├── stats/page.jsx                  # Statistiques détaillées (33 questions, MCI, heatmaps)
│   │   └── export/page.jsx                 # Interface d'export CSV
│   ├── rgpd/
│   │   ├── layout.jsx                      # Layout page RGPD
│   │   └── page.jsx                        # Politique de confidentialité (4 langues, RGPD complet)
│   └── api/
│       ├── survey/
│       │   ├── start/route.js              # POST : Initialiser une session + valider le code ref
│       │   ├── save/route.js               # POST : Sauvegarder les réponses (auto-save)
│       │   ├── complete/route.js           # POST : Marquer terminé, retourner le code parrainage
│       │   └── resume/route.js             # POST : Reprendre une session incomplète
│       ├── ref/
│       │   ├── validate/route.js           # POST : Valider un code de parrainage
│       │   └── visit/route.js              # POST : Enregistrer une visite de lien
│       └── admin/                          # Toutes ces routes sont protégées par le middleware
│           ├── auth/login/route.js         # GET (token CSRF) / POST (authentification)
│           ├── auth/logout/route.js        # POST : Supprimer le cookie de session
│           ├── influencers/route.js        # GET (liste) / POST (création)
│           ├── influencers/[id]/route.js   # GET / PUT / DELETE
│           ├── influencers/[id]/tree/route.js  # GET : Arbre récursif (CTE Postgres)
│           ├── respondents/route.js        # GET : Liste paginée
│           ├── respondents/[id]/route.js   # GET : Détail + toutes les réponses
│           ├── respondents/[id]/chain/route.js # GET : Chaîne ascendante (CTE Postgres)
│           ├── links/route.js              # GET / POST
│           ├── links/[id]/revoke/route.js  # PUT : Révoquer un lien
│           ├── links/[id]/regenerate/route.js  # PUT : Régénérer le code
│           ├── stats/route.js              # GET : KPIs + tendances 30 jours
│           ├── stats/full/route.js         # GET : Stats complètes (33 q., MCI, cross-tabs)
│           ├── export/respondents/route.js # GET : Stream CSV de toutes les réponses
│           └── export/influencer/[id]/route.js # GET : Stream CSV des descendants
│
├── components/
│   ├── survey-data.js                      # Définitions des questions, règles de routage
│   ├── i18n.js                             # Chaînes multilingues (FR / EN / RU / ZH)
│   ├── questions.jsx                       # QuestionBlock, rendu par type de question
│   ├── icons.jsx                           # Bibliothèque d'icônes SVG
│   ├── survey-tweaks.jsx                   # Panneau de réglages (langue, police, densité, thème)
│   ├── CookieBanner.jsx                    # Bannière de consentement RGPD (bloquante)
│   ├── CookieContext.jsx                   # Context React pour l'état du consentement
│   ├── CookieWrapper.jsx                   # Fournisseur du contexte cookie
│   ├── Footer.jsx                          # Pied de page avec lien RGPD
│   ├── Gate.module.css                     # Styles de la bannière et de la porte d'accès
│   ├── rgpd-content.js                     # Contenu RGPD complet (4 langues)
│   ├── admin/
│   │   ├── StatsCard.jsx                   # Carte de KPI
│   │   ├── AreaChartBlock.jsx              # Graphique de zone (Recharts)
│   │   ├── BarChartBlock.jsx               # Graphique en barres (Recharts)
│   │   ├── DonutBlock.jsx                  # Graphique donut (Recharts)
│   │   ├── RadarBlock.jsx                  # Radar MCI par profil (Recharts)
│   │   ├── HeatmapGrid.jsx                 # Heatmap (distributions Likert)
│   │   ├── CrossTabBlock.jsx               # Tableau croisé (profil × dimension)
│   │   ├── TreeView.jsx                    # Visualisation de l'arbre des descendants
│   │   ├── ChainView.jsx                   # Visualisation de la chaîne ascendante
│   │   └── FiltersBar.jsx                  # Filtres admin (période, profil, langue)
│   └── survey/
│       └── ReferralEndCard.jsx             # Carte de fin avec lien de parrainage (copier-coller)
│
├── lib/
│   ├── prisma.js                           # Client Prisma singleton
│   ├── referral.js                         # Logique de parrainage (génération, validation, CTE)
│   ├── auth-edge.js                        # Auth Edge (Web Crypto API, HMAC-SHA256)
│   ├── auth-node.js                        # Auth Node (bcryptjs, signature cookie)
│   ├── rate-limit.js                       # Rate-limiting en mémoire avec TTL
│   ├── ip.js                               # Extraction et hachage d'IP (headers Netlify)
│   ├── api-guard.js                        # Garde API publique (rate-limit + vérif. origine)
│   ├── json.js                             # Sérialiseur JSON sécurisé (BigInt → Number)
│   └── csv.js                              # Export CSV (RFC 4180, aplatissement des matrices)
│
├── prisma/
│   ├── schema.prisma                       # Schéma BDD (ReferralNode + SurveyResponse)
│   └── seed.js                             # Données de démo (3 influenceurs + 18 répondants)
│
├── public/
│   └── assets/
│       ├── euc-cut.png                     # Visuel produit EUC
│       ├── euc-hero.png                    # Image hero
│       └── euc-ref.png                     # Visuel de parrainage
│
├── middleware.js                            # Auth Edge + rate-limiting + en-têtes de sécurité
├── next.config.mjs                          # Configuration Next.js
├── netlify.toml                             # Build Netlify (@netlify/plugin-nextjs)
├── jsconfig.json                            # Alias de chemins (@/ → racine)
├── package.json
└── README.md
```

---

## Routage du questionnaire

La **question filtre** (Q1) détermine le profil du répondant et conditionne les parties affichées :

| Profil              | Clé       | Parties visibles           |
| ------------------- | --------- | -------------------------- |
| Rider régulier      | `reg`     | 1, 2, 3, 4, 5, 7, 8       |
| Rider occasionnel   | `occ`     | 1, 2, 3, 4, 5, 7, 8       |
| Ancien rider        | `ex`      | 1, 2, 4, 5, 7, 8          |
| Curieux             | `curious` | 1, 4, 6, 7, 8             |
| Jamais              | `never`   | 1, 4, 6, 7, 8             |
| Sans réponse        | `skip`    | 1, 4, 7, 8                |

Chaque partie est révélée progressivement : toutes les questions d'une partie doivent être complètes avant de débloquer la suivante.

---

## Types de questions

| Type              | Rendu                                       | Stockage                  |
| ----------------- | ------------------------------------------- | ------------------------- |
| `single`          | Boutons radio exclusifs                     | Index numérique           |
| `multi`           | Cases à cocher (avec options exclusives)    | Tableau d'indices         |
| `likert`          | Échelle 1-7 (dial)                          | Nombre 1-7                |
| `likert-matrix`   | Grille de Likert 1-7                        | Objet `{ ligne: valeur }` |
| `year`            | Champ numérique (2000-2026)                 | Nombre                    |
| `number`          | Champ numérique libre                       | Nombre                    |
| `text`            | Champ texte libre                           | Chaîne                    |

Le composant `QuestionBlock` orchestre le rendu via `QuestionRenderer`.

---

## Internationalisation

L'application supporte **4 langues**. Les chaînes d'interface sont définies dans `components/i18n.js` et les questions dans `components/survey-data.js`.

La **bannière de consentement** détecte automatiquement la langue du navigateur (`navigator.languages`) avec un fallback vers l'anglais si aucune langue supportée n'est trouvée.

### Ajouter une langue

1. Ajouter les clés `xx` dans `I18N` (`i18n.js`) pour les chaînes UI, y compris la section `cookies`
2. Ajouter les champs `xx`, `opts_xx`, `hint_xx`, `rows_xx` dans chaque question (`survey-data.js`)
3. Le helper `field(q, name, lang)` dans `questions.jsx` assure la résolution avec fallback anglais

---

## Système de consentement & RGPD

### Bannière de consentement (`CookieBanner`)

Bloquante sur toutes les pages sauf `/rgpd`. Propose deux catégories :

| Catégorie              | Statut    | Contenu                                         |
| ---------------------- | --------- | ----------------------------------------------- |
| Cookies fonctionnels   | Obligatoire | Jeton de session, code de parrainage            |
| Cookies analytics      | Optionnel | Statistiques anonymes de participation          |

La langue de la bannière est détectée depuis `navigator.languages` (liste ordonnée du navigateur). Si aucune des langues supportées (FR, EN, RU, ZH) n'est détectée, l'anglais est utilisé par défaut.

### Page RGPD (`/rgpd`)

- Politique de confidentialité complète disponible en 4 langues
- Sur cette page, la bannière n'est pas bloquante (affichage en mode notice)
- Responsable du traitement : Matthieu Manant, RITM — Université Paris-Saclay
- Durée de conservation : 2 ans
- Droits : accès, rectification, suppression, portabilité, opposition

---

## Sauvegarde automatique & persistance

- Chaque réponse est envoyée au serveur avec un debounce de **800 ms**
- Au moment de quitter la page, `navigator.sendBeacon` assure un envoi fire-and-forget
- Les réponses incomplètes sont conservées (`completedAt = NULL`) et peuvent être reprises
- Endpoint : `POST /api/survey/save`

---

## Système de parrainage viral

### Fonctionnement

Les codes de parrainage permettent de construire un **arbre hiérarchique illimité** :

```
Influenceur (code manuel)
  └─ Répondant A (code auto : EN6a7f2c1d)
       └─ Répondant B (code auto : FR3b2e1f0a)
            └─ ...
```

- Les influenceurs sont créés manuellement depuis `/admin/links`
- Les répondants reçoivent leur code à la fin du questionnaire (`ReferralEndCard`)
- Les codes répondants sont préfixés par la langue : `FR`, `EN`, `RU`, `ZH` + 8 hex
- Validité configurable (90 jours par défaut, via `REFERRAL_EXPIRY_DAYS`)
- Compteur de visites : `visitCount` incrémenté à chaque passage sur `/?ref=CODE`
- Les requêtes d'arbre et de chaîne utilisent des **CTE récursifs Postgres**

---

## Dashboard admin (`/admin`)

Protégé par un cookie HMAC-SHA256 vérifié à la couche Edge middleware.

| Page                      | Route                         | Contenu                                                   |
| ------------------------- | ----------------------------- | --------------------------------------------------------- |
| Vue d'ensemble            | `/admin`                      | KPIs, graphiques 30 jours, top influenceurs               |
| Liens                     | `/admin/links`                | Créer / révoquer / régénérer des codes de parrainage      |
| Influenceurs              | `/admin/influencers`          | Liste paginée avec recherche (enfants directs + totaux)   |
| Détail influenceur        | `/admin/influencers/[id]`     | `TreeView` des descendants                                |
| Répondants                | `/admin/respondents`          | Liste paginée avec filtre de profil                       |
| Détail répondant          | `/admin/respondents/[id]`     | Toutes les réponses + `ChainView` de la chaîne ascendante |
| Statistiques              | `/admin/stats`                | 33 questions, heatmaps Likert, radars MCI, cross-tabs     |
| Exports                   | `/admin/export`               | Télécharger les réponses en CSV (stream RFC 4180)         |
| Connexion                 | `/admin/login`                | Formulaire protégé par CSRF + rate-limiting               |

### Statistiques disponibles

- KPIs en temps réel : réponses complètes, aujourd'hui / semaine / 30 jours, taux de partage
- Fréquences par option pour les 33 questions
- **Matrices MCI** (Motivation-Cognition-Intégration) en 5 dimensions (hédonique, instrumental, social, symbolique, cognitif) — radars par profil
- **Heatmaps** de distribution des réponses Likert
- **Tableaux croisés** : canaux de découverte × profil, tranches d'âge × profil
- Tendances quotidiennes sur 30 jours (graphique de surface)

### Exports CSV

- Toutes les réponses avec matrices Likert aplaties en colonnes individuelles
- Export par influenceur (descendants uniquement)
- Streaming pour les grands ensembles de données (évite les problèmes mémoire)

---

## Sécurité

| Mesure                    | Détail                                                              |
| ------------------------- | ------------------------------------------------------------------- |
| Hachage de mot de passe   | bcryptjs, 12 rounds                                                 |
| Signature de cookie       | HMAC-SHA256, comparaison à temps constant                           |
| CSRF                      | Double-submit token sur le login admin                             |
| Rate-limiting             | En mémoire avec TTL (5 tentatives/h login, 10 req/min API publique) |
| Vérification d'origine    | Contrôle des headers `Origin` sur les API publiques                 |
| En-têtes de sécurité      | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, HSTS    |
| Hachage IP                | SHA256(secret + IP), jamais d'IP brute stockée                     |
| Cookies sécurisés         | `httpOnly`, `sameSite=strict`, `secure` en production               |
| Aucun tracking externe    | Pas de Google Analytics, pas de pixel tiers                         |

---

## Schéma de base de données

```
ReferralNode            SurveyResponse
─────────────           ──────────────────
id (cuid)               id (cuid)
code (unique)           nodeId → ReferralNode (1:1)
nodeType (INFLUENCER    sessionToken (unique)
         | RESPONDENT)  startedAt / lastSavedAt / completedAt
label                   userAgent / ipHash
lang                    filterValue (Q1)
parentId → self         [champs réponses — toutes les questions]
visitCount
isActive / expiresAt
```

Les deux tables sont reliées en 1:1 (`nodeId` dans `SurveyResponse`). Les arbres et chaînes sont parcourus via des CTE `RECURSIVE` Postgres.

---

## Design System

### Thème visuel

Esthétique *journal académique* : papier chaud, encre profonde, accent unique.

```css
--paper: #f4ede1;    /* Fond principal */
--ink:   #1b1f2a;    /* Texte */
--ember: #d94d1a;    /* Accent principal */
--teal:  #1e4a47;    /* Accent secondaire (échelles) */
```

### Typographie

| Rôle     | Police                  |
| -------- | ----------------------- |
| Display  | Instrument Serif        |
| Corps    | Crimson Pro             |
| UI       | Inter Tight             |
| Mono     | JetBrains Mono          |

### Points de rupture

| Cible     | Largeur       |
| --------- | ------------- |
| Mobile    | < 480px       |
| Tablette  | 481px – 768px |
| Desktop   | > 769px       |

### Pile de z-index

```
60 : Notifications
50 : Modales / bannière cookie
40 : ProgressRing (indicateur de progression)
30 : TopBar (barre supérieure)
20 : Mascotte (compagnon)
 2 : Contenu
 1 : Fond
```

---

## Panel de réglages (Tweaks)

Accessible via le bouton discret en bas de page. Permet de :

- Changer la langue (FR / EN / RU / ZH)
- Basculer la police (Serif / Sans / Mono)
- Ajuster la densité (Spacieux / Compact)
- Basculer le thème (Clair / Sombre)

---

## Déploiement (Supabase + Netlify)

### 1. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com/) → **New project**
2. Choisir une région proche des utilisateurs (ex. `eu-west-3` Paris)
3. Ouvrir **Project Settings → Database → Connection string** et récupérer :
   - **Connection pooling** (port 6543, mode `transaction`) → `DATABASE_URL`
     - Ajouter `?pgbouncer=true&connection_limit=1` à la fin
   - **Direct connection** (port 5432) → `DIRECT_URL` (uniquement pour les migrations Prisma)

> Le pooler pgbouncer est **indispensable** sur Netlify Functions : sans lui, les connexions Postgres saturent rapidement.

### 2. Configurer les variables locales

```bash
cp .env.example .env.local
```

Remplir `.env.local` avec les deux URLs Supabase, puis générer les secrets admin :

```bash
# Hash du mot de passe admin (coût 12)
node -e "require('bcryptjs').hash('mon-mot-de-passe-admin', 12).then(console.log)"

# Secret de signature de cookie (>= 32 chars)
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Initialiser le schéma

```bash
npm install
npx prisma db push          # Crée les tables ReferralNode + SurveyResponse
npm run db:seed             # Peuple 3 influenceurs + 18 répondants de démo (optionnel)
```

Vérifier dans Supabase → **Table Editor** que les deux tables existent.

### 4. Lancer en local

```bash
npm run dev
# http://localhost:8080            ← questionnaire public
# http://localhost:8080/admin      ← dashboard admin (login requis)
# http://localhost:8080/rgpd       ← politique de confidentialité
```

### 5. Déployer sur Netlify

1. Pousser le code sur GitHub
2. Sur [Netlify](https://www.netlify.com/) → **Add new site → Import from Git**
3. La build command et le publish directory sont déjà configurés dans `netlify.toml`
4. **Site Settings → Environment variables**, ajouter :

| Clé                       | Valeur                                                              |
| ------------------------- | ------------------------------------------------------------------- |
| `DATABASE_URL`            | URL pooler Supabase avec `?pgbouncer=true&connection_limit=1`       |
| `DIRECT_URL`              | URL directe Supabase (port 5432)                                    |
| `ADMIN_PASSWORD_HASH`     | Hash bcrypt généré ci-dessus                                        |
| `ADMIN_SESSION_SECRET`    | Secret aléatoire >= 32 chars                                        |
| `NEXT_PUBLIC_BASE_URL`    | URL publique Netlify (ex. `https://gyroroue.netlify.app`)           |
| `REFERRAL_EXPIRY_DAYS`    | `90` (ou autre durée en jours)                                      |

5. **Deploys → Trigger deploy** — Netlify détecte le plugin `@netlify/plugin-nextjs` et build automatiquement

### 6. Vérification post-déploiement

- Page d'accueil → répondre Q1 → vérifier dans Supabase qu'un `SurveyResponse` apparaît avec `completedAt = NULL`
- `/admin/login` → mot de passe → accès au dashboard
- Créer un influenceur, tester le lien `/?ref=CODE`, vérifier la chaîne dans `/admin/respondents/[id]`

---

## Licence et crédits

Étude académique en accès ouvert. Données collectées anonymement à des fins de recherche.

**Auteurs :** Huihui Ding, Hanane El Bahraoui & Matthieu Manant  
**Développeur :** Stéphane TALAB  
**Institution :** RITM — Université Paris-Saclay
