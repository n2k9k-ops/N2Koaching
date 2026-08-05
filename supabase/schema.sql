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
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_admin boolean not null default false,
  assigned_program_id text,
  custom_program jsonb,
  last_session_at timestamptz,
  created_at timestamptz not null default now()
);

-- Si vous aviez déjà créé la table avant cette mise à jour, exécutez cette ligne
-- seule pour ajouter la colonne manquante :
alter table public.profiles add column if not exists last_session_at timestamptz;

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
  content text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

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
