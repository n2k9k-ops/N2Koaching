-- ============================================================
-- N2Koaching — schéma Supabase
-- À exécuter dans Supabase : Dashboard > SQL Editor > New query
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null default 'Athlète',
  weight numeric default 75,
  height numeric default 175,
  goal text default 'Perte de poids',
  sport_level text default 'Débutant',
  xp integer not null default 0,
  streak integer not null default 0,
  sessions_completed integer not null default 0,
  total_minutes integer not null default 0,
  calories integer not null default 0,
  completed_sessions jsonb not null default '{}'::jsonb,
  water integer not null default 2,
  dark boolean not null default true,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'revoked')),
  revoke_reason text,
  is_admin boolean not null default false,
  assigned_program_id text,
  custom_program jsonb,
  last_session_at timestamptz,
  program_start_at timestamptz default now(),
  onboarded boolean not null default false,
  age integer,
  training_frequency integer,
  gender text,
  injuries text,
  avatar_url text,
  stripe_customer_id text,
  subscription_id text,
  subscription_status text not null default 'inactive',
  streak_freeze_used_at timestamptz,
  access_expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Si vous aviez déjà créé la table avant cette mise à jour, exécutez ces lignes
-- seules pour ajouter les colonnes manquantes :
alter table public.profiles add column if not exists last_session_at timestamptz;
alter table public.profiles add column if not exists program_start_at timestamptz default now();
alter table public.profiles add column if not exists onboarded boolean not null default false;
alter table public.profiles add column if not exists streak_freeze_used_at timestamptz;
alter table public.profiles add column if not exists access_expires_at timestamptz;
alter table public.profiles add column if not exists revoke_reason text;
alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles add constraint profiles_status_check check (status in ('pending', 'approved', 'rejected', 'revoked'));
alter table public.profiles add column if not exists age integer;
alter table public.profiles add column if not exists training_frequency integer;
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists injuries text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists subscription_id text;
alter table public.profiles add column if not exists subscription_status text not null default 'inactive';
-- Ne redemande pas l'onboarding aux comptes déjà existants avant cette mise à jour :
update public.profiles set onboarded = true where created_at < now();

alter table public.profiles enable row level security;

-- Un utilisateur peut voir / modifier sa propre ligne
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Fonction security definer : évite la récursion RLS pour vérifier si l'appelant est admin
create or replace function public.is_admin(uid uuid)
returns boolean
language sql security definer stable
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

-- Un coach (is_admin = true) peut voir / modifier tous les profils
drop policy if exists "profiles_admin_select_all" on public.profiles;
create policy "profiles_admin_select_all" on public.profiles
  for select using (public.is_admin(auth.uid()));

drop policy if exists "profiles_admin_update_all" on public.profiles;
create policy "profiles_admin_update_all" on public.profiles
  for update using (public.is_admin(auth.uid()));

-- IMPORTANT : empêche un client de s'auto-valider ou de s'auto-assigner un
-- programme en appelant l'API directement (même en contournant l'interface).
-- Seul un compte is_admin = true peut modifier status / is_admin /
-- assigned_program_id / custom_program.
create or replace function public.protect_admin_fields()
returns trigger
language plpgsql security definer
as $$
begin
  -- Ne bloque que les appels effectués par l'app cliente (utilisateur authentifié).
  -- Les requêtes lancées depuis le SQL Editor (auth.uid() = null) restent autorisées,
  -- c'est ce qui permet de promouvoir un compte en coach à la main.
  if auth.uid() is not null and not public.is_admin(auth.uid()) then
    new.status := old.status;
    new.is_admin := old.is_admin;
    new.assigned_program_id := old.assigned_program_id;
    new.custom_program := old.custom_program;
    new.program_start_at := old.program_start_at;
    new.stripe_customer_id := old.stripe_customer_id;
    new.subscription_id := old.subscription_id;
    new.subscription_status := old.subscription_status;
    new.revoke_reason := old.revoke_reason;
    new.access_expires_at := old.access_expires_at;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_admin_fields_trigger on public.profiles;
