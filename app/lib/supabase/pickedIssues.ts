import { createClient } from '@/app/lib/supabase/client';
import { logActivityEvent } from '@/app/lib/supabase/activityEvents';
import { PickedIssue, Label } from '@/app/types';
import { Database } from '@/app/types/supabase';

type PickedIssueRow = Database['public']['Tables']['picked_issues']['Row'];
type PickedIssueInsert = Database['public']['Tables']['picked_issues']['Insert'];

function rowToPickedIssue(row: PickedIssueRow): PickedIssue {
  return {
    id: row.issue_id,
    number: row.issue_number,
    title: row.title,
    url: row.issue_url,
    state: row.state as 'open' | 'closed',
    repository: {
      owner: row.repository_owner,
      name: row.repository_name,
    },
    labels: (row.labels as unknown as Label[]) ?? [],
    savedAt: row.picked_at,
    userTags: (row.user_tags as unknown as string[]) ?? [],
    lastKnownState: row.last_known_state as 'open' | 'closed',
    lastCheckedAt: row.last_checked_at,
    assignee: row.assignee ?? undefined,
  };
}

export async function loadPickedIssues(userId: string): Promise<PickedIssue[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('picked_issues')
    .select('*')
    .eq('user_id', userId)
    .order('picked_at', { ascending: false });

  if (error || !data) return [];
  return (data as unknown as PickedIssueRow[]).map(rowToPickedIssue);
}

export async function pickIssue(userId: string, issue: PickedIssue): Promise<boolean> {
  const supabase = createClient();
  const row: PickedIssueInsert = {
    user_id: userId,
    issue_id: issue.id,
    issue_number: issue.number,
    issue_url: issue.url,
    repository_owner: issue.repository.owner,
    repository_name: issue.repository.name,
    title: issue.title,
    state: issue.state,
    labels: issue.labels as unknown as PickedIssueInsert['labels'],
    assignee: issue.assignee ?? null,
    user_tags: issue.userTags as unknown as PickedIssueInsert['user_tags'],
    picked_at: issue.savedAt,
    last_known_state: issue.lastKnownState,
    last_checked_at: issue.lastCheckedAt,
  };

  const { error } = await supabase
    .from('picked_issues')
    .upsert(row as never, { onConflict: 'user_id,issue_id' });
  if (error) return false;

  void logActivityEvent(userId, 'issue_picked', {
    issue_id: issue.id,
    issue_url: issue.url,
    repository_owner: issue.repository.owner,
    repository_name: issue.repository.name,
  });
  return true;
}

export async function unpickIssue(userId: string, issueId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('picked_issues')
    .delete()
    .eq('user_id', userId)
    .eq('issue_id', issueId);
  if (error) return false;

  void logActivityEvent(userId, 'issue_unpicked', { issue_id: issueId });
  return true;
}

export async function updatePickedIssue(
  userId: string,
  issueId: string,
  updates: Partial<
    Pick<
      PickedIssueRow,
      | 'title'
      | 'state'
      | 'labels'
      | 'assignee'
      | 'user_tags'
      | 'last_known_state'
      | 'last_checked_at'
    >
  >,
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('picked_issues')
    .update(updates as never)
    .eq('user_id', userId)
    .eq('issue_id', issueId);
  return !error;
}

export async function bulkUpdatePickedIssues(
  userId: string,
  issues: PickedIssue[],
): Promise<boolean> {
  const supabase = createClient();
  const rows = issues.map(
    issue =>
      ({
        user_id: userId,
        issue_id: issue.id,
        issue_number: issue.number,
        issue_url: issue.url,
        repository_owner: issue.repository.owner,
        repository_name: issue.repository.name,
        title: issue.title,
        state: issue.state,
        labels: issue.labels as unknown as PickedIssueInsert['labels'],
        assignee: issue.assignee ?? null,
        user_tags: issue.userTags as unknown as PickedIssueInsert['user_tags'],
        picked_at: issue.savedAt,
        last_known_state: issue.lastKnownState,
        last_checked_at: issue.lastCheckedAt,
      }) satisfies PickedIssueInsert,
  );

  const { error } = await supabase
    .from('picked_issues')
    .upsert(rows as never, { onConflict: 'user_id,issue_id' });
  return !error;
}

export interface PickCount {
  issueUrl: string;
  repositoryOwner: string;
  repositoryName: string;
  title: string;
  pickCount: number;
}

export async function getPickCounts(): Promise<PickCount[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('picked_issues_counts' as never)
    .select('*');

  if (error || !data) return [];

  return (
    data as unknown as Array<{
      issue_url: string;
      repository_owner: string;
      repository_name: string;
      title: string;
      pick_count: number;
    }>
  ).map(row => ({
    issueUrl: row.issue_url,
    repositoryOwner: row.repository_owner,
    repositoryName: row.repository_name,
    title: row.title,
    pickCount: row.pick_count,
  }));
}
