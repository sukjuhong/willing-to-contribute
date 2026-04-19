-- Public activity feed for /feed route (#66)
-- Exposes user_activity_events of users who opted in via user_profiles.is_public,
-- limited to the last 24 hours and rate-limited to 5 events per user per hour
-- (anti-spam) via row_number() window function.
--
-- The view runs with the privileges of the view owner (Supabase `postgres`),
-- so it bypasses the per-row RLS on user_activity_events. The is_public join
-- is therefore the *only* gate — make sure that condition stays correct.

create or replace view public_activity_feed as
with ranked as (
  select
    e.id,
    e.user_id,
    e.event_type,
    e.payload,
    e.created_at,
    p.username,
    row_number() over (
      partition by e.user_id, date_trunc('hour', e.created_at)
      order by e.created_at desc
    ) as rn_in_hour
  from user_activity_events e
  inner join user_profiles p
    on p.id = e.user_id
  where p.is_public = true
    and e.created_at >= now() - interval '24 hours'
    and e.event_type in ('issue_picked', 'contribution_completed', 'badge_earned')
)
select
  id,
  user_id,
  event_type,
  payload,
  created_at,
  username
from ranked
where rn_in_hour <= 5
order by created_at desc;

-- Allow both authenticated and anonymous (logged-out) visitors to read the feed.
-- The view itself filters on is_public, so private users are never exposed.
grant select on public_activity_feed to anon, authenticated;
