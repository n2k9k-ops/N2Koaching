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

## Rest skippable, "dernière fois", revoir ses perfs

⚠️ Relance `supabase/schema.sql` en entier (ajoute la table `exercise_logs` qui enregistre chaque série loggée — c'est ce qui permet les deux fonctionnalités suivantes).

- **Repos "passable"** : en mode focus, un bouton "Passer le repos" apparaît pendant le décompte — plus obligatoire.
- **"Dernière fois"** : en démarrant un exercice, l'app va chercher la dernière fois où il a été fait (toutes séances confondues) et affiche "Dernière fois : 40kg × 10" — les champs de saisie sont même pré-remplis en placeholder avec ces valeurs.
- **Revoir ses performances** : dans le détail d'un programme, une séance déjà terminée apparaît en **vert** avec une coche. Cliquer dessus n'ouvre plus la séance interactive — ça ouvre un écran en lecture seule listant, exercice par exercice, exactement ce qui a été loggé (charge × reps par série).

## Exercices personnalisés rejoignent la bibliothèque

⚠️ Relance `supabase/schema.sql` en entier (ajoute la table `custom_exercises`).

Quand tu crées un exercice personnalisé dans le constructeur de séance, il est maintenant **sauvegardé dans une bibliothèque partagée** — il apparaît ensuite dans les résultats de recherche pour **tous tes futurs clients**, avec un badge "Perso" pour le distinguer des exercices intégrés à l'app. Avant cette mise à jour, l'exercice n'existait que dans la séance où tu l'avais créé.

## Temps réel chronométré (au lieu d'une estimation)

Aucun changement SQL cette fois.

Avant : le "X min" affiché après une séance était toujours la même estimation calculée à l'avance (5 min échauffement + ~1min15 par série + 4 min retour au calme), sans lien avec le temps réellement passé — d'où l'incohérence, surtout depuis que le repos est skippable.

Maintenant : le chrono démarre réellement quand tu cliques "Démarrer les exercices", et le temps affiché après coup (historique, calendrier, points de la semaine, total cumulé) est le **vrai temps écoulé**. L'estimation reste affichée, mais seulement *avant* de commencer une séance, clairement marquée "estimé" pour ne pas donner une fausse impression de précision.

## Révoquer l'accès d'un client

⚠️ Relance `supabase/schema.sql` en entier (ajoute la colonne `revoke_reason` et étend les statuts possibles à `revoked`).

Sur la fiche d'un client actif, un lien discret **"Révoquer l'accès"** ouvre un petit formulaire avec un motif optionnel. Une fois révoqué :
- Le client ne peut plus se connecter — il tombe sur un écran **"Accès révoqué"** affichant le motif que tu as choisi.
- Le compte reste visible dans l'onglet Clients avec un badge rouge "Révoqué", et un bouton **"Réactiver l'accès"** permet d'annuler la révocation à tout moment.

**Sur la suppression complète (pas seulement la révocation)** : je n'ai pas ajouté de bouton "supprimer" qui efface totalement le compte et ses données. Le faire proprement demanderait une Edge Function supplémentaire (comme pour Stripe) à déployer via la CLI Supabase — je n'ai pas voulu te l'imposer sans demander vu ta réaction sur Stripe. Si tu veux supprimer un compte définitivement dès maintenant, sans code supplémentaire : Supabase Dashboard → **Authentication → Users** → trouve l'utilisateur → **Delete user**. Ça supprime le compte et, grâce à la référence `on delete cascade`, toutes ses données associées (profil, séries loggées, messages, etc.) avec lui.

## Son/vibration en fin de repos, annuler une série, streak avec gel mensuel, logo

⚠️ Relance `supabase/schema.sql` en entier (ajoute `streak_freeze_used_at`, une contrainte d'unicité sur `exercise_logs` pour permettre l'annulation propre, et la policy UPDATE correspondante).

**Son + vibration** : à la fin d'un repos, l'app fait vibrer le téléphone et joue un petit bip synthétisé (pas de fichier audio externe). La vibration ne fonctionne que sur Android/Chrome — Safari iOS ne supporte pas l'API Vibration, c'est une limite de la plateforme, pas du code.

**Annuler la dernière série** : pendant le décompte de repos, un lien "Annuler la dernière série" permet de revenir en arrière et corriger une saisie. Limité à la série qui vient d'être validée (pas d'annulation en cascade sur plusieurs séries).

