## Rapport de projet — CinéConnect

### 1) Introduction et objectifs

**CinéConnect** est une application web full stack collaborative qui permet de:

- rechercher et explorer des films;
- enrichir un catalogue local avec des données externes (OMDb);
- noter et commenter des films;
- interagir entre utilisateurs via un système social (amis) et une messagerie.

Le projet a été réalisé dans une logique pédagogique progressive (React, UI, base de données, Node/JWT/Swagger), avec un objectif final de livraison d’une application cohérente, testée, documentée, et exploitable en démonstration.

---

### 2) Architecture globale du système

#### 2.1 Vue d’ensemble

Le projet est organisé en **monorepo pnpm**:

- `frontend/` : application cliente React;
- `backend/` : API Node.js/Express + logique métier + accès base;
- `shared/` : types/éléments mutualisés;
- `docs/` : documentation technique, schéma, rapport.

Flux principal:

1. Le front appelle l’API REST (`/api/*`) pour les opérations applicatives.
2. L’API interagit avec PostgreSQL via Drizzle/SQL.
3. Pour la recherche externe, le backend agit comme passerelle OMDb.
4. La messagerie temps réel repose sur Socket.io (JWT côté handshake).

#### 2.2 Architecture frontend

Stack et principes:

- **React + TypeScript** pour la structure des interfaces;
- **TanStack Router** pour un routing typé et explicite;
- **TanStack Query** pour la gestion des requêtes, cache, invalidations et mutations;
- **TailwindCSS** pour le design system et la cohérence UI;
- séparation claire entre `pages/`, `components/`, `hooks/`, `lib/`, `services/`.

Routes principales implémentées:

- `/`, `/films`, `/film/:id`, `/profil`, `/discussion`, `/amis`, `/utilisateurs`, `/settings`, auth (`/login`, `/register`, reset password).

Le front reste découplé de la persistance: il manipule des contrats d’API et délègue la logique de données au backend.

#### 2.3 Architecture backend

Le backend est structuré par couches:

- **Routes**: exposition HTTP (`src/routes`);
- **Contrôleurs/services**: logique métier;
- **Middlewares**: auth JWT/validation;
- **DB**: accès PostgreSQL et schémas relationnels;
- **Swagger**: génération/assemblage du document OpenAPI.

Points clés:

- point d’entrée HTTP via `createApp()` + `server.ts` (démarrage);
- routes métier: auth, films, users, reviews, friends, messages, conversations;
- documentation interactive exposée sur `/api/docs` et JSON OpenAPI sur `/api/docs-json`.

#### 2.4 Base de données et modèle relationnel

Le modèle couvre les domaines centraux:

- `users`
- `films`
- `categories`
- `film_categories`
- `reviews`
- `friendships`
- `conversations`, `conversation_members`, `messages`

Des contraintes d’intégrité importantes sont appliquées:

- unicité email/username;
- unicité `films.imdb_id`;
- unicité `(film_id, category_id)` pour la table de jointure;
- unicité logique d’avis utilisateur/film.

Cette modélisation garantit la cohérence fonctionnelle (catalogue, social, discussion) tout en restant évolutive.

#### 2.5 Temps réel (WebSocket)

Le chat temps réel utilise **Socket.io**:

- authentification via token JWT au handshake;
- diffusion d’événements de conversation (`new-message`, typing, seen, reactions);
- gestion d’état des utilisateurs connectés.

Le temps réel est isolé de la couche REST mais partage les mêmes règles de sécurité (utilisateur authentifié et membre d’une conversation).

---

### 3) Répartition des rôles et organisation d’équipe

Le projet est pensé pour une équipe de 3 personnes max. La répartition suivante a permis d’avancer en parallèle sans perdre la cohérence technique:

#### Rôle 1 — Frontend & UX

- conception des pages et composants;
- intégration TanStack Router/Query;
- thème visuel, responsive et parcours utilisateur;
- intégration des formulaires auth/profil/discussion.

#### Rôle 2 — Backend & base de données

