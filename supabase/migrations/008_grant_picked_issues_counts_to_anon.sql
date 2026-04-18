-- Allow unauthenticated (anon) users to read the aggregate pick counts view.
-- The view only exposes aggregated `count(*)` per issue_url with no user IDs,
-- so it is safe to expose publicly for social-proof badges on the landing feed.
grant select on picked_issues_counts to anon;
