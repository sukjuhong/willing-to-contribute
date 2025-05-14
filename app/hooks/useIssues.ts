import { useState, useEffect, useCallback } from 'react';
import { Issue, Repository, UserSettings } from '../types';
import { getIssues } from '../utils/github';
import {
  loadIssues,
  saveRepositoryIssues,
  loadRepositoryIssues,
  loadRepositoryTimestamp,
  createRepositoryKey,
} from '../utils/localStorage';
import {
  markNewIssues,
  findNewIssues,
  showIssueNotification,
} from '../utils/notifications';

// Constants for cache management
const CACHE_VALID_MINUTES = 60; // 고정 캐시 시간: 60분

// Custom hook for fetching and managing GitHub issues
const useIssues = (settings: UserSettings) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 레포지토리의 캐시가 유효한지 확인하는 함수
  const isRepositoryCacheValid = useCallback((repository: Repository): boolean => {
    const repoKey = createRepositoryKey(repository);
    const timestamp = loadRepositoryTimestamp(repoKey);

    if (!timestamp) return false;

    const currentTime = Date.now();
    const cacheValidTime = CACHE_VALID_MINUTES * 60 * 1000; // 밀리초로 변환

    return currentTime - timestamp < cacheValidTime;
  }, []);

  // Fetch issues from GitHub
  const fetchIssues = useCallback(
    async (showNotifications = false, forceRefresh = false) => {
      if (!settings.repositories || settings.repositories.length === 0) {
        setIssues([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Load previous issues to compare for notifications
        const previousIssues = loadIssues();

        // Store all fetched issues here
        const allIssues: Issue[] = [];

        // Fetch issues for each repository separately
        for (const repo of settings.repositories) {
          const repoKey = createRepositoryKey(repo);

          // 캐시가 유효하고 강제 새로고침이 아닌 경우 캐시된 이슈 사용
          if (!forceRefresh && isRepositoryCacheValid(repo)) {
            const cachedRepoIssues = loadRepositoryIssues(repoKey);
            if (cachedRepoIssues) {
              console.log(`Using cached issues for ${repoKey}`);
              allIssues.push(...cachedRepoIssues);
              continue;
            }
          }

          try {
            // 레포지토리의 이슈 가져오기
            const repoIssues = await getIssues(
              repo,
              settings.customLabels,
              settings.hideClosedIssues,
            );

            // 저장소별 이슈 저장 (타임스탬프는 내부에서 추가됨)
            saveRepositoryIssues(repoKey, repoIssues);

            // 전체 이슈 목록에 추가
            allIssues.push(...repoIssues);
          } catch (err: unknown) {
            // GitHub API 제한 오류 확인 및 사용자에게 표시
            const error = err as { isRateLimit?: boolean; resetTime?: Date };
            if (error.isRateLimit) {
              const resetTime = error.resetTime;
              if (resetTime) {
                const formattedTime = resetTime.toLocaleTimeString();
                setError(
                  `GitHub API 사용 한도를 초과했습니다. ${formattedTime}에 다시 시도해주세요.`,
                );
              } else {
                setError('GitHub API 사용 한도를 초과했습니다.');
              }

              // Break the loop as all subsequent requests will also fail
              break;
            } else {
              console.error(`Error fetching issues for ${repoKey}:`, err);
            }
          }
        }

        // Mark new issues
        const markedIssues = markNewIssues(allIssues, settings.lastCheckedAt);

        // Set the issues
        setIssues(markedIssues);

        // We no longer need to call saveIssues separately, as saveRepositoryIssues
        // handles saving issues by repository. saveIssues would overwrite the same data.

        // Show notifications for new issues if requested
        if (showNotifications) {
          const newIssues = findNewIssues(markedIssues, previousIssues);

          // Show notifications for each new issue
          newIssues.forEach(issue => {
            showIssueNotification(issue);
          });
        }
      } catch (err: unknown) {
        console.error('Error fetching issues:', err);

        // Handle any unhandled rate limit errors
        const errorObj = err as { isRateLimit?: boolean; resetTime?: Date };
        if (errorObj.isRateLimit) {
          const resetTime = errorObj.resetTime;
          if (resetTime) {
            const formattedTime = resetTime.toLocaleTimeString();
            setError(
              `GitHub API 사용 한도를 초과했습니다. ${formattedTime}에 다시 시도해주세요.`,
            );
          } else {
            setError('GitHub API 사용 한도를 초과했습니다.');
          }
        } else {
          setError('이슈 가져오기에 실패했습니다. 다시 시도해주세요.');
        }
      } finally {
        setLoading(false);
      }
    },
    [settings, isRepositoryCacheValid],
  );

  // Load cached issues on mount
  useEffect(() => {
    const cachedIssues = loadIssues();
    if (cachedIssues && cachedIssues.length > 0) {
      setIssues(cachedIssues);
    }
  }, []);

  // Fetch issues when repositories change
  useEffect(() => {
    if (settings.repositories && settings.repositories.length > 0) {
      fetchIssues(false, false); // 캐시가 유효하면 사용하도록 변경
    }
  }, [settings.repositories, fetchIssues]);

  return {
    issues,
    loading,
    error,
    fetchIssues,
  };
};

export default useIssues;
