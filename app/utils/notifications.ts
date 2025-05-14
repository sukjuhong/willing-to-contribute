import { Issue } from '../types';

// Check browser notification permissions
export const checkNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Show notification for new issue
export const showIssueNotification = async (issue: Issue): Promise<void> => {
  const hasPermission = await checkNotificationPermission();
  
  if (!hasPermission) {
    console.warn('Notification permission not granted');
    return;
  }
  
  const repoName = `${issue.repository.owner}/${issue.repository.name}`;
  const title = `New Good First Issue in ${repoName}`;
  const body = issue.title;
  
  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Find new issues by comparing with previous issues
export const findNewIssues = (
  currentIssues: Issue[],
  previousIssues: Issue[]
): Issue[] => {
  // Create a map of previous issues for quick lookup
  const previousIssueMap = new Map<string, true>();
  previousIssues.forEach(issue => {
    previousIssueMap.set(`${issue.repository.owner}/${issue.repository.name}#${issue.number}`, true);
  });
  
  // Find new issues
  return currentIssues.filter(issue => {
    const issueKey = `${issue.repository.owner}/${issue.repository.name}#${issue.number}`;
    return !previousIssueMap.has(issueKey);
  });
};

// Mark issues as new
export const markNewIssues = (
  issues: Issue[], 
  lastCheckedAt: string | undefined
): Issue[] => {
  if (!lastCheckedAt) {
    return issues;
  }
  
  const lastCheckedDate = new Date(lastCheckedAt);
  
  return issues.map(issue => {
    const createdDate = new Date(issue.createdAt);
    const isNew = createdDate > lastCheckedDate;
    
    return {
      ...issue,
      isNew,
    };
  });
}; 