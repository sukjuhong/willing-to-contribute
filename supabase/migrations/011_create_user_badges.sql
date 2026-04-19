-- Contributor badge system (#61)
-- Stores granted badges per user and emits `badge_earned` activity events.
-- Trigger evaluates eligibility AFTER INSERT on user_activity_events so the
-- badge is granted in the same transaction as the qualifying action.

create table if not exists user_badges (
  user_id text not null references user_profiles(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  primary key (user_id, badge_id)
);

create index if not exists idx_user_badges_user
  on user_badges(user_id, earned_at desc);

-- RLS: users see their own badges + badges of opted-in public profiles
alter table user_badges enable row level security;

create policy "Users can view own or public badges"
  on user_badges for select
  using (
    auth.uid()::text = user_id
    or exists (
      select 1 from user_profiles up
      where up.id = user_badges.user_id and up.is_public = true
    )
  );

-- Inserts come from the trigger (security definer); no client-side insert/update/delete.

-- ----------------------------------------------------------------------------
-- Evaluation function
--
-- For each defined badge, check the user's activity history. If the user
-- qualifies and doesn't yet have the badge, insert into user_badges and emit
-- a `badge_earned` activity event. ON CONFLICT DO NOTHING keeps re-evaluation
-- idempotent.
-- ----------------------------------------------------------------------------
create or replace function evaluate_user_badges(p_user_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted boolean;
  v_distinct_languages int;
  v_distinct_repos int;
begin
  -- 1. first_pick — first issue_picked event
  if exists (
    select 1 from user_activity_events
    where user_id = p_user_id and event_type = 'issue_picked'
    limit 1
  ) then
    insert into user_badges (user_id, badge_id)
      values (p_user_id, 'first_pick')
      on conflict do nothing
      returning true into v_inserted;
    if v_inserted then
      insert into user_activity_events (user_id, event_type, payload)
        values (p_user_id, 'badge_earned', jsonb_build_object(
          'badge_id', 'first_pick',
          'name_key', 'badge.first_pick.name'
        ));
    end if;
    v_inserted := null;
  end if;

  -- 2. first_merge — first contribution_completed event
  if exists (
    select 1 from user_activity_events
    where user_id = p_user_id and event_type = 'contribution_completed'
    limit 1
  ) then
    insert into user_badges (user_id, badge_id)
      values (p_user_id, 'first_merge')
      on conflict do nothing
      returning true into v_inserted;
    if v_inserted then
      insert into user_activity_events (user_id, event_type, payload)
        values (p_user_id, 'badge_earned', jsonb_build_object(
          'badge_id', 'first_merge',
          'name_key', 'badge.first_merge.name'
        ));
    end if;
    v_inserted := null;
  end if;

  -- 3. polyglot — contribution_completed events spanning >= 3 distinct languages.
  --    Languages are read from payload->>'language'; events without that field
  --    do not count. NULL/empty values filtered out.
  select count(distinct nullif(payload->>'language', ''))
  into v_distinct_languages
  from user_activity_events
  where user_id = p_user_id
    and event_type = 'contribution_completed'
    and payload ? 'language';

  if coalesce(v_distinct_languages, 0) >= 3 then
    insert into user_badges (user_id, badge_id, metadata)
      values (
        p_user_id,
        'polyglot',
        jsonb_build_object('language_count', v_distinct_languages)
      )
      on conflict do nothing
      returning true into v_inserted;
    if v_inserted then
      insert into user_activity_events (user_id, event_type, payload)
        values (p_user_id, 'badge_earned', jsonb_build_object(
          'badge_id', 'polyglot',
          'name_key', 'badge.polyglot.name',
          'language_count', v_distinct_languages
        ));
    end if;
    v_inserted := null;
  end if;

  -- 4. explorer — contribution_completed events to >= 5 distinct repos.
  --    Repo identity = "owner/name" derived from payload fields written by
  --    the client (see app/hooks/usePickedIssues.ts). Falls back to empty
  --    string which gets filtered.
  select count(distinct nullif(
    coalesce(payload->>'repository_owner', '') ||
    '/' ||
    coalesce(payload->>'repository_name', ''),
    '/'
  ))
  into v_distinct_repos
  from user_activity_events
  where user_id = p_user_id
    and event_type = 'contribution_completed';

  if coalesce(v_distinct_repos, 0) >= 5 then
    insert into user_badges (user_id, badge_id, metadata)
      values (
        p_user_id,
        'explorer',
        jsonb_build_object('repo_count', v_distinct_repos)
      )
      on conflict do nothing
      returning true into v_inserted;
    if v_inserted then
      insert into user_activity_events (user_id, event_type, payload)
        values (p_user_id, 'badge_earned', jsonb_build_object(
          'badge_id', 'explorer',
          'name_key', 'badge.explorer.name',
          'repo_count', v_distinct_repos
        ));
    end if;
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- Trigger: re-evaluate badges after a relevant activity event is inserted.
-- Skips `badge_earned` itself to avoid recursion.
-- ----------------------------------------------------------------------------
create or replace function trigger_evaluate_user_badges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.event_type in ('issue_picked', 'contribution_completed') then
    perform evaluate_user_badges(new.user_id);
  end if;
  return new;
end;
$$;

drop trigger if exists user_activity_events_evaluate_badges on user_activity_events;

create trigger user_activity_events_evaluate_badges
  after insert on user_activity_events
  for each row
  execute function trigger_evaluate_user_badges();

-- Grant execute on the evaluator so service-role and authenticated callers can
-- invoke a manual re-evaluation if needed (e.g. backfill script).
grant execute on function evaluate_user_badges(text) to authenticated, service_role;
