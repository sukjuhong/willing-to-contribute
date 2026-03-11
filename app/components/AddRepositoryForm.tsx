import React, { useState, useCallback } from 'react';
import { FaPlus, FaSpinner, FaStar, FaSearch, FaLock } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';
import { useApp } from '../contexts/AppContext';
import { searchRepositories } from '../utils/github';
import { Repository } from '../types';

interface AddRepositoryFormProps {
  onAddRepository: (repoUrl: string) => Promise<boolean>;
  disabled?: boolean;
  isLoggedIn: boolean;
  trackedRepositories: Array<{ owner: string; name: string }>;
}

const AddRepositoryForm: React.FC<AddRepositoryFormProps> = ({
  onAddRepository,
  disabled = false,
  isLoggedIn,
  trackedRepositories,
}) => {
  const { t } = useTranslation();
  const { login, authState } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Repository[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || rateLimited) return;

    setSearching(true);
    setError(null);
    try {
      if (isLoggedIn && authState.token) {
        const response = await fetch(
          `/api/search?type=repos&q=${encodeURIComponent(query.trim())}`,
          { headers: { Authorization: `Bearer ${authState.token}` } },
        );
        if (response.status === 429) {
          setError(t('errors.rateLimitExceededLoggedIn'));
          setRateLimited(true);
          setResults([]);
          return;
        }
        const data = await response.json();
        setResults(data.results || []);
      } else {
        const repos = await searchRepositories(query.trim());
        setResults(repos);
      }
    } catch (err: unknown) {
      const error = err as { isRateLimit?: boolean; message?: string };
      if (error.isRateLimit) {
        setError(t('errors.rateLimitExceeded'));
        setRateLimited(true);
      } else {
        setError(t('errors.failedToAddRepository'));
      }
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query, t, isLoggedIn, authState.token, rateLimited]);

  const isTracked = (repo: Repository) =>
    trackedRepositories.some(r => r.owner === repo.owner && r.name === repo.name);

  const handleAdd = async (repo: Repository) => {
    setAddingId(repo.id);
    setError(null);
    try {
      await onAddRepository(`${repo.owner}/${repo.name}`);
    } catch {
      setError(t('errors.failedToAddRepository'));
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="bg-[#161b22] rounded-lg border border-gray-700 p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-100">
        {t('repository.addRepository')}
      </h3>

      <div className="space-y-3">
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  if (rateLimited) setRateLimited(false);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder={t('repository.searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-gray-700 rounded-md text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                disabled={disabled}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={disabled || searching || !query.trim() || rateLimited}
              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? <FaSpinner className="animate-spin" /> : t('common.search')}
            </button>
          </div>

          <p className="mt-1 text-gray-500 text-xs">
            {t('repository.monitorDescription')}
          </p>

          {!isLoggedIn && (
            <p className="mt-1 text-gray-500 text-xs">{t('repository.loginRequired')}</p>
          )}

          {error && <p className="mt-1 text-red-400 text-sm">{error}</p>}

          {results.length > 0 && (
            <ul className="mt-2 border border-gray-700 rounded-md bg-[#0d1117] divide-y divide-gray-800 overflow-hidden">
              {results.map(repo => {
                const tracked = isTracked(repo);
                const adding = addingId === repo.id;
                return (
                  <li
                    key={repo.id}
                    className="flex items-center justify-between px-3 py-2 gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-100 truncate">
                        {repo.owner}/{repo.name}
                      </p>
                      {repo.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {repo.description}
                        </p>
                      )}
                      {repo.stargazersCount !== undefined && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <FaStar className="text-yellow-500" />
                          {repo.stargazersCount.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {tracked ? (
                      <span className="shrink-0 text-xs px-2 py-1 rounded bg-gray-700 text-gray-400 cursor-default">
                        {t('recommended.alreadyTracked')}
                      </span>
                    ) : !isLoggedIn ? (
                      <button
                        disabled
                        className="shrink-0 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
                      >
                        <FaLock />
                        {t('repository.loginToTrack')}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAdd(repo)}
                        disabled={disabled || adding}
                        className={`shrink-0 flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-cyan-600 rounded hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                          disabled || adding ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {adding ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            {t('common.adding')}
                          </>
                        ) : (
                          <>
                            <FaPlus />
                            {t('repository.addRepository')}
                          </>
                        )}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddRepositoryForm;
