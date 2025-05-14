import React from 'react';
import { Issue } from '../types';
import { FaGithub, FaClock } from 'react-icons/fa';

interface IssueItemProps {
  issue: Issue;
  compact?: boolean;
}

// Format date to relative time (e.g., "2 days ago")
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSecs < 60) {
    return 'just now';
  } else if (diffInMins < 60) {
    return `${diffInMins}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const IssueItem: React.FC<IssueItemProps> = ({ issue, compact = false }) => {
  if (compact) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l-4 ${
        issue.isNew ? 'border-yellow-400' : issue.state === 'open' ? 'border-green-500' : 'border-gray-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white truncate">
              <a 
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                #{issue.number} {issue.title}
              </a>
            </h3>
            
            <div className="flex flex-wrap gap-1 mt-1">
              {issue.labels.slice(0, 3).map(label => (
                <span 
                  key={label.id}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `#${label.color}15`,
                    color: `#${label.color}`,
                  }}
                >
                  {label.name}
                </span>
              ))}
              {issue.labels.length > 3 && (
                <span className="text-xs text-gray-500">+{issue.labels.length - 3}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center ml-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="whitespace-nowrap">{formatRelativeTime(issue.createdAt)}</span>
            {issue.isNew && (
              <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-1.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                NEW
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border-l-4 ${
      issue.isNew ? 'border-yellow-400' : issue.state === 'open' ? 'border-green-500' : 'border-gray-300'
    }`}>
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              <a 
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {issue.title}
              </a>
            </h3>
            
            {issue.isNew && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                NEW
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-2">
            {issue.labels.map(label => (
              <span 
                key={label.id}
                className="text-xs px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `#${label.color}25`,
                  color: `#${label.color}`,
                  border: `1px solid #${label.color}50`,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
          
          <div className="flex items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center mr-4">
              <span className="text-xs">
                {issue.repository.owner}/{issue.repository.name} #{issue.number}
              </span>
            </div>
            
            <div className="flex items-center mr-4">
              <FaClock className="mr-1 text-xs" />
              <span className="text-xs">{formatRelativeTime(issue.createdAt)}</span>
            </div>
            
            <a 
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors ml-auto text-xs"
            >
              <FaGithub className="mr-1" />
              <span>View Issue</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueItem; 