-- ============================================================
-- VaultNotes - Supabase Schema
-- Paste this entire file into the Supabase SQL Editor and run.
-- ============================================================

-- 1. Profiles table (extends auth.users, stores app-specific user data)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamptz default now() not null,
  email text unique not null,
  username text unique not null,
  sort text default '' not null,
  dark_mode boolean default false not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Allow the trigger function (security definer) to insert profiles
create policy "Allow profile creation via trigger" on public.profiles
  for insert with check (true);

-- 2. Folders table
create table public.folders (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date_created timestamptz default now() not null,
  date_updated timestamptz default now() not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  unique(title, user_id)
);

alter table public.folders enable row level security;

create policy "Users can manage own folders" on public.folders
  for all using (auth.uid() = user_id);

-- 3. Notes table
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  color text not null default '',
  category text not null default '',
  tag text not null default 'none',
  date_created timestamptz default now() not null,
  date_updated timestamptz default now() not null,
  date_deleted timestamptz,
  is_trash boolean default false not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  folder_id uuid references public.folders(id) on delete set null
);

alter table public.notes enable row level security;

create policy "Users can manage own notes" on public.notes
  for all using (auth.uid() = user_id);

-- 4. Auto-update date_updated on any row update
create or replace function public.update_date_updated()
returns trigger as $$
begin
  new.date_updated = now();
  return new;
end;
$$ language plpgsql;

create trigger notes_update_date_updated
  before update on public.notes
  for each row execute function public.update_date_updated();

create trigger folders_update_date_updated
  before update on public.folders
  for each row execute function public.update_date_updated();

-- 5. Auto-create profile record when a new Supabase Auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. Helper function: look up a user's email by username (used for username login)
--    Runs as security definer so it bypasses RLS for this specific lookup.
create or replace function public.get_email_by_username(input_username text)
returns text as $$
  select email from public.profiles where lower(username) = lower(input_username) limit 1;
$$ language sql security definer;