**Streak avec gel mensuel** : jusqu'ici, le compteur de série augmentait bêtement à chaque séance sans jamais vérifier les jours réels — un "gel" n'aurait donc jamais servi à rien. La série est maintenant calculée à partir des vraies dates de séances, avec un **gel gratuit par mois** qui comble automatiquement un jour manqué sans casser la série. Visible dans le Profil et sur le tableau de bord (icône 🧊 quand un gel est disponible).

**Logo** : régénéré en plus haute qualité — police géométrique premium (TeX Gyre Adventor, dans l'esprit Futura), rendu en survolume (4x) puis réduit pour un anti-crénelage net, dégradé diagonal plus fidèle au thème de l'app, reflet subtil et ombre portée légère pour la profondeur.

## Photos hebdo pour le coach, durée d'abonnement, fix centrage repos

⚠️ Relance `supabase/schema.sql` en entier (ajoute `access_expires_at`, la table `progress_photos` et son bucket de stockage).

**Photos de progression** : nouvel onglet "Photos" côté client — upload d'une photo + note optionnelle, historique complet. Côté coach, un bouton 📷 sur chaque client ouvre le fil de ses photos avec un champ de réponse par photo.

⚠️ **Point de confidentialité à connaître** : comme les autres photos de l'app (exercices, avatars), le bucket `progress-photos` est public en lecture — n'importe qui connaissant l'URL exacte (générée avec un timestamp, donc pas devinable facilement) peut la voir. Pour des photos de progression corporelle, c'est plus sensible que les photos d'exercices. Si tu veux un vrai contrôle d'accès (seul le client et le coach peuvent voir), il faudrait passer par des URLs signées à durée limitée — dis-le-moi si tu veux qu'on le fasse, ça demande un peu plus de travail.

**Durée d'abonnement à la validation** : en validant une inscription, le coach choisit maintenant une durée (1 semaine / 1 mois / 3 mois / 6 mois / 1 an / illimité). Une fois la date dépassée, le client tombe automatiquement sur l'écran "accès révoqué" avec la date d'expiration indiquée. Un bouton "Renouveler" permet de prolonger à tout moment, y compris après expiration.

⚠️ **Nuance honnête sur "automatique"** : il n'y a pas de tâche planifiée côté serveur qui coupe l'accès à la seconde précise de l'expiration (ça demanderait une Edge Function + un cron, comme pour Stripe). La vérification se fait à chaque chargement de l'app — dans la pratique, l'accès est coupé au prochain rechargement après l'expiration, ce qui couvre l'immense majorité des cas réels.

**Fix : décompte de repos mal centré** — un bug que j'avais moi-même introduit en ajoutant les boutons "passer"/"annuler" plus tôt. Corrigé.

## Message groupé, ressenti post-séance détaillé

⚠️ Relance `supabase/schema.sql` en entier (ajoute la table `session_feedback`).

**Message groupé** : dans l'espace coach, bouton "Message groupé à tous les clients" — un seul message envoyé d'un coup dans le fil de chaque client actif, au lieu de le retaper dans chaque conversation.

**Ressenti post-séance** : après chaque séance terminée, un écran demande — difficulté ressentie (1 à 10, slider vert→rouge), niveau d'énergie après l'effort (1 à 10), courbatures attendues (Aucune/Légères/Modérées/Fortes), et un commentaire libre optionnel. Skippable si le client ne veut pas répondre. Côté coach, un bouton 📊 sur chaque client affiche l'historique complet, la moyenne des 5 dernières séances, et une alerte automatique si le RPE moyen est élevé **et** l'énergie moyenne basse en même temps — signe de fatigue qui s'installe.

## Zoom photo, fix texte invisible, Street Workout, nouveau logo

⚠️ Relance `supabase/schema.sql` en entier si ce n'est pas déjà fait pour la mise à jour précédente (table `session_feedback`).

- **Zoom photo** : tap sur n'importe quelle photo de progression (client ou coach) pour l'agrandir en plein écran.
- **Fix texte noir sur noir** : l'écran de ressenti post-séance oubliait de définir la couleur du texte — corrigé, ainsi que le même risque sur l'écran plein écran des exercices.
- **Street Workout** : nouvelle catégorie d'exercices (tractions, dips, muscle-up, pistol squat, L-sit, front lever, human flag...) et deux programmes : "Street Workout Fondations" (Débutant) et "Street Workout Performance" (Avancé).
- **Nouveau logo** : un vrai symbole cette fois (pas du texte) — trois barres ascendantes avec une flèche vers le haut, représentant la progression. Régénéré en haute qualité (`public/icons/`) et appliqué aussi dans l'app elle-même (le logo affiché dans les écrans de connexion, la sidebar, etc. correspond maintenant exactement à l'icône de l'app).

## Bandeau de rappel avant expiration

Aucun changement SQL — ça réutilise `access_expires_at` déjà en place.

Un bandeau orange apparaît sur le tableau de bord du client dans les **7 jours** avant l'expiration de son accès, avec la date exacte. La même info est aussi visible en permanence dans son Profil (onglet "Abonnement"), qu'elle soit proche de l'expiration ou non — "Accès illimité" si aucune date n'est fixée.

## Logo — troisième itération : une flamme

Aucun changement SQL. Nouveau concept : une flamme blanche à cœur ambre, une seule forme organique et fluide (fini les éléments disjoints du logo précédent), cohérente avec l'icône 🔥 déjà utilisée partout dans l'app pour le streak. Appliquée aux icônes (`public/icons/`) et dans l'app elle-même.

## Tutoriel d'installation à l'inscription (iPhone / Android)

Aucun changement SQL.

Juste après avoir créé son profil (onboarding), le nouveau client voit un écran "Installez l'application" avec deux choix : **iPhone** ou **Android**. Chaque choix ouvre un tutoriel étape par étape spécifique à la plateforme (Safari + bouton Partager pour iOS, menu ⋮ + Chrome pour Android). Un lien "Passer cette étape" reste disponible pour ne pas bloquer l'inscription.

## Exercices complémentaires (bibliothèque étendue)

Aucun changement SQL — ce sont des exercices statiques ajoutés au code, pas des données coach.

⚠️ **Sur la vidéo envoyée** : je n'ai pas copié les images de l'autre application (droits d'auteur), mais j'ai identifié et ajouté les mouvements qui manquaient vraiment à ta bibliothèque, avec du contenu original (sets/reps/conseils/sécurité) dans le même style que le reste :
- Rowing Pendlay
- Soulevé de terre sumo
- Épaulé (clean) et Épaulé-jeté (clean and jerk) — mouvements olympiques
- Tractions prise supination (chin-up)
- Développé au sol (floor press)
- Développé incliné à la poulie
- Adduction hanche machine
- Squat overhead
- Turkish get-up (kettlebell)

Si tu repères d'autres exercices précis de la vidéo que tu veux vraiment absolument avoir (j'ai fait une sélection représentative plutôt que les ~400 exercices un par un), donne-moi les noms et je les ajoute.

## Espace coach amélioré (tableau de bord, navigation, design)

Aucun changement SQL.

- **Tableau de bord enrichi** : "Vue d'ensemble" est maintenant le premier onglet affiché en arrivant dans l'espace coach. Nouvelles stats globales — séances cumulées tous clients, abonnements expirant sous 7 jours (avec liste dédiée), graphique d'activité hebdomadaire agrégé sur tous les clients.
- **Navigation réordonnée** : Vue d'ensemble → À valider → Clients, dans l'ordre où un coach en a réellement besoin en se connectant.
- **Design** : carte d'accueil dégradée en haut avec les stats essentielles d'un coup d'œil (clients actifs, en attente, actifs aujourd'hui), déconnexion déplacée en icône discrète dans l'en-tête au lieu d'un gros bouton, cartes de stats avec icônes dans des cercles pour une cohérence avec le reste de l'app.

