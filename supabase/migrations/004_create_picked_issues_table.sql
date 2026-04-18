-- Create picked_issues table (normalized from user_settings JSON blob)
create table picked_issues (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references user_profiles(id) on delete cascade,
  issue_id text not null,            -- GitHub issue node ID
  issue_number int not null,
  issue_url text not null,
  repository_owner text not null,
  repository_name text not null,
  title text not null,
  state text not null default 'open',
  labels jsonb default '[]',
  assignee text,
  user_tags jsonb default '[]',
  picked_at timestamptz default now(),
  last_known_state text not null default 'open',
  last_checked_at timestamptz default now()
);

-- Indexes
create index idx_picked_issues_user_id on picked_issues(user_id);
create index idx_picked_issues_issue_url on picked_issues(issue_url);
create index idx_picked_issues_repo on picked_issues(repository_owner, repository_name);

-- Unique constraint: a user can only pick the same issue once
create unique index idx_picked_issues_user_issue on picked_issues(user_id, issue_id);

-- RLS
alter table picked_issues enable row level security;

-- Users can read their own picked issues
create policy "Users can view own picked issues"
  on picked_issues for select
  using (auth.uid()::text = user_id);

-- Users can insert their own picked issues
create policy "Users can insert own picked issues"
  on picked_issues for insert
  with check (auth.uid()::text = user_id);

-- Users can update their own picked issues
create policy "Users can update own picked issues"
  on picked_issues for update
  using (auth.uid()::text = user_id);

-- Users can delete their own picked issues
create policy "Users can delete own picked issues"
  on picked_issues for delete
  using (auth.uid()::text = user_id);

-- Aggregate view: pick counts per issue_url (cross-user, public)
create view picked_issues_counts as
  select
    issue_url,
    repository_owner,
    repository_name,
    max(title) as title,
    count(*) as pick_count
  from picked_issues
  group by issue_url, repository_owner, repository_name;

-- Allow all authenticated users to read aggregate counts
grant select on picked_issues_counts to authenticated;
