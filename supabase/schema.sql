-- LUMORA BOT UPDATE SYSTEM
-- Run this in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.bot_releases (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  release_date date not null,
  release_notes jsonb not null default '[]'::jsonb,
  file_path text not null,
  original_filename text not null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.bot_releases enable row level security;

create or replace function public.is_lumora_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()); $$;

drop policy if exists "admins read own admin row" on public.admin_users;
create policy "admins read own admin row" on public.admin_users for select to authenticated using (user_id=auth.uid());

drop policy if exists "admins manage releases" on public.bot_releases;
create policy "admins manage releases" on public.bot_releases for all to authenticated using (public.is_lumora_admin()) with check (public.is_lumora_admin());

-- Public website only needs to read published release metadata.
drop policy if exists "public read published releases" on public.bot_releases;
create policy "public read published releases" on public.bot_releases for select to anon, authenticated using (published=true);

insert into storage.buckets (id,name,public)
values ('bot-releases','bot-releases',false)
on conflict (id) do nothing;

drop policy if exists "admin upload bot releases" on storage.objects;
create policy "admin upload bot releases" on storage.objects for insert to authenticated
with check (bucket_id='bot-releases' and public.is_lumora_admin());

drop policy if exists "admin read bot releases" on storage.objects;
create policy "admin read bot releases" on storage.objects for select to authenticated
using (bucket_id='bot-releases' and public.is_lumora_admin());

drop policy if exists "admin delete bot releases" on storage.objects;
create policy "admin delete bot releases" on storage.objects for delete to authenticated
using (bucket_id='bot-releases' and public.is_lumora_admin());

-- After creating the admin user in Supabase Authentication,
-- replace USER_UUID_HERE with that user's UUID:
-- insert into public.admin_users(user_id) values ('USER_UUID_HERE');
