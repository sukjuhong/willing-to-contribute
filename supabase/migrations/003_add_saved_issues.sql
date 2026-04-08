-- Add picked_issues column (backward-compatible, keeps repositories for now)
alter table user_settings
  add column if not exists picked_issues jsonb default '[]';
