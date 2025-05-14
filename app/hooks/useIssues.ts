import { useState, useEffect, useCallback } from 'react';
import { Issue, Repository, UserSettings } from '../types';
import { getIssues } from '../utils/github';
import { saveIssues, loadIssues } from '../utils/localStorage';
import { markNewIssues, findNewIssues, showIssueNotification } from '../utils/notifications';

// Custom hook for fetching and managing GitHub issues
const useIssues = (settings: UserSettings) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached issues on mount
  useEffect(() => {
    const cachedIssues = loadIssues();
    if (cachedIssues && cachedIssues.length > 0) {
      setIssues(cachedIssues);
    }
  }, []);

  // Fetch issues from GitHub
  const fetchIssues = useCallback(async (showNotifications = false) => {
    if (!settings.repositories || settings.repositories.length === 0) {
      setIssues([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Load previous issues to compare for notifications
      const previousIssues = loadIssues();
      
      // Fetch issues for each repository
      const allIssuesPromises = settings.repositories.map(repo => 
        getIssues(repo, settings.customLabels, settings.hideClosedIssues)
      );
      
      // Wait for all requests to complete
      const issuesArrays = await Promise.all(allIssuesPromises);
      
      // Flatten the arrays of issues
      let allIssues = issuesArrays.flat();
      
      // Mark new issues
      allIssues = markNewIssues(allIssues, settings.lastCheckedAt);
      
      // Set the issues
      setIssues(allIssues);
      
      // Save to localStorage
      saveIssues(allIssues);
      
      // Show notifications for new issues if requested
      if (showNotifications) {
        const newIssues = findNewIssues(allIssues, previousIssues);
        
        // Show notifications for each new issue
        newIssues.forEach(issue => {
          showIssueNotification(issue);
        });
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError('Failed to fetch issues. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [settings]);

  return {
    issues,
    loading,
    error,
    fetchIssues,
  };
};

export default useIssues; 