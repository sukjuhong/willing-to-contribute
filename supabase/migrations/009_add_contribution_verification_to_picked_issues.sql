-- Add contribution verification columns to picked_issues
-- Powers "기여 완료" auto-detection via GitHub timeline API (#56)
alter table picked_issues
  add column if not exists contribution_verified_at timestamptz,
  add column if not exists closing_pr_url text,
  add column if not exists closing_pr_author text;

-- Partial index: speeds up "pending verification" scans
-- (rows that have been closed but not yet matched to a PR)
create index if not exists idx_picked_issues_pending_verification
  on picked_issues(user_id)
  where contribution_verified_at is null and last_known_state = 'closed';
