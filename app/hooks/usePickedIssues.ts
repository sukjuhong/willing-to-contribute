import { useCallback, useState } from 'react';
import { PickedIssue, UserSettings } from '../types';
import { Octokit } from '@octokit/rest';

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

const usePickedIssues = (
  settings: UserSettings,
  persistSettings: (newSettings: UserSettings) => Promise<boolean>,
  accessToken?: string,
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check current state of all picked issues via GitHub API
  const refreshPickedIssues = useCallback(async (): Promise<StateChange[]> => {
    if (settings.pickedIssues.length === 0) return [];

    setLoading(true);
    setError(null);
    const changes: StateChange[] = [];

    try {
      const octokit = new Octokit(accessToken ? { auth: accessToken } : undefined);

      const updated = await batchProcess(
        settings.pickedIssues,
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

      // Persist via useSettings (localStorage + Supabase)
      await persistSettings({ ...settings, pickedIssues: updated });
    } catch (err) {
      console.error('Error refreshing picked issues:', err);
      setError('Failed to check picked issue states');
    } finally {
      setLoading(false);
    }

    return changes;
  }, [settings, persistSettings, accessToken]);

  return {
    pickedIssues: settings.pickedIssues,
    loading,
    error,
    refreshPickedIssues,
  };
};

export type { StateChange };
export default usePickedIssues;
