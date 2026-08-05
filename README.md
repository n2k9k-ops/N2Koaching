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
