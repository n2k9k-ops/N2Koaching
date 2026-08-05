# N2Koaching

App de coaching sportif premium (PWA installable), thème façon Apple : programmes Push/Pull/Legs, Upper/Lower, HIIT, cardio et un programme maison, séances guidées avec **log des charges/répétitions et repos obligatoire entre les séries**, gamification (XP, niveaux, badges), nutrition, calendrier — et un **vrai système de compte avec validation par le coach**, propulsé par **Supabase**.

Aucun visiteur ne peut utiliser l'app sans que son inscription soit validée par le coach. Il n'y a plus de mode démo.

## 1. Créer le backend Supabase (10 minutes)

1. Crée un compte sur https://supabase.com et un nouveau projet (gratuit).
2. Dans **Project Settings → API**, récupère `Project URL` et la clé `anon public`.
3. Dans **SQL Editor**, ouvre une nouvelle requête, colle le contenu de `supabase/schema.sql` (fourni dans ce dossier) et exécute-le. Cela crée :
   - la table `profiles` (statut, XP, niveau, programme assigné, etc.),
   - les règles de sécurité (RLS) : chaque client ne voit que son propre profil, le coach voit tout,
   - un trigger qui empêche un client de s'auto-valider ou de s'auto-assigner un programme, même en contournant l'interface,
   - un trigger qui crée automatiquement un profil (`status = pending`) à chaque inscription.
4. (Optionnel mais recommandé pour aller vite en test) Dans **Authentication → Providers → Email**, tu peux désactiver *"Confirm email"* le temps des tests, pour ne pas dépendre d'un envoi d'email réel.

### Créer ton premier compte coach

1. Inscris-toi normalement depuis l'app avec l'email que tu veux utiliser comme coach.
2. Dans le **SQL Editor** Supabase, exécute :
   ```sql
   update public.profiles
   set is_admin = true, status = 'approved'
   where email = 'ton-email-coach@exemple.com';
   ```