## Voir les charges des clients (côté coach)

Aucun changement SQL — ça réutilise `exercise_logs` déjà en place.

Nouveau bouton 🏋️ sur chaque client actif : liste ses 15 dernières séances loggées, chacune dépliable pour voir le détail exercice par exercice — charge × reps pour chaque série, exactement ce que le client a réellement fait.

## Calendrier multi-clients, progression par exercice, rappel de pesée

Aucun changement SQL — tout réutilise les données déjà stockées (`exercise_logs`, `completed_sessions`, `weight_logs`).

**Calendrier multi-clients** (coach) : nouvel onglet "Calendrier" dans l'espace coach — une vue mensuelle où chaque jour affiche un badge avec le nombre de clients actifs ce jour-là. Cliquer sur un jour affiche la liste précise des clients qui se sont entraînés.

**Progression par exercice** (graphique réel) :
- **Côté client** : nouvelle section "Progression par exercice" dans le Profil — sélectionne un exercice déjà loggé, voit une vraie courbe de charge dans le temps, avec meilleure charge et 1RM estimé (formule d'Epley).
- **Côté coach** : dans le panneau 🏋️ de chaque client, un bascule "Par séance / Par exercice" — le mode "Par exercice" affiche exactement le même graphique que côté client, pour n'importe quel client.

**Rappel de pesée en fin de séance** : juste après le questionnaire de ressenti post-séance (ou si le client le passe), un écran rappelle de se peser, avec un champ de saisie rapide directement là (pas besoin de naviguer ailleurs) et un bouton "Plus tard" pour ne pas bloquer.

## Pièces jointes + accusés de lecture dans les messages, notes de version

⚠️ Relance `supabase/schema.sql` en entier (ajoute `attachment_url` sur `messages`, rend `content` optionnel, ajoute le bucket `message-attachments`).

**Pièces jointes** : bouton appareil photo à côté du champ de message — envoie une photo directement dans le chat, tapotable pour zoomer.

**Accusés de lecture** : corrigé un bug de logique — avant, ouvrir la conversation marquait TOUS les messages comme lus, y compris les siens. Maintenant chaque partie ne marque comme lus que les messages de l'AUTRE. Sous ton dernier message envoyé, tu vois "Envoyé" ou "Vu" selon que le client l'a ouvert ou non.

**Notes de version ("Quoi de neuf")** : à chaque nouvelle mise à jour publiée, les clients voient une fois un petit panneau listant les nouveautés, à leur prochaine ouverture de l'app. Stocké localement sur l'appareil (pas besoin de compte/serveur pour ça) — pense à mettre à jour la liste `PATCH_NOTES` en haut de `src/App.jsx` à chaque nouvelle fonctionnalité que tu déploies, sinon les clients ne verront jamais rien de nouveau.

## Bibliothèque de programmes professionnels, notes vocales

⚠️ Relance `supabase/schema.sql` en entier (ajoute `attachment_type` sur `messages`).

**3 nouveaux programmes basés sur de vraies méthodologies reconnues**, pas du contenu générique :
- **5/3/1 Force Athlétique** — d'après la méthode de Jim Wendler, référence en powerlifting. Un mouvement principal lourd par séance (squat/développé couché/soulevé de terre/développé militaire), 4 jours/semaine, 12 semaines avec logique de cycles léger/moyen/lourd/deload expliquée dans les conseils.
- **PHUL Hypertrophie** — Power Hypertrophy Upper Lower, méthode reconnue pour la prise de masse : 2 séances "force" (charge lourde, faible volume) + 2 séances "hypertrophie" (charge modérée, volume élevé), chaque groupe musculaire travaillé 2x/semaine.
- **Full Body Métabolique** — approche perte de poids moderne qui garde des mouvements composés lourds (pas juste du cardio) pour préserver la masse musculaire en déficit calorique, alterné avec du conditionnement HIIT.

Chaque programme a sa propre sélection d'exercices adaptée à l'objectif (pas les mêmes pools génériques que les programmes existants) — tu peux les voir dans la bibliothèque, catégorie "Force", "Hypertrophie" et "Perte de poids".

**Notes vocales** : bouton micro à côté du champ de message — appuie pour démarrer l'enregistrement, ré-appuie pour l'envoyer directement dans le chat, lecture avec un lecteur audio intégré.

## Menu latéral + tri/filtres clients côté coach

Aucun changement SQL.

**Navigation en menu latéral** : l'espace coach fonctionne maintenant comme côté client — une icône hamburger ouvre un menu qui glisse depuis le côté (Vue d'ensemble, Calendrier, À valider avec badge du nombre, Clients avec badge du nombre) au lieu des onglets horizontaux qui prenaient de la place à l'écran.

