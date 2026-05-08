# Gyroroue — *Are you wheeling it?*

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-087ea4?logo=react)](https://react.dev/)
[![Languages](https://img.shields.io/badge/i18n-FR%20%7C%20EN%20%7C%20RU%20%7C%20ZH-8b5cf6)](./components/i18n.js)
[![License](https://img.shields.io/badge/license-Open%20Access-3a5f3a)](./LICENSE)
[![Build](https://img.shields.io/badge/build-Turbopack-ff6f00?logo=turbopack)](https://nextjs.org/docs/app/api-reference/turbopack)

**Enquete internationale sur l'adoption et l'usage des gyroroues electriques (EUC).**

Etude academique en acces ouvert menee par **Huihui Ding**, **Hanane El Bahraoui** et **Matthieu Manant**. Application web interactive construite avec Next.js 16 et React 19.

---

## Apercu

Gyroroue est un questionnaire interactif à **révélation progressive** : les sections apparaissent au fur et à mesure des réponses, avec un routage conditionnel qui adapte le parcours au profil de chaque répondant. Une mascotte interactive accompagne l'utilisateur tout au long de l'expérience.

- **33 questions** réparties en **8 parties**
- **6 profils** de répondants (rider régulier, occasionnel, ancien, curieux, jamais, sans réponse)
- **4 langues** : français, anglais, russe, mandarin
- **Parcours personnalisé** selon la réponse à la question filtre (Q1)

---

## Stack technique

| Element          | Technologie                                            |
| ---------------- | ------------------------------------------------------ |
| Framework        | [Next.js 16](https://nextjs.org/) (Turbopack)          |
| UI               | [React 19](https://react.dev/)                         |
| Styles           | CSS vanilla (custom properties, `@media`, animations)  |
| Typographie      | Crimson Pro, Instrument Serif, Inter Tight, JetBrains Mono |
| Base de donnees  | [Supabase Postgres](https://supabase.com/) (via pooler pgbouncer) |
| ORM              | [Prisma 6](https://www.prisma.io/)                     |
| Charts admin     | [Recharts 3](https://recharts.org/)                    |
| Auth admin       | bcryptjs + cookie HMAC-SHA256 (Web Crypto)             |
| Hebergement      | [Netlify](https://www.netlify.com/) (App Router + Functions) |
| Build            | `prisma generate && next build`                        |
| Runtime          | Node.js (API), Edge (middleware d'auth)                |

---

## Demarrage

```bash
# Installation
npm install

# Serveur de developpement (localhost:8080)
npm run dev

# Build production
npm run build

# Serveur production
npm start

# Linter
npm run lint
```

---

## Structure du projet

```
Gyroroue/
├── app/
│   ├── layout.jsx                    # HTML racine, metadonnees, fonts Google
│   ├── page.jsx                      # Application principale
│   └── globals.css                   # Styles (theme, layout, animations, responsive)
├── components/
│   ├── survey-data.js                # Definitions des questions, regles de routage
│   ├── i18n.js                       # Chaines multilingues (FR / EN / RU / ZH)
│   ├── questions.jsx                 # Composants de rendu par type de question
│   ├── icons.jsx                     # Bibliotheque d'icones SVG
│   ├── ParallaxMascot.enhanced.jsx   # Mascotte interactive
│   └── tweaks-panel.jsx              # Panneau debug (developpement uniquement)
├── public/                           # Ressources statiques
├── package.json
└── README.md
```

---

## Routage du questionnaire

La **question filtre** (Q1) détermine le profil du répondant et conditionne les parties affichées :

| Profil              | Clé       | Parties visibles           |
| ------------------- | --------- | -------------------------- |
| Rider regulier      | `reg`     | 1, 2, 3, 4, 5, 7, 8       |
| Rider occasionnel   | `occ`     | 1, 2, 3, 4, 5, 7, 8       |
| Ancien rider        | `ex`      | 1, 2, 4, 5, 7, 8          |
| Curieux             | `curious` | 1, 4, 6, 7, 8             |
| Jamais              | `never`   | 1, 4, 6, 7, 8             |
| Sans reponse        | `skip`    | 1, 4, 7, 8                |

Chaque partie est revelee progressivement : toutes les questions d'une partie doivent etre completes avant de debloquer la suivante.

---

## Internationalisation

L'application supporte 4 langues. Les chaines d'interface sont definies dans `components/i18n.js` et les questions dans `components/survey-data.js`.

### Ajouter une langue

1. Ajouter les cles `xx` dans l'objet `I18N` (`i18n.js`) pour les chaines UI
2. Ajouter les champs `xx`, `opts_xx`, `hint_xx`, `rows_xx`, etc. dans chaque question (`survey-data.js`)
3. Le helper `field(q, name, lang)` dans `questions.jsx` assure la resolution automatique avec fallback vers l'anglais

---

## Types de questions

| Type              | Rendu                                       | Stockage               |
| ----------------- | ------------------------------------------- | ---------------------- |
| `single`          | Boutons radio exclusifs                     | Index numerique        |
| `multi`           | Cases a cocher (avec options exclusives)    | Tableau d'indices      |
| `likert`          | Echelle 1-7 (dial)                          | Nombre 1-7             |
| `likert-matrix`   | Grille de Likert 1-7                        | Objet `{ ligne: valeur }` |
| `year`            | Champ numerique (2000-2026)                 | Nombre                 |
| `number`          | Champ numerique libre                       | Nombre                 |
| `text`            | Champ texte libre                           | Chaine                 |

Le composant `QuestionBlock` orchestre le rendu via `QuestionRenderer`.

---

## Design System

### Theme visuel

Esthetique *journal academique* : papier chaud, encre profonde, accent unique.

```css
--paper: #f4ede1;    /* Fond principal */
--ink: #1b1f2a;      /* Texte */
--ember: #d94d1a;    /* Accent principal */
--teal: #1e4a47;     /* Accent secondaire (echelles) */
```

### Typographie

| Role     | Police                                          |
| -------- | ----------------------------------------------- |
| Display  | Instrument Serif (titres)                       |
| Corps    | Crimson Pro (texte long)                        |
| UI       | Inter Tight (boutons, labels)                   |
| Mono     | JetBrains Mono (donnees, debug)                 |

### Points de rupture

| Cible     | Largeur       |
| --------- | ------------- |
| Mobile    | < 480px       |
| Tablette  | 481px – 768px |
| Desktop   | > 769px       |

### Pile de z-index

```
60 : Notifications
50 : Modales
40 : ProgressRing (indicateur de progression)
30 : TopBar (barre superieure)
20 : Mascotte (compagnon)
 2 : Contenu
 1 : Fond
```

---

## Panel Debug (Tweaks)

Accessible en activant `showTweaks = true` dans `page.jsx`. Permet de :

- Changer la langue (FR / EN / RU / ZH)
- Basculer la police (Serif / Sans / Mono)
- Ajuster la densite (Spacieux / Compact)
- Basculer le theme (Clair / Sombre)

---

## Gestion d'etat

```javascript
const [lang, setLang] = useState('fr');                 // Langue active
const [filter, setFilter] = useState(null);             // Réponse Q1 (routage)
const [answers, setAnswers] = useState({});             // Réponses (clé = question.key)
const [submitted, setSubmitted] = useState(false);      // Sondage terminé
const [unlockedPartIdx, setUnlockedPartIdx] = useState(-1); // Parties débloquées
```

La **progression** est calculée en temps réel : `réponses complètes / total questions`.

---

## Développement

### Ajouter une question

1. Editer `components/survey-data.js` pour ajouter l'entrée dans la partie appropriée
2. Définir `id`, `kind`, `key`, et les champs de langue (`fr`, `en`, `ru`, `zh`)
3. Le rendu est automatique via `QuestionBlock`

### Modifier le routage

Editer `SURVEY.parts[].shows` dans `survey-data.js`. La fonction `getActiveParts(filterKey)` filtre dynamiquement les parties actives.

### Ajouter une langue

Voir la section [Internationalisation](#internationalisation) ci-dessus.

---

## Deploiement (Supabase + Netlify)

### 1. Creer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com/) → **New project**
2. Choisir une region proche des utilisateurs (ex. `eu-west-3` Paris)
3. Une fois cree, ouvrir **Project Settings → Database → Connection string**
4. Recuperer **deux** chaines de connexion :
   - **Connection pooling** (port 6543, mode `transaction`) → c'est `DATABASE_URL`
     - Ajouter `?pgbouncer=true&connection_limit=1` a la fin
   - **Direct connection** (port 5432) → c'est `DIRECT_URL` (utilise uniquement par les migrations Prisma)

> Le pooler pgbouncer est **indispensable** sur Netlify Functions : sans lui, les connexions Postgres saturent vite.

### 2. Configurer les variables locales

```bash
cp .env.example .env.local
```

Remplir `.env.local` avec les deux URLs Supabase, puis generer les secrets admin :

```bash
# Hash du mot de passe admin (cout 12)
node -e "require('bcryptjs').hash('mon-mot-de-passe-admin', 12).then(console.log)"

# Secret de signature de cookie (>= 32 chars)
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Coller le hash dans `ADMIN_PASSWORD_HASH` et le secret dans `ADMIN_SESSION_SECRET`.

### 3. Initialiser le schema

```bash
npm install
npx prisma db push          # cree les tables ReferralNode + SurveyResponse
npm run db:seed             # peuple 3 influenceurs + 18 repondants de demo (optionnel)
```

Verifier dans Supabase → **Table Editor** que les deux tables existent.

### 4. Lancer en local

```bash
npm run dev
# http://localhost:8080            ← questionnaire public
# http://localhost:8080/admin      ← dashboard admin (login requis)
```

### 5. Deployer sur Netlify

1. Pousser le code sur GitHub
2. Sur [Netlify](https://www.netlify.com/) → **Add new site → Import from Git**
3. Configurer la build :
   - **Build command** : `npx prisma generate && npm run build` (deja dans `netlify.toml`)
   - **Publish directory** : `.next`
4. **Site Settings → Environment variables**, ajouter :

| Cle                       | Valeur                                                 |
| ------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`            | URL pooler Supabase avec `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL`              | URL directe Supabase (port 5432)                       |
| `ADMIN_PASSWORD_HASH`     | Hash bcrypt genere ci-dessus                           |
| `ADMIN_SESSION_SECRET`    | Secret aleatoire >= 32 chars                           |
| `NEXT_PUBLIC_BASE_URL`    | URL publique Netlify (ex. `https://gyroroue.netlify.app`) |
| `REFERRAL_EXPIRY_DAYS`    | `90` (ou autre)                                        |

5. **Deploys → Trigger deploy** → Netlify detecte le plugin `@netlify/plugin-nextjs` et build automatiquement
6. La premiere fois, lancer `npx prisma db push` depuis local (ou via la console Supabase) si non fait

### 6. Verification post-deploiement

- Page d'accueil → repondre Q1 → verifier dans Supabase qu'un `SurveyResponse` apparait avec `completedAt = NULL`
- `/admin/login` → mot de passe → acces au dashboard
- Creer un influenceur, tester le lien `/?ref=CODE`, verifier la chaine dans `/admin/respondents/[id]`

---

## Backend & dashboard admin

L'application embarque :

- **Auto-save serveur** : chaque reponse est persistee en temps reel (debounce 800 ms + `navigator.sendBeacon` au unload). Aucune donnee perdue en cas d'abandon.
- **Systeme de parrainage viral** : codes influenceurs (manuels) + codes repondants (auto-generes), arbre hierarchique illimite via CTE recursifs Postgres.
- **Dashboard admin** protege par cookie HMAC, accessible sur `/admin` :
  - Vue d'ensemble (KPIs + graphiques 30 jours)
  - Gestion des liens influenceurs et repondants (revoquer / regenerer)
  - Arbre de parrainage par influenceur (`TreeView`)
  - Chaine ascendante par repondant (`ChainView`)
  - Statistiques detaillees par question (33 questions, heatmaps, radars MCI, croisements)
  - Exports CSV streames (toutes reponses + filleuls par influenceur)

Pas d'envoi d'email, pas de multi-admin, pas de tracking externe : peripherique deliberement minimal.

---

## Licence et credits

Etude academique en accès ouvert. Données collectées anonymement à des fins de recherche.

**Auteurs :** Huihui Ding, Hanane El Bahraoui & Matthieu Manant
**Développeur :** Stéphane TALAB
