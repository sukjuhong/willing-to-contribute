import React from 'react';
import { Repository } from '../types';
import { FaStar, FaTrash, FaGithub } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';

interface RepositoryItemProps {
  repository: Repository;
  onRemove: (id: string) => void;
}

const RepositoryItem: React.FC<RepositoryItemProps> = ({ repository, onRemove }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-[#161b22] rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-cyan-400 font-[family-name:var(--font-mono)]">
            {repository.owner}/{repository.name}
          </h3>

          {repository.description && (
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">
              {repository.description}
            </p>
          )}

          <div className="flex items-center mt-3 text-sm">
            {repository.stargazersCount !== undefined && (
              <div className="flex items-center text-amber-400 mr-4">
                <FaStar className="mr-1" />
                <span>{repository.stargazersCount.toLocaleString()}</span>
              </div>
            )}

            <a
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-500 hover:text-cyan-400 transition-colors"
            >
              <FaGithub className="mr-1" />
              <span>{t('common.viewOnGithub')}</span>
            </a>
          </div>
        </div>

        <button
          onClick={() => onRemove(repository.id)}
          className="text-gray-600 hover:text-red-400 transition-colors p-1"
          aria-label={t('common.removeRepository', {
            repo: `${repository.owner}/${repository.name}`,
          })}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default RepositoryItem;