**Tri et filtres clients** : dans l'onglet Clients — une barre de recherche (nom/email), des filtres rapides (Tous / Actifs / Expirés / Révoqués), et un tri (Activité récente / Nom A-Z / Nombre de séances / Ancienneté).

## Fixes lisibilité, police cohérente, séance auto-validée, dossier client

Aucun changement SQL.

- **Fix noir sur noir** : le panneau "Installer l'app" (celui accessible une fois connecté) et "Quoi de neuf" étaient illisibles — même bug que la dernière fois, corrigé et redesigné avec de vraies icônes.
- **Police cohérente partout** : tous les menus déroulants (`<select>` natifs) affichaient le texte avec la police du téléphone au lieu de celle de l'app — limite native impossible à corriger en CSS classique. Remplacés par un composant maison (panneau qui glisse depuis le bas) partout dans l'app.
- **Séance auto-validée** : terminer le dernier exercice en mode focus valide directement la séance et enchaîne sur le ressenti — plus besoin de cliquer "Terminer la séance" en plus.
- **Dossier client complet** (coach) : nouveau bouton "Dossier" sur chaque client — infos personnelles (âge, genre, taille, poids, objectif, blessures), infos de compte (statut, inscription, expiration), et progression (programme, niveau, XP, série, séances, temps, calories), tout au même endroit.