- conception des routes REST et logique métier;
- modélisation Drizzle/PostgreSQL, contraintes, migrations;
- sécurité JWT et middlewares d’accès;
- endpoints social/reviews/messaging.

#### Rôle 3 — Qualité, documentation et intégration

- stratégie de tests unitaires/intégration;
- maintien de la couverture et stabilité CI;
- Swagger/OpenAPI et mise à jour du README;
- revue de code, conventions, intégration GitHub.

#### Méthode de travail

- branches par fonctionnalité;
- commits atomiques et explicites;
- synchronisation régulière;
- validation fonctionnelle croisée avant merge.

Cette organisation a limité les conflits et accéléré la livraison progressive des modules.

---

### 4) Choix techniques et justifications

#### 4.1 Pourquoi un monorepo pnpm?

- dépendances centralisées;
- scripts globaux (`dev`, `test`, `test:coverage`);
- cohérence outillage entre front et back;
- meilleure visibilité pour l’évaluation et la maintenance.

#### 4.2 Pourquoi React + TanStack?

- React pour la modularité composant;
- TanStack Router pour des routes explicites et typées;
- TanStack Query pour fiabiliser les appels API et le cache;
- architecture propice aux écrans riches (films, profil, discussions).

#### 4.3 Pourquoi Express + Drizzle + PostgreSQL?

- Express: simplicité et contrôle fin des endpoints;
- Drizzle: mapping SQL typé et lisible;
- PostgreSQL: robustesse relationnelle et requêtage avancé.

Ce trio répond bien à un projet académique full stack avec besoins relationnels forts (users, relations sociales, messages).

#### 4.4 Pourquoi JWT?

- standard largement adopté;
- pratique pour sécuriser routes REST et socket;
- compatible front SPA (stockage/gestion session côté client).

#### 4.5 Pourquoi Swagger/OpenAPI?

- documentation vivante de l’API;
- accélère tests manuels et onboarding;
- améliore la qualité de communication entre front/back.

#### 4.6 Pourquoi Vitest (et Supertest côté API)?

- exécution rapide et adaptée à Vite/TS;
- tests unitaires + intégration HTTP;
- contrôle de non-régression;
- couverture mesurée et maintenue sur le périmètre métier.

---

### 5) Qualité logicielle, tests et documentation

La qualité a été traitée comme un axe de livraison, pas comme une étape finale.

Actions mises en place:

- tests backend (auth, swagger/openapi, films/OMDb, middlewares, utilitaires, messages);
- tests frontend (lib, hooks, composants clés, services);
- couverture `test:coverage` avec seuils élevés;
- documentation centralisée (`README`, `docs/schema.md`, `docs/rapport.md`, Swagger).

Résultat: l’application est démontrable et techniquement argumentable devant un jury (fonctionnement + preuve de qualité).

---

### 6) Limites, arbitrages et perspectives

#### Limites assumées

- certaines options du sujet sont traitées en priorité fonctionnelle avant optimisation avancée;
- la couverture à 100% est appliquée sur un périmètre ciblé pertinent (métier/utilitaires/hook/services essentiels), et non sur l’intégralité des écrans volumineux.

#### Évolutions possibles

- extension de la couverture aux pages complexes;
- enrichissement des filtres avancés (réalisateur, agrégats de notes, recommandations);
- optimisation perf et observabilité (logs structurés, métriques);
- durcissement sécurité/ops (rate limiting, rotation secrets, CI plus poussée).

---

### 7) Conclusion

Le projet **CinéConnect** répond aux objectifs principaux du cahier des charges:

- architecture full stack cohérente;
- frontend moderne avec routing et gestion de données maîtrisés;
- backend sécurisé, documenté et connecté à une base relationnelle;
- fonctionnalités sociales et messagerie temps réel opérationnelles;
- démarche qualité solide (tests + documentation).

Au-delà de la mise en oeuvre technique, le projet démontre une capacité de travail en équipe, de structuration logicielle, et de livraison progressive conforme aux attentes pédagogiques.