3. Reconnecte-toi dans l'app avec cet email : tu arrives directement sur l'**espace coach** (plus besoin de code d'accès séparé).

## 2. Configurer le projet

```bash
cp .env.example .env
```
Remplis `.env` avec ton `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` récupérés à l'étape 1.

## 3. Lancer en local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build       # build de production dans dist/
npm run preview     # prévisualiser le build
```

## 4. Déployer ce soir

**Vercel (recommandé) :**
1. Pousse ce dossier sur un repo GitHub.
2. https://vercel.com/new → importe le repo → Vercel détecte Vite automatiquement.
3. Dans les **Environment Variables** du projet Vercel, ajoute `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
4. Déploie. URL HTTPS stable, nécessaire pour l'installation PWA sur téléphone.

**Netlify Drop (encore plus rapide) :**
1. En local : `npm run build`.
2. Glisse le dossier `dist/` sur https://app.netlify.com/drop.
   ⚠️ Cette méthode n'injecte pas les variables d'environnement : préfère Vercel/Netlify via Git si tu veux que Supabase fonctionne en production.

## Comment fonctionne le parcours client

1. Un visiteur crée un compte (`status = pending` automatiquement).
2. Il ne voit qu'un écran "inscription en attente" — aucune donnée, aucun programme, tant que le coach n'a pas validé.
3. Le coach se connecte (compte `is_admin = true`) → arrive directement sur l'**espace coach** :
   - onglet **À valider** : Valider / Refuser chaque inscription,
   - onglet **Clients** : pour chaque client validé, assigner un programme de la bibliothèque **ou** construire une séance sur-mesure jour par jour en piochant dans la **bibliothèque de ~100 exercices catégorisés** (Pectoraux, Dos, Épaules, Biceps, Triceps, Quadriceps, Ischios & Fessiers, Mollets, Abdominaux, Cardio, Full Body/Maison), avec séries/reps/repos éditables par exercice.
4. Une fois approuvé, le client retrouve son programme (bibliothèque ou sur-mesure) épinglé en haut de son tableau de bord, et peut logger chaque série (charge + reps) avec repos obligatoire entre chaque série.

## Nouveautés : programmes réutilisables, dashboard, PDF, messagerie

- **Programmes réutilisables** : dans le constructeur "Sur-mesure", le coach peut enregistrer un programme comme **modèle** (bouton "Enregistrer comme modèle réutilisable"), et le recharger pour n'importe quel autre client. Il peut aussi **copier directement le programme d'un autre client déjà configuré** depuis un menu déroulant en haut du constructeur.
- **Dashboard coach global** : onglet **"Vue d'ensemble"** dans l'espace coach — qui a loggé une séance aujourd'hui, qui est inactif depuis 5 jours ou plus, trié par dernière activité.
- **Export PDF** : bouton "Exporter le programme en PDF" sur la fiche de chaque programme (bibliothèque ou sur-mesure), généré 100% côté client (aucun serveur requis), avec le plan hebdomadaire complet et le détail de chaque exercice.
- **Messagerie coach ↔ client** : un onglet "Messages" côté client, et un bouton 💬 sur chaque client côté coach — conversation en temps quasi-réel (rafraîchissement toutes les 8 secondes).

⚠️ Si tu avais déjà exécuté `supabase/schema.sql` avant cette mise à jour, il faut **relancer le fichier complet une nouvelle fois** dans le SQL Editor : il ajoute la colonne `last_session_at`, les tables `program_templates` et `messages`, et corrige un bug du trigger de sécurité (voir plus bas). Toutes les commandes utilisent `create table if not exists` / `add column if not exists`, donc c'est sans risque de le relancer.

## Sécurité — ce qui est fait, et ce qu'il reste à durcir pour une vraie mise à l'échelle



**Fait :**
- Authentification réelle par email/mot de passe (Supabase Auth), pas de mot de passe en clair côté app.
- RLS Postgres : un client ne peut lire/écrire que sa propre ligne.
- Trigger `protect_admin_fields` : même un appel API direct (hors interface) ne peut pas modifier `status`, `is_admin`, `assigned_program_id` ou `custom_program` si l'appelant n'est pas admin.

**À prévoir avant une vraie mise en production commerciale :**
- Email de confirmation à l'inscription (active *Confirm email* dans Supabase Auth).
- Emails transactionnels (notification au client quand son inscription est validée) — Supabase peut se brancher sur un service comme Resend ou Postmark via une Edge Function.
- Réinitialisation de mot de passe (Supabase la propose nativement, à intégrer dans l'UI si besoin).
- Un deuxième rôle "coach" distinct d'admin si tu as plusieurs coachs avec des portefeuilles de clients séparés (actuellement, tout compte `is_admin = true` voit tous les clients).

## Structure du projet

```
n2koaching/
├── index.html
├── vite.config.js         # config Vite + génération auto du service worker (vite-plugin-pwa)
├── package.json
├── .env.example
├── supabase/schema.sql    # à exécuter dans Supabase SQL Editor
├── public/icons/          # icônes de l'app (192, 512, apple-touch-icon, favicons)
└── src/
    ├── main.jsx
    ├── lib/
    │   ├── supabaseClient.js
    │   └── api.js          # toute la logique Supabase (auth, profils, admin)
    └── App.jsx              # toute l'interface
```

## Personnalisation rapide

- **Couleurs / thème Apple** : `src/App.jsx`, fonction `palette(dark)`.
- **Programmes de la bibliothèque** : `src/App.jsx`, constante `PROGRAMS`.
- **Bibliothèque d'exercices du coach** : `src/App.jsx`, constante `EXERCISE_LIBRARY` (et `EXERCISE_CATEGORIES` pour les catégories).
- **Icônes** : `public/icons/`.

## Vidéos de démonstration

Un lien YouTube optionnel peut être attaché à chaque exercice quand tu construis une séance sur-mesure (que tu piochais dans la bibliothèque ou que tu crées un exercice personnalisé). Si un lien est renseigné, la vidéo s'affiche intégrée directement dans l'app (mode focus). Sans lien renseigné, un bouton "Rechercher une démonstration vidéo" ouvre une recherche YouTube pré-remplie avec le nom de l'exercice.


## Données réelles partout (plus de démo)

- **Défis du jour** : calculés à partir de vos vraies données (hydratation, séances loggées aujourd'hui, calories réelles du jour).
- **Activité de la semaine** : graphique basé sur les séances effectivement complétées, pas des chiffres fixes.
- **Calendrier** : statistiques du mois/semaine et grille calendaire construites à partir des dates réelles de complétion, historique récent réel.
- **Évolution du poids** (Profil) : nouvelle table `weight_logs` — un bouton "Enregistrer" permet de logger son poids à tout moment, le graphique se construit avec les vraies données au fil des semaines.
- **Photos par exercice** : un bucket de stockage Supabase (`exercise-photos`, public en lecture, écriture réservée au coach) permet d'attacher une photo de référence à n'importe quel exercice depuis le constructeur de séance sur-mesure, affichée en mode focus à côté de la vidéo.

⚠️ Comme pour les mises à jour précédentes : relance `supabase/schema.sql` en entier dans le SQL Editor (ajoute la table `weight_logs` et le bucket `exercise-photos`, sans risque à rejouer).

## Onboarding complet, compléments alimentaires, photo de profil

- **Onboarding en 7 étapes** : poids, taille, âge, genre, objectif (perte de poids / prise de masse / recomposition / performance), fréquence d'entraînement, blessures/limitations (optionnel). Toutes les infos sont désormais réellement demandées et enregistrées — plus de valeurs par défaut génériques dans le profil.
- **Compléments alimentaires suggérés** (onglet Nutrition) : recommandations générales adaptées à l'objectif du client (ex. créatine + whey pour la prise de masse, whey + fibres pour la perte de poids), avec un disclaimer clair — c'est de l'information éducative générale, pas un avis médical personnalisé.
- **Photo de profil** : bouton caméra sur l'avatar dans l'onglet Profil, upload direct vers un bucket Supabase Storage dédié (`avatars`, chaque utilisateur ne peut écrire que dans son propre dossier).
- Le calculateur de calories dans Nutrition utilise maintenant l'âge et le genre réels du profil comme valeurs par défaut (au lieu de 28 ans / homme codés en dur).

⚠️ Relance `supabase/schema.sql` en entier (ajoute `gender`, `injuries`, `avatar_url` sur `profiles`, et le bucket `avatars`).

## Mot de passe oublié, connexion Google/Apple, optimisation, abonnement Stripe

### Mot de passe oublié
Fonctionne directement, rien à configurer côté Supabase (utilise le SMTP déjà branché). Lien "Mot de passe oublié ?" sur l'écran de connexion.

### Connexion Google / Apple
Le code est prêt (boutons + appels Supabase), mais **il faut activer les providers côté Supabase** avec tes propres identifiants OAuth :

**Google :**
1. [Google Cloud Console](https://console.cloud.google.com) → crée un projet → **APIs & Services → Credentials → Create OAuth Client ID** (type "Web application").
2. Ajoute comme *Authorized redirect URI* : `https://<PROJECT_REF>.supabase.co/auth/v1/callback` (trouvable dans Supabase → Authentication → Providers → Google).
3. Copie le Client ID et le Client Secret dans Supabase → Authentication → Providers → **Google** → active-le et colle-les.

**Apple :** nécessite un compte Apple Developer payant (99$/an) — plus lourd à configurer. Étapes détaillées : [doc officielle Supabase](https://supabase.com/docs/guides/auth/social-login/auth-apple). Si tu ne veux pas t'en occuper tout de suite, le bouton Apple peut simplement être retiré de `AuthScreen` dans `src/App.jsx`.

### Optimisation
- `jsPDF` (~230 Ko) n'est plus chargé au démarrage — seulement quand quelqu'un clique "Exporter en PDF".
- Le build sépare maintenant React, les graphiques (recharts), les icônes et Supabase en chunks distincts, mis en cache indépendamment par le navigateur (un futur déploiement qui ne touche pas ces libs n'oblige pas à retélécharger ces morceaux).

### Abonnement Stripe

⚠️ **Fonctionnalité désactivée par défaut** (`SUBSCRIPTION_ENABLED = false` dans `src/App.jsx`) tant que tu n'as pas terminé la config ci-dessous — ça ne casse rien de ton app actuelle.

**1. Crée ton produit dans Stripe**
1. [Dashboard Stripe](https://dashboard.stripe.com) → **Produits** → crée un produit avec un prix récurrent (ex: 29€/mois) → note l'ID du prix (`price_...`).
2. Reste en **mode Test** pour vérifier que tout fonctionne avant de passer en mode Live.

**2. Installe la CLI Supabase et déploie les 3 fonctions**
```bash
npm install -g supabase
supabase login
supabase link --project-ref <TON_PROJECT_REF>
supabase functions deploy create-checkout-session
supabase functions deploy create-billing-portal-session
supabase functions deploy stripe-webhook --no-verify-jwt
```
(`--no-verify-jwt` sur le webhook uniquement : Stripe ne peut pas envoyer de JWT Supabase, la vérification se fait via la signature Stripe à la place.)

**3. Configure les secrets des fonctions**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_PRICE_ID=price_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set APP_URL=https://ton-app.vercel.app
```
(`STRIPE_WEBHOOK_SECRET` s'obtient après l'étape 4 — reviens le configurer ensuite.)

**4. Branche le webhook Stripe**
1. Stripe Dashboard → **Développeurs → Webhooks → Ajouter un point de terminaison**.
2. URL : `https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook`
3. Événements à écouter : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
4. Copie le "Signing secret" (`whsec_...`) → `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

**5. Relance le SQL** (ajoute `stripe_customer_id`, `subscription_id`, `subscription_status` sur `profiles`, protégés du bidouillage client par le trigger existant).

**6. Active la fonctionnalité**
Dans `src/App.jsx`, passe `SUBSCRIPTION_ENABLED` à `true`. Une section "Abonnement" apparaît alors dans l'onglet Profil, avec bouton "S'abonner" (Stripe Checkout) ou "Gérer mon abonnement" (portail client Stripe) selon le statut.

**7. Teste en mode Test Stripe** avant de basculer les clés en mode Live — utilise une carte de test Stripe (`4242 4242 4242 4242`, n'importe quelle date future, n'importe quel CVC).

## Redesign connexion/vitrine, animations d'onboarding, points hebdo

- **Écran de connexion redesigné** : fond avec des formes dégradées animées (flottement lent), carte flottante en verre dépoli (glassmorphism), sélecteur d'onglet Connexion/Créer un compte avec indicateur qui glisse. Boutons Google/Apple retirés (config trop lourde pour l'instant — le code reste dans `src/lib/api.js` si tu changes d'avis un jour, juste plus branché dans l'interface).
- **Page vitrine** : même fond animé derrière le hero, cartes de statistiques avec icônes dans des cercles dégradés, typographie plus impactante.
- **Onboarding** : transition en glissement entre chaque étape (au lieu d'un simple fondu), et un écran de célébration animé ("Profil créé !" avec cercle qui pulse et anneau qui s'expand) avant d'arriver sur l'espace d'attente.
- **Points de la semaine** : nouvelle carte en haut du tableau de bord, style "résumé hebdomadaire" — XP gagné cette semaine, nombre de séances, temps total, calories, calculés à partir des vraies séances loggées (se réinitialise chaque lundi).
