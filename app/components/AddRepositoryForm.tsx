import React, { useState, useCallback } from 'react';
import { FaPlus, FaSpinner, FaStar, FaSearch, FaLock } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { useApp } from '../contexts/AppContext';
import { searchRepositories } from '../utils/github';
import { Repository } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  const t = useTranslations();
  const { authState } = useApp();
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
      if (isLoggedIn && authState.accessToken) {
        const response = await fetch(
          `/api/search?type=repos&q=${encodeURIComponent(query.trim())}`,
          { headers: { Authorization: `Bearer ${authState.accessToken}` } },
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
  }, [query, t, isLoggedIn, authState.accessToken, rateLimited]);

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
    <Card className="bg-card border-border p-4">
      <h3 className="text-lg font-semibold mb-3 text-foreground">
        {t('repository.addRepository')}
      </h3>

      <div className="space-y-3">
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
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
                className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
                disabled={disabled}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={disabled || searching || !query.trim() || rateLimited}
              size="sm"
              className="shrink-0"
            >
              {searching ? <FaSpinner className="animate-spin" /> : t('common.search')}
            </Button>
          </div>

          <p className="mt-1 text-muted-foreground text-xs">
            {t('repository.monitorDescription')}
          </p>

          {!isLoggedIn && (
            <p className="mt-1 text-muted-foreground text-xs">
              {t('repository.loginRequired')}
            </p>
          )}

          {error && (
            <p role="alert" className="mt-1 text-destructive text-sm">
              {error}
            </p>
          )}

          {results.length > 0 && (
            <Card className="mt-2 border-border bg-background overflow-hidden">
              <ul className="divide-y divide-border">
                {results.map(repo => {
                  const tracked = isTracked(repo);
                  const adding = addingId === repo.id;
                  return (
                    <li
                      key={repo.id}
                      className="flex items-center justify-between px-3 py-2 gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {repo.owner}/{repo.name}
                        </p>
                        {repo.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {repo.description}
                          </p>
                        )}
                        {repo.stargazersCount !== undefined && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <FaStar className="text-amber-400" />
                            {repo.stargazersCount.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {tracked ? (
                        <span className="shrink-0 text-xs px-2 py-1 rounded bg-muted text-muted-foreground cursor-default">
                          {t('recommended.alreadyTracked')}
                        </span>
                      ) : !isLoggedIn ? (
                        <Button
                          disabled
                          variant="outline"
                          size="sm"
                          className="shrink-0 gap-1"
                        >
                          <FaLock />
                          {t('repository.loginToTrack')}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleAdd(repo)}
                          disabled={disabled || adding}
                          size="sm"
                          className={cn(
                            'shrink-0 gap-1',
                            (disabled || adding) && 'opacity-50',
                          )}
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
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AddRepositoryForm;
