import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaSpinner, FaStar, FaSearch } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';
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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Repository[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const repos = await searchRepositories(query.trim());
        setResults(repos);
      } catch {
        setError(t('errors.failedToAddRepository'));
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, t]);

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

      {!isLoggedIn ? (
        <p className="text-gray-400 text-sm">{t('repository.loginRequired')}</p>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <div className="flex items-center">
              <FaSearch className="absolute left-3 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('repository.searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-gray-700 rounded-md text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                disabled={disabled}
              />
              {searching && (
                <FaSpinner className="absolute right-3 text-gray-500 animate-spin" />
              )}
            </div>

            <p className="mt-1 text-gray-500 text-xs">
              {t('repository.monitorDescription')}
            </p>

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
      )}
    </div>
  );
};

export default AddRepositoryForm;