create trigger protect_admin_fields_trigger
  before update on public.profiles
  for each row execute procedure public.protect_admin_fields();

-- Crée automatiquement une ligne `profiles` (statut "pending") à chaque inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', 'Athlète'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- PROGRAMMES RÉUTILISABLES (modèles créés par le coach)
-- ============================================================
create table if not exists public.program_templates (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references auth.users on delete set null,
  name text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.program_templates enable row level security;

drop policy if exists "templates_admin_all" on public.program_templates;
create policy "templates_admin_all" on public.program_templates
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ============================================================
-- MESSAGERIE COACH ↔ CLIENT
-- Un "fil" par client (client_id), lisible par ce client et par tout coach.
-- ============================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_is_admin boolean not null default false,
  content text,
  attachment_url text,
  attachment_type text,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

alter table public.messages alter column content drop not null;
alter table public.messages add column if not exists attachment_url text;
alter table public.messages add column if not exists attachment_type text;

alter table public.messages enable row level security;

drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages
  for select using (client_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and (client_id = auth.uid() or public.is_admin(auth.uid()))
  );

drop policy if exists "messages_update" on public.messages;
create policy "messages_update" on public.messages
  for update using (client_id = auth.uid() or public.is_admin(auth.uid()));

insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', true)
on conflict (id) do nothing;

drop policy if exists "message_attachments_read" on storage.objects;
create policy "message_attachments_read" on storage.objects
  for select using (bucket_id = 'message-attachments');

drop policy if exists "message_attachments_write" on storage.objects;
create policy "message_attachments_write" on storage.objects
  for insert with check (
    bucket_id = 'message-attachments'
    and (public.is_admin(auth.uid()) or (storage.foldername(name))[1] = auth.uid()::text)
  );

-- ============================================================
-- HISTORIQUE DE POIDS (pour le graphique de progression réel)
-- ============================================================
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  weight numeric not null,
  logged_at timestamptz not null default now()
);

alter table public.weight_logs enable row level security;

drop policy if exists "weight_logs_select" on public.weight_logs;
create policy "weight_logs_select" on public.weight_logs
  for select using (profile_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "weight_logs_insert" on public.weight_logs;
create policy "weight_logs_insert" on public.weight_logs
  for insert with check (profile_id = auth.uid());

-- ============================================================
-- PHOTOS DE RÉFÉRENCE PAR EXERCICE (stockage Supabase Storage)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('exercise-photos', 'exercise-photos', true)
on conflict (id) do nothing;

drop policy if exists "exercise_photos_public_read" on storage.objects;
create policy "exercise_photos_public_read" on storage.objects
  for select using (bucket_id = 'exercise-photos');

drop policy if exists "exercise_photos_admin_write" on storage.objects;
create policy "exercise_photos_admin_write" on storage.objects
  for insert with check (bucket_id = 'exercise-photos' and public.is_admin(auth.uid()));

drop policy if exists "exercise_photos_admin_delete" on storage.objects;
create policy "exercise_photos_admin_delete" on storage.objects
  for delete using (bucket_id = 'exercise-photos' and public.is_admin(auth.uid()));

-- ============================================================
-- PHOTOS DE PROFIL (avatar par utilisateur)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_own_write" on storage.objects;
create policy "avatars_own_write" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_own_update" on storage.objects;
create policy "avatars_own_update" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_own_delete" on storage.objects;
create policy "avatars_own_delete" on storage.objects
  for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- HISTORIQUE DES SÉRIES LOGGÉES (perf "dernière fois" + revue de séance)
-- ============================================================
create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  session_key text not null,
  exercise_name text not null,
  set_index integer not null,
  weight numeric,
  reps text,
  logged_at timestamptz not null default now()
);

alter table public.exercise_logs enable row level security;

