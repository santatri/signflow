# SignFlow

SaaS de signature électronique de documents PDF. **Version 1 gratuite.**
Ce dépôt contient la **Phase 1** (fondation technique) et la **Phase 2** (authentification réelle, import, signature et export de PDF).

> État : **on peut importer un PDF, le signer (dessin, nom saisi ou image), le placer, l'exporter et le télécharger**, avec ou sans compte. Pas encore développés : vérification d'email, mot de passe oublié (l'envoi d'emails n'est pas branché), demandes de signature à d'autres personnes, limitation de débit.

## Fonctionnalités prévues

Importation de PDF · signature dessinée / par saisie du nom / par image · positionnement sur le PDF · téléchargement sécurisé · demandes de signature par email · plusieurs signataires · historique · administration.

## Contenu de la Phase 1

Landing page, design system, pages d'authentification (UI + validation), dashboard utilisateur (états vides), interface admin préparée, configuration OpenNext/Wrangler, schéma D1 + migration Drizzle, couche de stockage R2, `GET /api/health`, tests unitaires et E2E.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 · shadcn/ui (Radix) · Lucide · Zod · React Hook Form · Cloudflare Workers via `@opennextjs/cloudflare` · D1 + Drizzle ORM/Kit · R2 · Vitest · Playwright.

## Architecture

```
src/app/            routes (marketing, auth, dashboard, admin, editor, sign, api)
src/components/     ui, layout, dashboard, auth, documents
src/modules/        logique métier par domaine (storage implémenté ; autres préparés)
src/lib/            cloudflare (bindings), db (schema, client), validation, utils
src/config/         site, FAQ, statuts
drizzle/migrations/ migrations SQL générées
tests/              unit (Vitest), e2e (Playwright)
wrangler.jsonc  open-next.config.ts  drizzle.config.ts
```

Les ressources Cloudflare ne sont accessibles que via `src/lib/cloudflare/bindings.ts` (`getD1()`, `getR2()`), jamais depuis un composant React.

## Prérequis (Windows)

- Node.js 22.13 ou supérieur (exigé par pdfjs-dist 6) et npm
- Git
- Un compte Cloudflare (uniquement pour la production)

## Installation

```powershell
npm install
```

## Authentification (Phase 2)

- Mots de passe : PBKDF2-SHA256, 100 000 itérations (maximum autorisé par Workers), sel aléatoire par utilisateur.
- Sessions : jeton aléatoire de 256 bits en cookie `HttpOnly`, `SameSite=Lax` (et `Secure` en production) ; **seul son hash SHA-256 est stocké en D1**. Durée : 30 jours.
- CSRF : cookies `SameSite=Lax` + refus des requêtes d'origine étrangère sur les routes POST.
- API : `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Pages : `/dashboard` exige une session ; `/admin` exige le rôle `admin` (vérifié côté serveur).
- Aucun compte admin n'est créé par l'application. Pour promouvoir un utilisateur inscrit (local ; ajouter `--remote` pour la production) :

```powershell
npx wrangler d1 execute signflow-db --local --command "UPDATE users SET role='admin' WHERE email='ton@email.com'"
```

- Limite connue : le hachage PBKDF2 consomme du temps CPU. À vérifier au premier déploiement selon ton offre Workers (l'offre gratuite limite fortement le CPU par requête).

## Import, signature et export de PDF

Parcours : `/editor/new` (import) → `/editor/<id>` (éditeur) → téléchargement du PDF signé.

- **Import** : `POST /api/documents` (multipart). Contrôle de la signature `%PDF-`, du parsing (PDF corrompu ou protégé refusé), taille ≤ 10 Mo, ≤ 100 pages, ≤ 50 documents par propriétaire.
- **Propriétaire** : un compte, ou un visiteur sans compte via une session invité (cookie `HttpOnly`, 7 jours). Chaque requête filtre par propriétaire : le document d'un autre est indistinguable d'un document inexistant (404).
- **Stockage** : R2, privé. Le fichier n'est servi que par `GET /api/documents/<id>/file` (`?download=1` pour télécharger), jamais par un lien public.
- **Signature** : `POST /api/documents/<id>/sign` avec l'image (dessin, nom saisi ou image importée) et des emplacements en coordonnées relatives à la page. Le serveur incruste l'image avec `pdf-lib` ; chaque signature crée une nouvelle version (SHA-256 enregistré) et on peut en empiler plusieurs.
- **Affichage** : `pdfjs-dist`, chargé uniquement dans le navigateur.

Limites actuelles :
- Signature électronique **simple** : image incrustée, sans certificat ni horodatage qualifié.
- Les pages pivotées (`/Rotate`) sont refusées avec un message explicite.
- Les documents d'un visiteur ne sont pas rattachés à son compte s'il s'inscrit ensuite.
- Les signatures ne sont pas enregistrées pour réutilisation (page « Mes signatures » à venir).

## Variables

| Type | Où | Exemple |
|---|---|---|
| Variables publiques | `wrangler.jsonc` (`vars`) / `.env.local` | `APP_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` |
| Variables locales | `.env.local` pour `next dev` / `.dev.vars` pour Wrangler local | `APP_URL`, `B2_ENDPOINT`, `B2_REGION`, `B2_BUCKET` |
| Secrets locaux | `.dev.vars` (copie de `.dev.vars.example`, ignoré par Git) | `SESSION_SECRET`, `B2_KEY_ID`, `B2_APPLICATION_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `TURNSTILE_SECRET_KEY` |
| Secrets de production | `npx wrangler secret put NOM` | idem |

Ne jamais committer de secret. `.env.example` ne contient que des clés vides.

## Configuration Cloudflare et Backblaze B2

Le déploiement utilise Cloudflare Workers et D1. Les fichiers sont stockés dans un bucket Backblaze B2 privé via son API S3 compatible ; aucun bucket R2 n'est requis.

```powershell
npx wrangler login
npx wrangler d1 create signflow-db
```

Reporte le vrai `database_id` affiché dans `wrangler.jsonc`, à la place de l'identifiant factice. La migration SQL est ensuite appliquée avec `npm run db:migrate:remote`.

Dans Backblaze, crée une clé d'application limitée au bucket `signflow`, avec les permissions de lecture, écriture, suppression et liste nécessaires. Renseigne son Key ID et son Application Key comme secrets, jamais dans `wrangler.jsonc` :

```powershell
npx wrangler secret put B2_KEY_ID
npx wrangler secret put B2_APPLICATION_KEY
npx wrangler secret put SESSION_SECRET
```

Le compte B2 fourni utilise l'endpoint `https://s3.us-east-005.backblazeb2.com` et la région `us-east-005`, déjà configurés dans `wrangler.jsonc`. Les objets restent privés et ne sont servis qu'après vérification du propriétaire dans l'application.

Le nom du Worker est `signflow`, donc son URL Workers prévue est `https://signflow.santatriniainafeno01.workers.dev` si le sous-domaine Workers de ce compte est bien `santatriniainafeno01`. `APP_URL` est défini sur cette URL.

## Migrations

```powershell
npm run db:generate          # génère le SQL après modification du schéma
npm run db:migrate:local     # applique en local
npm run db:migrate:remote    # production : à lancer manuellement, après relecture du SQL
```

Ne jamais appliquer une migration destructive en production sans sauvegarde et validation.

## Lancement local

```powershell
npm run dev
```

Pour activer le stockage B2 en local, ajoute `B2_KEY_ID` et `B2_APPLICATION_KEY` dans `.env.local` (pour `next dev`) ou `.dev.vars` (pour Wrangler). Ces identifiants sont indispensables ; sans eux, les fonctions de stockage ne sont pas configurées.

Pour tester avec les bindings D1 locaux et le runtime Workers :

```powershell
npm run db:migrate:local
npm run cf:build
npx wrangler dev
```

Contrôle : `/api/health` sur le port indiqué par Wrangler.

## Tests

```powershell
npm run lint
npm run typecheck
npm run test          # Vitest
npx playwright install chromium
npm run test:e2e      # Playwright (construit puis démarre l'app)
```

## Build et déploiement

```powershell
npm run build         # build Next.js
npm run cf:build      # build OpenNext (.open-next/worker.js)
npm run deploy        # build + déploiement (après wrangler login et création des ressources)
```

### Déploiement automatique via GitHub Actions

Le workflow `.github/workflows/deploy.yml` vérifie lint, types et tests, puis déploie sur Cloudflare à chaque push sur `master` (ou lancement manuel depuis `master`). Dans les paramètres du dépôt GitHub, ajoute les secrets d'action suivants :

- `CLOUDFLARE_API_TOKEN` : jeton Cloudflare avec les permissions de déploiement Workers et d'accès à la ressource D1 configurée.
- `CLOUDFLARE_ACCOUNT_ID` : identifiant du compte Cloudflare.

Les clés B2 et `SESSION_SECRET` restent des secrets du Worker sur Cloudflare ; elles ne sont pas nécessaires au workflow de build et ne doivent pas être ajoutées aux secrets GitHub.

## Dépannage

- **`Error occurred prerendering page` au build** : supprimer le dossier `.next` puis relancer `npm run build`.
- **`database_id` invalide au déploiement** : créer la base D1 et mettre à jour `wrangler.jsonc`.
- **`playwright install` échoue** : vérifier l'accès réseau à `cdn.playwright.dev`.
