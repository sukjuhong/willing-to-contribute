'use client';

import { useState, useCallback } from 'react';
import { Issue } from '../types';
import { getRecommendedIssues } from '../utils/github';
import {
  saveRecommendedIssuesCache,
  loadRecommendedIssuesCache,
} from '../utils/localStorage';

export default function useRecommendedIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  const fetchRecommendedIssues = useCallback(
    async (language?: string) => {
      const lang = language ?? languageFilter;

      // Check cache first
      const cached = loadRecommendedIssuesCache(lang);
      if (cached) {
        setIssues(cached);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getRecommendedIssues(lang);
        setIssues(result);
        saveRecommendedIssuesCache(result, lang);
      } catch (err: unknown) {
        const error = err as { isRateLimit?: boolean; message?: string };
        if (error.isRateLimit) {
          setError(error.message || 'GitHub API rate limit exceeded.');
        } else {
          setError('Failed to fetch recommended issues.');
        }
      } finally {
        setLoading(false);
      }
    },
    [languageFilter],
  );

  const changeLanguageFilter = useCallback(
    (language: string) => {
      setLanguageFilter(language);
      fetchRecommendedIssues(language);
    },
    [fetchRecommendedIssues],
  );

  return {
    recommendedIssues: issues,
    recommendedLoading: loading,
    recommendedError: error,
    languageFilter,
    changeLanguageFilter,
    fetchRecommendedIssues,
  };
}
