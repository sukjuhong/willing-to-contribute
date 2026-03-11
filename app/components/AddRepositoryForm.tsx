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
    <div className="bg-[#161b22] rounded-lg border border-gray-700 p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-100">
        {t('repository.addRepository')}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="repoUrl"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            {t('repository.githubUrlOrOwnerName')}
          </label>

          <input
            id="repoUrl"
            type="text"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder={t('repository.urlPlaceholder')}
            className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-md text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-[family-name:var(--font-mono)]"
            disabled={disabled || loading}
          />

          {error && <p className="mt-1 text-red-400 text-sm">{error}</p>}

          <p className="mt-1 text-gray-500 text-xs">
            {t('repository.monitorDescription')}
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={disabled || loading}
            className={`flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-cyan-600 border-0 rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${
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
