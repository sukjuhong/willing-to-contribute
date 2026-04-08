import { useCallback, useState } from 'react';
import { SavedIssue, UserSettings } from '../types';
import { saveSettings } from '../utils/localStorage';
import { Octokit } from '@octokit/rest';

interface StateChange {
  issue: SavedIssue;
  field: 'state' | 'assignee';
  from: string | undefined;
  to: string | undefined;
}

const useSavedIssues = (
  settings: UserSettings,
  setSettings: (fn: (prev: UserSettings) => UserSettings) => void,
  accessToken?: string,
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check current state of all saved issues via GitHub API
  const refreshSavedIssues = useCallback(async (): Promise<StateChange[]> => {
    if (settings.savedIssues.length === 0) return [];

    setLoading(true);
    setError(null);
    const changes: StateChange[] = [];

    try {
      const octokit = new Octokit(accessToken ? { auth: accessToken } : undefined);

      const updated = await Promise.all(
        settings.savedIssues.map(async saved => {
          try {
            const { data } = await octokit.issues.get({
              owner: saved.repository.owner,
              repo: saved.repository.name,
              issue_number: saved.number,
            });

            const newState = data.state as 'open' | 'closed';
            const newAssignee = data.assignee?.login;

            if (newState !== saved.lastKnownState) {
              changes.push({
                issue: saved,
                field: 'state',
                from: saved.lastKnownState,
                to: newState,
              });
            }

            if (newAssignee !== saved.assignee) {
              changes.push({
                issue: saved,
                field: 'assignee',
                from: saved.assignee,
                to: newAssignee,
              });
            }

            return {
              ...saved,
              title: data.title,
              state: newState,
              lastKnownState: newState,
              assignee: newAssignee,
              lastCheckedAt: new Date().toISOString(),
            };
          } catch {
            // If we can't fetch, keep as-is
            return saved;
          }
        }),
      );

      const newSettings: UserSettings = { ...settings, savedIssues: updated };
      setSettings(() => newSettings);
      saveSettings(newSettings);
    } catch (err) {
      console.error('Error refreshing saved issues:', err);
      setError('Failed to check saved issue states');
    } finally {
      setLoading(false);
    }

    return changes;
  }, [settings, setSettings, accessToken]);

  return {
    savedIssues: settings.savedIssues,
    loading,
    error,
    refreshSavedIssues,
  };
};

export type { StateChange };
export default useSavedIssues;