## Espace coach — gestion des clients redesignée

Aucun changement SQL.

Le problème identifié : chaque fiche client dans la liste avait accumulé 6 boutons-icônes (Dossier, Messages, Photos, Ressenti, Charges, Sur-mesure) empilés dans une carte qui s'étirait — pas clair, pas engageant.

**Nouveau fonctionnement** : la liste des clients est maintenant épurée (avatar, nom, statut, dernière activité). Un tap ouvre une vraie fiche client dédiée en plein écran, avec une navigation par onglets propre : **Dossier** (infos complètes), **Programme** (assignation + constructeur sur-mesure), **Messages**, **Photos**, **Ressenti**, **Charges**. Même principe de navigation que le reste de l'app, plus rien d'entassé.

## Réorganiser les exercices, substitution "machine indisponible"

Aucun changement SQL.

**Réorganiser l'ordre** :
- **Coach** : dans le constructeur sur-mesure, des flèches haut/bas sur chaque exercice ajouté.
- **Client** : dans le détail d'une séance, avant de la démarrer (les flèches disparaissent une fois la séance commencée pour ne pas mélanger la progression déjà loggée).

**Machine indisponible ?** : en plein exercice (mode focus), un lien discret "Machine indisponible ? Remplacer cet exercice" — l'app pioche un exercice équivalent (même catégorie musculaire) dans la bibliothèque, et remet l'exercice original **plus tard dans la même séance** pour que le client puisse retenter une fois la machine libérée.

## Tableau de bord client épuré

Aucun changement SQL.

Le tableau de bord ne montre plus que l'essentiel : ta séance du jour à lancer en un tap, l'alerte d'expiration d'abonnement si besoin, et rien d'autre. Tout le reste (statistiques, badges, points de la semaine, graphique d'activité) a été déplacé — pas supprimé — vers **Profil** (stats + points de la semaine) et **Calendrier** (graphique d'activité hebdomadaire), là où ça a plus de sens contextuellement. "Défis du jour" a été retiré (les seuils étaient arbitraires, ça n'apportait pas grand-chose).

## Analyse IA d'un programme (coach)

⚠️ **Explication technique honnête, à lire avant d'utiliser cette fonctionnalité.**

Cette app n'a pas de serveur à elle (pas de backend dédié comme pour Stripe) — donc pour qu'un vrai modèle d'IA analyse un programme, il faut passer par **ta propre clé API Anthropic**, appelée directement depuis ton navigateur.

