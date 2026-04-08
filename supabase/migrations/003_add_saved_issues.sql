-- Add saved_issues column (backward-compatible, keeps repositories for now)
alter table user_settings
  add column if not exists saved_issues jsonb default '[]';
