'use client';

import { FaSync, FaGithub } from 'react-icons/fa';
import AddRepositoryForm from '../../components/AddRepositoryForm';
import RepositoryItem from '../../components/RepositoryItem';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

export default function RepositoriesPage() {
  const { t } = useTranslation();
  const { settings, settingsLoading, settingsError, addRepository, removeRepository } =
    useApp();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {t('settings.trackedRepositories')}
      </h2>

      <AddRepositoryForm onAddRepository={addRepository} disabled={settingsLoading} />

      {settingsError && (
        <div className="p-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-md">
          {settingsError}
        </div>
      )}

      {settingsLoading ? (
        <div className="flex justify-center items-center p-8">
          <FaSync className="animate-spin text-indigo-600 mr-2" />
          <span className="text-gray-700 dark:text-gray-300">
            {t('common.loadingRepositories')}
          </span>
        </div>
      ) : settings.repositories.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {settings.repositories.map(repo => (
            <RepositoryItem key={repo.id} repository={repo} onRemove={removeRepository} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <FaGithub className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            {t('settings.noRepositories')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('settings.addRepositoriesToStart')}
          </p>
        </div>
      )}
    </div>
  );
}
