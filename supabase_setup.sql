-- ==========================================
-- MAIPIX SUPABASE MIGRATION (FULL SETUP)
-- ==========================================

-- 1. Create Targets Table (For AR Experiences)
create table if not exists public.targets (
  id bigint primary key generated always as identity,
  name text not null,
  target_url text not null,
  content_url text not null,
  content_type text not null, -- 'video', 'audio', '3d'
  created_at timestamptz default now()
);

-- 2. Create Profiles Table (For User Management)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'user', -- 'admin' or 'user'
  created_at timestamptz default now()
);

-- 3. Enable RLS (Security)
alter table public.targets enable row level security;
alter table public.profiles enable row level security;

-- 4. Policies for TARGETS
-- Public Read
drop policy if exists "Public targets are viewable by everyone" on public.targets;
create policy "Public targets are viewable by everyone" on public.targets for select using (true);

-- Authenticated Create/Update/Delete (Admins & Users for now, or refine to Admins only)
drop policy if exists "Authenticated users can insert targets" on public.targets;
create policy "Authenticated users can insert targets" on public.targets for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update targets" on public.targets;
create policy "Authenticated users can update targets" on public.targets for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete targets" on public.targets;
create policy "Authenticated users can delete targets" on public.targets for delete using (auth.role() = 'authenticated');


-- 5. Policies for PROFILES
-- Public Read
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);

-- Admin Update (Only verify admins can promote others)
drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles" on public.profiles for update using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);


-- 6. Storage Bucket Setup (Virtual SQL - execute bucket creation in UI if this fails)
insert into storage.buckets (id, name, public) 
values ('assets', 'assets', true)
on conflict (id) do nothing;

-- Storage Policies
drop policy if exists "Public Access Assets" on storage.objects;
create policy "Public Access Assets" on storage.objects for select using (bucket_id = 'assets');

drop policy if exists "Auth Upload Assets" on storage.objects;
create policy "Auth Upload Assets" on storage.objects for insert with check (bucket_id = 'assets' and auth.role() = 'authenticated');
  
drop policy if exists "Auth Delete Assets" on storage.objects;
create policy "Auth Delete Assets" on storage.objects for delete using (bucket_id = 'assets' and auth.role() = 'authenticated');


-- 7. Trigger for Automatic Profile Creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- END OF MIGRATION
-- Copy and paste this into Supabase SQL Editor
-- ==========================================
