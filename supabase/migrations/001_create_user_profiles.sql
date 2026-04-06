create table user_profiles (
  id text primary key,  -- github_id
  username text not null,
  top_languages jsonb,
  starred_categories jsonb,
  contributed_repos jsonb,
  last_synced_at timestamptz
);

-- RLS 정책 설정 (본인 데이터만 읽기/쓰기)
alter table user_profiles enable row level security;

create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid()::text = id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid()::text = id);

create policy "Users can insert own profile"
  on user_profiles for insert
  with check (auth.uid()::text = id);
