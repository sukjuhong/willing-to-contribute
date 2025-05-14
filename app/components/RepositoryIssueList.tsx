import React, { useState } from 'react';
import { Issue, Repository } from '../types';
import IssueItem from './IssueItem';
import { FaChevronDown, FaChevronRight, FaExternalLinkAlt } from 'react-icons/fa';

interface RepositoryIssueListProps {
  repository: Repository;
  issues: Issue[];
}

const RepositoryIssueList: React.FC<RepositoryIssueListProps> = ({ repository, issues }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const newIssuesCount = issues.filter(issue => issue.isNew).length;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
      {/* Repository header */}
      <div 
        className="p-3 bg-gray-50 dark:bg-gray-700 flex items-center justify-between cursor-pointer border-l-4 border-indigo-500"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          {isExpanded ? 
            <FaChevronDown className="text-gray-500 mr-2" /> : 
            <FaChevronRight className="text-gray-500 mr-2" />
          }
          <h3 className="font-medium text-gray-900 dark:text-white">
            {repository.owner}/{repository.name}
          </h3>
          <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
            {issues.length} issues
          </span>
          {newIssuesCount > 0 && (
            <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded-full">
              {newIssuesCount} new
            </span>
          )}
        </div>
        
        <a 
          href={`https://github.com/${repository.owner}/${repository.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <FaExternalLinkAlt className="mr-1 text-xs" />
          <span className="text-xs">View Repo</span>
        </a>
      </div>
      
      {/* Issues list */}
      {isExpanded && (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {issues.map(issue => (
            <div key={issue.id} className="px-2 py-1">
              <IssueItem issue={issue} compact={true} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepositoryIssueList; 