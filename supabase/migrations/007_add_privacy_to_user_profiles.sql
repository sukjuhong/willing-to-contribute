-- Add privacy opt-in fields to user_profiles
alter table user_profiles
  add column if not exists is_public boolean not null default false,
  add column if not exists public_fields jsonb;

-- Drop existing "view own profile" policy and replace with opt-in public visibility
drop policy if exists "Users can view own profile" on user_profiles;

create policy "Users can view own or public profile"
  on user_profiles for select
  using (auth.uid()::text = id or is_public = true);
