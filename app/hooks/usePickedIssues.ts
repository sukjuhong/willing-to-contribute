import { useCallback, useState, useEffect } from 'react';
import { PickedIssue, Issue } from '../types';
import { Database } from '../types/supabase';

type PickedIssueRow = Database['public']['Tables']['picked_issues']['Row'];
import { Octokit } from '@octokit/rest';
import {
  loadPickedIssues as loadFromSupabase,
  pickIssue as pickToSupabase,
  unpickIssue as unpickFromSupabase,
  updatePickedIssue,
  bulkUpdatePickedIssues,
} from '../lib/supabase/pickedIssues';

interface StateChange {
  issue: PickedIssue;
  field: 'state' | 'assignee';
  from: string | undefined;
  to: string | undefined;
}

// Process items in batches to avoid rate limits
async function batchProcess<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency = 5,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

const usePickedIssues = (isLoggedIn: boolean, userId?: string, accessToken?: string) => {
  const [pickedIssues, setPickedIssues] = useState<PickedIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load picked issues from Supabase on mount / auth change
  useEffect(() => {
    if (!isLoggedIn || !userId) {
      setPickedIssues([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    loadFromSupabase(userId)
      .then(issues => {
        if (!cancelled) setPickedIssues(issues);
      })
      .catch(err => {
        console.error('Error loading picked issues:', err);
        if (!cancelled) setError('Failed to load picked issues');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, userId]);

  // Pick an issue
  const pickIssue = useCallback(
    async (issue: Issue): Promise<boolean> => {
      if (!userId) return false;

      const alreadySaved = pickedIssues.some(s => s.id === issue.id);
      if (alreadySaved) return false;

      try {
        const now = new Date().toISOString();
        const saved: PickedIssue = {
          id: issue.id,
          number: issue.number,
          title: issue.title,
          url: issue.url,
          state: issue.state,
          repository: {
            owner: issue.repository.owner,
            name: issue.repository.name,
          },
          labels: issue.labels,
          savedAt: now,
          userTags: [],
          lastKnownState: issue.state,
          lastCheckedAt: now,
          assignee: undefined,
        };

        const ok = await pickToSupabase(userId, saved);
        if (ok) {
          setPickedIssues(prev => [saved, ...prev]);
        }
        return ok;
      } catch (err) {
        console.error('Error picking issue:', err);
        setError('Failed to pick issue');
        return false;
      }
    },
    [userId, pickedIssues],
  );

  // Unpick an issue
  const unpickIssue = useCallback(
    async (issueId: string): Promise<void> => {
      if (!userId) return;

      const ok = await unpickFromSupabase(userId, issueId);
      if (ok) {
        setPickedIssues(prev => prev.filter(s => s.id !== issueId));
      }
    },
    [userId],
  );

  // Update user tags on a picked issue
  const updateIssueTags = useCallback(
    async (issueId: string, tags: string[]): Promise<void> => {
      if (!userId) return;

      const ok = await updatePickedIssue(userId, issueId, {
        user_tags: tags as unknown as PickedIssueRow['user_tags'],
      });
      if (ok) {
        setPickedIssues(prev =>
          prev.map(s => (s.id === issueId ? { ...s, userTags: tags } : s)),
        );
      }
    },
    [userId],
  );

  // Check current state of all picked issues via GitHub API
  const refreshPickedIssues = useCallback(async (): Promise<StateChange[]> => {
    if (pickedIssues.length === 0 || !userId) return [];

    setLoading(true);
    setError(null);
    const changes: StateChange[] = [];

    try {
      const octokit = new Octokit(accessToken ? { auth: accessToken } : undefined);

      const updated = await batchProcess(
        pickedIssues,
        async (picked: PickedIssue) => {
          try {
            const { data } = await octokit.issues.get({
              owner: picked.repository.owner,
              repo: picked.repository.name,
              issue_number: picked.number,
            });

            const newState = data.state as 'open' | 'closed';
            const newAssignee = data.assignee?.login;

            if (newState !== picked.lastKnownState) {
              changes.push({
                issue: picked,
                field: 'state',
                from: picked.lastKnownState,
                to: newState,
              });
            }

            if (newAssignee !== picked.assignee) {
              changes.push({
                issue: picked,
                field: 'assignee',
                from: picked.assignee,
                to: newAssignee,
              });
            }

            return {
              ...picked,
              title: data.title,
              state: newState,
              lastKnownState: newState,
              assignee: newAssignee,
              lastCheckedAt: new Date().toISOString(),
            };
          } catch {
            return picked;
          }
        },
        5,
      );

      // Persist updated issues to Supabase
      await bulkUpdatePickedIssues(userId, updated);
      setPickedIssues(updated);
    } catch (err) {
      console.error('Error refreshing picked issues:', err);
      setError('Failed to check picked issue states');
    } finally {
      setLoading(false);
    }

    return changes;
  }, [pickedIssues, userId, accessToken]);

  return {
    pickedIssues,
    loading,
    error,
    pickIssue,
    unpickIssue,
    updateIssueTags,
    refreshPickedIssues,
  };
};

export type { StateChange };
export default usePickedIssues;