**Comment ça marche concrètement :**
1. Crée un compte sur [console.anthropic.com](https://console.anthropic.com) si tu n'en as pas.
2. Génère une clé API (section "API Keys"), et crédite ton compte de quelques dollars (l'usage est facturé à l'usage, très peu cher pour ce genre d'analyse ponctuelle).
3. Dans le constructeur de programme sur-mesure, section "Analyse IA" → colle ta clé une fois.
4. Ta clé est stockée **uniquement dans le navigateur de ton appareil** (jamais envoyée à N2Koaching, ni à Supabase, ni à moi) — si tu changes de téléphone/ordinateur ou vides le cache, il faudra la recoller.
5. Chaque clic sur "Analyser ce programme" envoie le détail du programme (exercices, séries, reps, repos) à Claude, qui répond avec une analyse structurée : points forts, points faibles/risques, recommandations concrètes, note sur 10 — basée sur des repères réels de science du sport (volume par groupe musculaire, équilibre push/pull/legs, récupération, etc.), pas des généralités.

**Limites à connaître :**
- **Coût** : chaque analyse consomme des crédits sur ton compte Anthropic (quelques centimes par analyse avec le modèle utilisé). Ce n'est pas gratuit, ce n'est pas inclus dans N2Koaching.
- **Pas de backend = pas de partage entre appareils.** Si tu utilises l'app coach depuis plusieurs appareils, il faudra reconfigurer la clé sur chacun.
- **Sécurité** : la clé transite directement de ton navigateur vers l'API Anthropic (chiffré en HTTPS), sans passer par aucun serveur intermédiaire — c'est le pattern documenté par Anthropic pour ce type d'usage personnel/prototype. Ne partage jamais cette clé, et régénère-la si tu penses qu'elle a fuité.
- Le modèle utilisé est `claude-sonnet-5` (modifiable dans `src/lib/aiAnalysis.js` si tu veux un modèle différent).

## Analyse de programme gratuite (sans clé API)

Aucun changement SQL.

Suite à la question "y'a pas d'autre moyen gratuit ?" — oui : un vrai moteur d'analyse **basé sur des règles de science du sport réelles**, calculé entièrement dans le navigateur, sans aucun appel réseau ni clé API. C'est maintenant le bouton par défaut ("Analyser ce programme") dans le constructeur sur-mesure.

Ce qu'il vérifie concrètement :
- **Volume hebdomadaire par groupe musculaire** (nombre de séries/semaine) — signale si un groupe majeur est en dessous de ~8 séries/semaine (repère bas pour progresser) ou au-dessus de ~26 (risque de non-récupération), en s'appuyant sur les repères courants de la littérature (10-20 séries/semaine/groupe pour l'hypertrophie).
- **Équilibre poussée/tirage** — un excès de volume poussée (pecs/épaules/triceps) par rapport au tirage (dos/biceps) est un facteur de risque documenté pour la posture et les douleurs d'épaule.
- **Récupération** — détecte les enchaînements de 5 jours ou plus sans repos, et l'absence totale de jour de repos dans le cycle.
- **Ordre des exercices** — vérifie que les mouvements polyarticulaires (squat, développé, tirage...) sont placés avant les exercices d'isolation.
- **Adéquation reps/objectif** — compare la plage de répétitions moyenne du programme à l'objectif annoncé (force → reps basses, hypertrophie → reps modérées).

Résultat : une note sur 10, des points forts, des points faibles avec l'explication du "pourquoi", et des recommandations concrètes — instantané, gratuit, pour toujours.

**L'analyse IA avec clé API personnelle reste disponible** en dessous, repliée par défaut, pour ceux qui veulent une analyse encore plus poussée et sont prêts à payer le coût (minime) de l'API.

## Analyse gratuite enrichie — 7 vérifications de plus

Aucun changement SQL. Toujours zéro coût, zéro appel réseau.

En plus des 5 vérifications précédentes, l'analyse détecte maintenant :
- **Jambes vs haut du corps** — le classique "jour de jambes sauté" (volume jambes nul ou très faible alors que le haut du corps est bien développé).
- **Fréquence par groupe musculaire** — signale les groupes travaillés une seule fois par semaine (répartir sur 2 séances est généralement plus efficace à volume égal).
- **Présence d'abdominaux/gainage** — souvent oublié.
- **Variété des mouvements** — repère un volume élevé concentré sur un seul exercice sans variation d'angle.
- **Doublons** — un même exercice ajouté deux fois dans la même séance (souvent une erreur de saisie).
- **Volume par séance** — alerte si une séance dépasse ~28 séries au total (fatigue accumulée, qualité d'exécution qui chute).
- **Travail unilatéral** — vérifie la présence d'exercices un bras/une jambe pour corriger les asymétries.

## Répartition visuelle par muscle

Aucun changement SQL. Toujours gratuit, toujours instantané.

L'analyse affiche maintenant une vraie répartition visuelle en haut du résultat : une barre par muscle (Pectoraux, Dos, Épaules, Biceps, Triceps, Quadriceps, Ischios & Fessiers, Mollets, Abdominaux) avec le nombre de séries/semaine et le poids relatif de chacun dans le volume total du programme. Les muscles à 0 série apparaissent clairement marqués "non travaillé", et sont désormais listés explicitement dans les points faibles si le programme est censé être complet.

## Détail anatomique fin (chefs musculaires)

Aucun changement SQL. Toujours gratuit, toujours instantané.

Suite à la demande "je veux du détail genre brachial" — l'analyse va maintenant plus loin que les catégories larges (Biceps, Dos, etc.) et détecte, exercice par exercice, quel **chef musculaire précis** est réellement sollicité, en s'appuyant sur la biomécanique réelle de chaque mouvement :

- **Biceps** → chef long (pic), chef court, brachial (épaisseur du bras)
- **Triceps** → chef long, latéral, médial
- **Dos** → grand dorsal (largeur), trapèzes/milieu du dos, érecteurs spinaux (bas du dos)
- **Épaules** → deltoïde antérieur, latéral, postérieur
- **Pectoraux** → faisceau supérieur (haut), faisceau sternal (milieu/bas)
- **Quadriceps** → vastes (global), droit fémoral (isolé)
- **Ischios & Fessiers** → ischio-jambiers, grand fessier
- **Mollets** → gastrocnémien, soléaire
- **Abdominaux** → grand droit, obliques, gainage profond

Pour chaque muscle avec du volume, une liste ✓/✗ montre précisément quels angles sont couverts — et génère une recommandation concrète pour ceux qui manquent (ex : "Biceps : aucun exercice ne cible le brachial — ajouter du curl marteau"), plutôt que de se contenter de dire "volume suffisant" sans vérifier que le développement est complet.

## Analyse croisée avec le client (blessures, niveau, fatigue cumulée)

Aucun changement SQL. Toujours gratuit, toujours instantané.

**Croisement avec les blessures signalées** : l'analyse utilise maintenant le champ "blessures/limitations" déjà rempli à l'inscription du client. Si le programme contient un exercice potentiellement à risque pour la zone déclarée (ex : squat profond pour un genou sensible, développé militaire pour une épaule signalée), une alerte explicite apparaît avec le nom exact de l'exercice concerné.

**Seuils adaptés au niveau** : les repères de volume (séries/semaine par groupe musculaire) ne sont plus fixes — ils s'ajustent selon que le client est débutant (seuils plus bas, cohérent avec un volume minimum efficace inférieur pour un système non entraîné), intermédiaire, ou avancé (tolère et bénéficie souvent d'un volume plus élevé). Les recommandations d'angles musculaires manquants (biceps/brachial etc.) ne sont affichées que pour intermédiaire/avancé — un débutant n'a pas besoin de cette granularité tout de suite.

**Fatigue cumulée** : détecte quand plusieurs mouvements lourds sollicitant la même chaîne (ex : squat + soulevé de terre) sont programmés le même jour, avec un risque de compromettre la technique sur le second mouvement par fatigue accumulée.

⚠️ **Sur les asymétries gauche/droite** — honnêteté : une vraie détection basée sur les charges réellement soulevées de chaque côté nécessiterait de logger séparément quel côté a été fait à chaque série (l'app ne le fait pas actuellement, `exercise_logs` ne distingue pas gauche/droite). Ce qui est fait aujourd'hui, c'est vérifier la *présence* de travail unilatéral dans le programme (pas la comparaison de charge réelle entre les deux côtés). Si tu veux la vraie version (à partir des données loggées), c'est faisable mais ça demande d'ajouter un champ "côté" au moment de logger une série — dis-moi si tu veux qu'on le fasse.

## Corrections en un clic ("Appliquer")

Aucun changement SQL. Toujours gratuit, toujours instantané.

L'analyse ne se contente plus de dire ce qui ne va pas — elle propose une **section "Suggestions d'optimisation"** avec un bouton "Appliquer" par problème détectable automatiquement :

- **Muscle non travaillé ou volume insuffisant** → propose un exercice concret de la bibliothèque (adapté au lieu du programme — salle/maison), ajouté directement au jour le plus pertinent (en priorité un jour qui travaille déjà une catégorie liée).
- **Angle musculaire manquant** (ex : brachial jamais ciblé) → propose l'exercice précis qui comble ce trou (ex : curl marteau).
- **Doublon détecté** → bouton pour supprimer directement l'exercice en trop.

Après avoir appliqué une ou plusieurs corrections, il suffit de relancer l'analyse pour voir la note et les points restants mis à jour — le programme se construit sous tes yeux, pas juste une liste de recommandations à appliquer soi-même à la main.

**Ce qui reste volontairement non auto-appliqué** (trop subjectif ou destructeur pour un clic automatique) : volume excessif (nécessiterait de retirer des séries), déséquilibre poussée/tirage, fatigue cumulée, absence de jour de repos — ces points restent informatifs, à ajuster toi-même selon le contexte du client.
