-- ============================================================================
-- POST2HIRE — Supabase schema
-- Run this in Supabase Dashboard > SQL Editor after creating your project.
-- Safe to run once. See DEPLOYMENT.md for the full setup sequence.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, holds role and account status
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_disabled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- generated_items: Recent Files — LinkedIn posts, CVs, cover letters
-- ---------------------------------------------------------------------------
create table if not exists public.generated_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('linkedin_post', 'cv', 'cover_letter')),
  title text not null default '',
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists generated_items_user_id_idx on public.generated_items(user_id);

alter table public.generated_items enable row level security;

create policy "Users can view their own generated items"
  on public.generated_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own generated items"
  on public.generated_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own generated items"
  on public.generated_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own generated items"
  on public.generated_items for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- usage_log: one row per generation call, powers the daily quota check
-- ---------------------------------------------------------------------------
create table if not exists public.usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists usage_log_user_id_created_idx on public.usage_log(user_id, created_at);

alter table public.usage_log enable row level security;
-- No public policies — this table is only ever read/written by the
-- service-role client (lib/supabase/quota.ts), after the caller's identity
-- has already been verified server-side.

-- ---------------------------------------------------------------------------
-- contact_messages: copy of contact-form submissions for the admin panel
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
-- Admin-only access, enforced via the admin API routes using the
-- service-role client + requireAdmin() check — no public policies needed.

-- ---------------------------------------------------------------------------
-- failed_generations: log of generation failures for admin visibility
-- ---------------------------------------------------------------------------
create table if not exists public.failed_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  tool text not null,
  error_message text not null,
  created_at timestamptz not null default now()
);

alter table public.failed_generations enable row level security;

-- ---------------------------------------------------------------------------
-- site_settings: single-row config table driving admin-editable behavior
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id int primary key default 1,
  daily_generation_limit int not null default 20,
  ads_enabled boolean not null default false,
  ad_snippet_header text not null default '',
  ad_snippet_mid text not null default '',
  ad_snippet_footer text not null default '',
  ad_snippet_native text not null default '',
  file_retention_days int not null default 90,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1)
  on conflict (id) do nothing;

alter table public.site_settings enable row level security;

create policy "Anyone can read public site settings"
  on public.site_settings for select
  using (true);
-- Writes only via the service-role client from admin API routes
-- (protected by requireAdmin()) — no public write policy.

-- ---------------------------------------------------------------------------
-- audit_log: records admin actions for accountability
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded CVs / generated files (private by default)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('user-documents', 'user-documents', false)
on conflict (id) do nothing;

create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read their own documents"
  on storage.objects for select
  using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own documents"
  on storage.objects for delete
  using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- ADMIN BOOTSTRAP — run this ONE line yourself, after you've signed up your
-- own account on the live site, to promote yourself to admin. Replace the
-- email with the one you registered with:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- ============================================================================

-- ============================================================================
-- OPTIONAL: automatic cleanup of old generated_items past the retention
-- window set in site_settings.file_retention_days. Requires the pg_cron
-- extension (available on Supabase's paid plans; on the free tier, run this
-- query manually/periodically instead, or trigger it from a Vercel Cron Job
-- calling a dedicated admin API route).
--
--   select cron.schedule(
--     'cleanup-old-generated-items',
--     '0 3 * * *',
--     $$
--       delete from public.generated_items
--       where created_at < now() - (
--         (select file_retention_days from public.site_settings where id = 1)
--         || ' days'
--       )::interval;
--     $$
--   );
-- ============================================================================
