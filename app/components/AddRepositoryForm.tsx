import React, { useState } from 'react';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';

interface AddRepositoryFormProps {
  onAddRepository: (repoUrl: string) => Promise<boolean>;
  disabled?: boolean;
}

const AddRepositoryForm: React.FC<AddRepositoryFormProps> = ({
  onAddRepository,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simple validation
    if (!repoUrl.trim()) {
      setError(t('errors.enterRepositoryUrl'));
      return;
    }

    setLoading(true);

    try {
      const success = await onAddRepository(repoUrl);

      if (success) {
        // Clear the form on success
        setRepoUrl('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.failedToAddRepository'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
        {t('repository.addRepository')}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="repoUrl"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t('repository.githubUrlOrOwnerName')}
          </label>

          <input
            id="repoUrl"
            type="text"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder={t('repository.urlPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={disabled || loading}
          />

          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('repository.monitorDescription')}
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={disabled || loading}
            className={`flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                {t('common.adding')}
              </>
            ) : (
              <>
                <FaPlus className="mr-2" />
                {t('repository.addRepository')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRepositoryForm;
