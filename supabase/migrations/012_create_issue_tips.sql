-- Issue tips: short user-generated tips per issue (UGC)
-- Powers #45 — beginner contributors share approach hints, gotchas, etc.
create table issue_tips (
  id uuid primary key default gen_random_uuid(),
  issue_url text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) <= 280 and char_length(trim(content)) > 0),
  like_count int not null default 0,
  report_count int not null default 0,
  hidden_at timestamptz,
  created_at timestamptz not null default now()
);

-- Fast lookup of visible tips per issue
create index idx_issue_tips_url_visible on issue_tips(issue_url, hidden_at);
create index idx_issue_tips_user on issue_tips(user_id);

alter table issue_tips enable row level security;

-- Anyone (including anon) can read visible tips
create policy "Anyone can view visible tips"
  on issue_tips for select
  using (hidden_at is null);

-- Authors can insert their own tips
create policy "Users can insert own tips"
  on issue_tips for insert
  with check (auth.uid() = user_id);

-- Authors can update their own tips (e.g. for trigger-driven counter sync we use SECURITY DEFINER triggers; users editing content is out of scope but allowed)
create policy "Users can update own tips"
  on issue_tips for update
  using (auth.uid() = user_id);

-- Authors can delete their own tips
create policy "Users can delete own tips"
  on issue_tips for delete
  using (auth.uid() = user_id);


-- Companion: likes
create table issue_tip_likes (
  tip_id uuid not null references issue_tips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (tip_id, user_id)
);

create index idx_issue_tip_likes_user on issue_tip_likes(user_id);

alter table issue_tip_likes enable row level security;

create policy "Anyone can view likes"
  on issue_tip_likes for select
  using (true);

create policy "Users can like tips"
  on issue_tip_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike own likes"
  on issue_tip_likes for delete
  using (auth.uid() = user_id);

-- Trigger: keep issue_tips.like_count in sync with issue_tip_likes
create or replace function sync_issue_tip_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    update issue_tips set like_count = like_count + 1 where id = NEW.tip_id;
    return NEW;
  elsif (TG_OP = 'DELETE') then
    update issue_tips set like_count = greatest(like_count - 1, 0) where id = OLD.tip_id;
    return OLD;
  end if;
  return null;
end;
$$;

create trigger trg_issue_tip_likes_sync
  after insert or delete on issue_tip_likes
  for each row execute function sync_issue_tip_like_count();


-- Companion: reports (one per user per tip, auto-hide at threshold)
create table issue_tip_reports (
  tip_id uuid not null references issue_tips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  primary key (tip_id, user_id)
);

create index idx_issue_tip_reports_user on issue_tip_reports(user_id);

alter table issue_tip_reports enable row level security;

-- Reporters can see their own report (to detect duplicates client-side)
create policy "Users can view own reports"
  on issue_tip_reports for select
  using (auth.uid() = user_id);

create policy "Users can file reports"
  on issue_tip_reports for insert
  with check (auth.uid() = user_id);

-- Trigger: bump report_count and hide at >= 3 reports
create or replace function sync_issue_tip_report_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count int;
begin
  update issue_tips
    set report_count = report_count + 1
    where id = NEW.tip_id
    returning report_count into new_count;

  if (new_count >= 3) then
    update issue_tips
      set hidden_at = coalesce(hidden_at, now())
      where id = NEW.tip_id;
  end if;

  return NEW;
end;
$$;

create trigger trg_issue_tip_reports_sync
  after insert on issue_tip_reports
  for each row execute function sync_issue_tip_report_count();
