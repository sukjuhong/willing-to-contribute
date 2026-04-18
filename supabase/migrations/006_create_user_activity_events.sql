-- Append-only user activity events table
-- Powers retention/social features (Pick counts, streaks, badges, feed)
create table user_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references user_profiles(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes for common access patterns
create index idx_user_activity_events_user_created
  on user_activity_events(user_id, created_at desc);
create index idx_user_activity_events_type_created
  on user_activity_events(event_type, created_at desc);

-- RLS
alter table user_activity_events enable row level security;

create policy "Users can view own activity events"
  on user_activity_events for select
  using (auth.uid()::text = user_id);

create policy "Users can insert own activity events"
  on user_activity_events for insert
  with check (auth.uid()::text = user_id);

-- Events are append-only; no update/delete policies.
-- Retention (90d) handled by scheduled job; see comments below.

-- Optional: pg_cron retention job (enable pg_cron extension in Supabase dashboard first)
-- select cron.schedule(
--   'purge_old_activity_events',
--   '0 3 * * *',
--   $$delete from user_activity_events where created_at < now() - interval '90 days'$$
-- );
