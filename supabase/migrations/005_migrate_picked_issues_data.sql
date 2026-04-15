-- Migrate existing picked_issues JSON blob from user_settings into the new table
insert into picked_issues (
  user_id,
  issue_id,
  issue_number,
  issue_url,
  repository_owner,
  repository_name,
  title,
  state,
  labels,
  assignee,
  user_tags,
  picked_at,
  last_known_state,
  last_checked_at
)
select
  us.user_id,
  pi->>'id',
  (pi->>'number')::int,
  pi->>'url',
  pi->'repository'->>'owner',
  pi->'repository'->>'name',
  pi->>'title',
  coalesce(pi->>'state', 'open'),
  coalesce(pi->'labels', '[]'::jsonb),
  pi->>'assignee',
  coalesce(pi->'userTags', '[]'::jsonb),
  coalesce((pi->>'savedAt')::timestamptz, now()),
  coalesce(pi->>'lastKnownState', 'open'),
  coalesce((pi->>'lastCheckedAt')::timestamptz, now())
from user_settings us,
  jsonb_array_elements(us.picked_issues) as pi
where jsonb_array_length(us.picked_issues) > 0
on conflict (user_id, (pi->>'id')) do nothing;
