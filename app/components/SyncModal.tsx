import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Repository } from '../types';
import { FaGithub, FaDesktop, FaCodeBranch } from 'react-icons/fa';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (option: 'local' | 'gist' | 'merge') => void;
  localRepositories: Repository[];
  gistRepositories: Repository[];
}

const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  onSync,
  localRepositories,
  gistRepositories,
}) => {
  const { t } = useTranslation();
  const [hoveredOption, setHoveredOption] = useState<'local' | 'gist' | 'merge' | null>(
    null,
  );

  if (!isOpen) return null;

  const getMergedRepositories = () => {
    const merged = [...localRepositories];
    gistRepositories.forEach(gistRepo => {
      const exists = merged.some(
        localRepo =>
          localRepo.owner === gistRepo.owner && localRepo.name === gistRepo.name,
      );
      if (!exists) {
        merged.push(gistRepo);
      }
    });
    return merged;
  };

  const getTooltipContent = () => {
    if (!hoveredOption) return null;

    let repositories: Repository[] = [];
    let title = '';

    switch (hoveredOption) {
      case 'local':
        repositories = localRepositories;
        title = 'Local Repositories';
        break;
      case 'gist':
        repositories = gistRepositories;
        title = 'Gist Repositories';
        break;
      case 'merge':
        repositories = getMergedRepositories();
        title = 'Merged Repositories';
        break;
    }

    return (
      <div className="absolute left-full ml-4 top-0 w-64 bg-[#21262d] border border-gray-700 rounded-lg p-4 z-50">
        <h4 className="font-medium text-gray-100 mb-2">{title}</h4>
        <div className="max-h-48 overflow-y-auto">
          {repositories.length > 0 ? (
            <ul className="space-y-1">
              {repositories.map(repo => (
                <li key={`${repo.owner}/${repo.name}`} className="text-sm text-gray-300">
                  {repo.owner}/{repo.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No repositories</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#161b22] border border-gray-700 rounded-lg p-6 max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">
          {t('settings.syncTitle')}
        </h2>
        <p className="text-gray-400 mb-8">{t('settings.syncDescription')}</p>

        <div className="space-y-4">
          <div className="relative">
            <button
              onClick={() => onSync('local')}
              onMouseEnter={() => setHoveredOption('local')}
              onMouseLeave={() => setHoveredOption(null)}
              className="w-full flex items-center p-4 bg-[#0d1117] border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-full">
                <FaDesktop className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-100">
                  {t('settings.keepLocal', { count: localRepositories.length })}
                </h3>
                <p className="text-sm text-gray-500">
                  Keep your current local repository list
                </p>
              </div>
            </button>
            {hoveredOption === 'local' && getTooltipContent()}
          </div>

          <div className="relative">
            <button
              onClick={() => onSync('gist')}
              onMouseEnter={() => setHoveredOption('gist')}
              onMouseLeave={() => setHoveredOption(null)}
              className="w-full flex items-center p-4 bg-[#0d1117] border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-500/10 border border-gray-500/20 rounded-full">
                <FaGithub className="w-6 h-6 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-100">
                  {t('settings.keepGist', { count: gistRepositories.length })}
                </h3>
                <p className="text-sm text-gray-500">
                  Use the repository list from your GitHub Gist
                </p>
              </div>
            </button>
            {hoveredOption === 'gist' && getTooltipContent()}
          </div>

          <div className="relative">
            <button
              onClick={() => onSync('merge')}
              onMouseEnter={() => setHoveredOption('merge')}
              onMouseLeave={() => setHoveredOption(null)}
              className="w-full flex items-center p-4 bg-[#0d1117] border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-purple-500/10 border border-purple-500/20 rounded-full">
                <FaCodeBranch className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-100">
                  {t('settings.mergeRepositories')}
                </h3>
                <p className="text-sm text-gray-500">Combine both repository lists</p>
              </div>
            </button>
            {hoveredOption === 'merge' && getTooltipContent()}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncModal;
