import React from 'react';
import { Repository } from '../types';
import { FaStar, FaTrash, FaGithub } from 'react-icons/fa';

interface RepositoryItemProps {
  repository: Repository;
  onRemove: (id: string) => void;
}

const RepositoryItem: React.FC<RepositoryItemProps> = ({ repository, onRemove }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
            {repository.owner}/{repository.name}
          </h3>
          
          {repository.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
              {repository.description}
            </p>
          )}
          
          <div className="flex items-center mt-3 text-sm">
            {repository.stargazersCount !== undefined && (
              <div className="flex items-center text-amber-500 mr-4">
                <FaStar className="mr-1" />
                <span>{repository.stargazersCount.toLocaleString()}</span>
              </div>
            )}
            
            <a 
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
            >
              <FaGithub className="mr-1" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
        
        <button
          onClick={() => onRemove(repository.id)}
          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
          aria-label={`Remove ${repository.owner}/${repository.name}`}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default RepositoryItem; 