drop policy if exists "exercise_logs_select" on public.exercise_logs;
create policy "exercise_logs_select" on public.exercise_logs
  for select using (profile_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "exercise_logs_insert" on public.exercise_logs;
create policy "exercise_logs_insert" on public.exercise_logs
  for insert with check (profile_id = auth.uid());

drop policy if exists "exercise_logs_update" on public.exercise_logs;
create policy "exercise_logs_update" on public.exercise_logs
  for update using (profile_id = auth.uid());

create index if not exists exercise_logs_name_idx on public.exercise_logs (profile_id, exercise_name, logged_at desc);
create index if not exists exercise_logs_session_idx on public.exercise_logs (profile_id, session_key);

alter table public.exercise_logs drop constraint if exists exercise_logs_unique;
alter table public.exercise_logs add constraint exercise_logs_unique
  unique (profile_id, session_key, exercise_name, set_index);

-- ============================================================
-- EXERCICES PERSONNALISÉS DU COACH (rejoignent la bibliothèque partagée)
-- ============================================================
create table if not exists public.custom_exercises (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references auth.users on delete set null,
  name text not null,
  cat text not null,
  location text not null default 'gym',
  sets integer not null default 3,
  reps text not null default '12 reps',
  rest integer not null default 60,
  diff text not null default 'Modéré',
  tips text,
  safety text,
  equip text,
  video_url text,
  photo_url text,
  created_at timestamptz not null default now()
);

alter table public.custom_exercises enable row level security;

drop policy if exists "custom_exercises_admin_all" on public.custom_exercises;
create policy "custom_exercises_admin_all" on public.custom_exercises
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ============================================================
-- PHOTOS DE PROGRESSION (envoi client, réponse du coach)
-- ============================================================
create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  photo_url text not null,
  note text,
  coach_reply text,
  coach_reply_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.progress_photos enable row level security;

drop policy if exists "progress_photos_select" on public.progress_photos;
create policy "progress_photos_select" on public.progress_photos
  for select using (profile_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "progress_photos_insert" on public.progress_photos;
create policy "progress_photos_insert" on public.progress_photos
  for insert with check (profile_id = auth.uid());

-- Seul le coach peut modifier une ligne (pour y ajouter sa réponse)
drop policy if exists "progress_photos_admin_update" on public.progress_photos;
create policy "progress_photos_admin_update" on public.progress_photos
  for update using (public.is_admin(auth.uid()));

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', true)
on conflict (id) do nothing;

drop policy if exists "progress_photos_bucket_read" on storage.objects;
create policy "progress_photos_bucket_read" on storage.objects
  for select using (bucket_id = 'progress-photos');

drop policy if exists "progress_photos_bucket_write" on storage.objects;
create policy "progress_photos_bucket_write" on storage.objects
  for insert with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- RESSENTI POST-SÉANCE (RPE + énergie + courbatures + commentaire)
-- ============================================================
create table if not exists public.session_feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  session_key text not null,
  rpe integer not null check (rpe between 1 and 10),
  energy integer not null check (energy between 1 and 10),
  soreness text,
  comment text,
  created_at timestamptz not null default now()
);

alter table public.session_feedback enable row level security;

drop policy if exists "session_feedback_select" on public.session_feedback;
create policy "session_feedback_select" on public.session_feedback
  for select using (profile_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "session_feedback_insert" on public.session_feedback;
create policy "session_feedback_insert" on public.session_feedback
  for insert with check (profile_id = auth.uid());

-- ============================================================
-- ÉTAPE MANUELLE : créer votre premier compte coach
-- 1. Inscrivez-vous normalement depuis l'app avec l'email du coach.
-- 2. Puis exécutez (en remplaçant l'email) :
--
--    update public.profiles
--    set is_admin = true, status = 'approved'
--    where email = 'coach@votre-domaine.com';
--
-- Ce compte se connectera désormais directement sur l'espace coach.
-- ============================================================
