create table user_settings (
  user_id text primary key references user_profiles(id),
  repositories jsonb default '[]',
  custom_labels jsonb default '[]',
  notification_frequency text default 'daily',
  hide_closed_issues boolean default false,
  updated_at timestamptz default now()
);

-- RLS 정책 설정 (본인 데이터만 읽기/쓰기)
alter table user_settings enable row level security;

create policy "Users can view own settings"
  on user_settings for select
  using (auth.uid()::text = user_id);

create policy "Users can update own settings"
  on user_settings for update
  using (auth.uid()::text = user_id);

create policy "Users can insert own settings"
  on user_settings for insert
  with check (auth.uid()::text = user_id);
