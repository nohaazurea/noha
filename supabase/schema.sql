-- ============================================================
--  AZUREA — Schéma Supabase
--  À exécuter dans Supabase > SQL Editor (une seule fois).
--  Tables : settings (singleton) · sections (contenu par section)
--           projects (gestionnaire de réalisations) · media (registre)
--  Sécurité : lecture publique (site) / écriture authentifiée (admin)
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- Fonction updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ============================================================
--  SETTINGS (paramètres globaux — une seule ligne, id = 1)
-- ============================================================
create table if not exists public.settings (
  id           int primary key default 1,
  logo_url     text,
  favicon_url  text,
  site_title   text,
  site_description text,
  og_image     text,
  analytics_id text,
  email        text,
  phone        text,
  address      text,
  instagram    text,
  tiktok       text,
  linkedin     text,
  devis_url    text,
  footer       jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);
drop trigger if exists trg_settings_updated on public.settings;
create trigger trg_settings_updated before update on public.settings
  for each row execute function public.set_updated_at();

-- ============================================================
--  SECTIONS (contenu éditable par section — clé => JSON)
--  ex : home_hero, home_intro, home_univers, marquee,
--       expertises_preview, distance, fullbleed, feed, cta_home,
--       expertises, method, agence, contact, footer …
-- ============================================================
create table if not exists public.sections (
  key        text primary key,
  label      text,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_sections_updated on public.sections;
create trigger trg_sections_updated before update on public.sections
  for each row execute function public.set_updated_at();

-- ============================================================
--  PROJECTS (gestionnaire de réalisations — CRUD + drag&drop)
-- ============================================================
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  position    int  not null default 0,          -- ordre (drag & drop)
  published   boolean not null default true,
  name        text not null,
  slug        text,
  category    text,                              -- branding | social | web
  location    text,
  description text,
  cover_url   text,                              -- image principale
  gallery     jsonb not null default '[]'::jsonb, -- ["url", ...]
  video_url   text,
  prestations jsonb not null default '[]'::jsonb, -- ["Branding", ...]
  case_study  jsonb not null default '{}'::jsonb, -- {context, response, results:[], quote, author}
  seo         jsonb not null default '{}'::jsonb, -- {title, description}
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();
create index if not exists projects_position_idx on public.projects(position);

-- ============================================================
--  MEDIA (registre optionnel — le Storage reste la source)
-- ============================================================
create table if not exists public.media (
  id         uuid primary key default gen_random_uuid(),
  path       text,
  url        text,
  name       text,
  size       int,
  type       text,
  created_at timestamptz not null default now()
);

-- ============================================================
--  ROW LEVEL SECURITY
--  Lecture : tout le monde (site public)
--  Écriture : utilisateurs authentifiés (back-office /admin)
-- ============================================================
alter table public.settings enable row level security;
alter table public.sections enable row level security;
alter table public.projects enable row level security;
alter table public.media    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['settings','sections','projects','media'] loop
    execute format('drop policy if exists "public read %1$s" on public.%1$s;', t);
    execute format('drop policy if exists "auth write %1$s" on public.%1$s;', t);
    -- lecture publique
    execute format($f$create policy "public read %1$s" on public.%1$s for select using (true);$f$, t);
    -- écriture réservée aux utilisateurs connectés
    execute format($f$create policy "auth write %1$s" on public.%1$s for all
                     to authenticated using (true) with check (true);$f$, t);
  end loop;
end $$;

-- ============================================================
--  STORAGE (bucket "media" — images/vidéos)
--  Lecture publique · écriture authentifiée
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do update set public = true;

drop policy if exists "media public read"  on storage.objects;
drop policy if exists "media auth insert"   on storage.objects;
drop policy if exists "media auth update"   on storage.objects;
drop policy if exists "media auth delete"   on storage.objects;

create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');
create policy "media auth insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "media auth update" on storage.objects
  for update to authenticated using (bucket_id = 'media');
create policy "media auth delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');

-- ============================================================
--  Fin du schéma. Lance ensuite seed.sql pour le contenu initial.
-- ============================================================
