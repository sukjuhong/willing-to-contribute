import React, { useState } from 'react';
import { Issue, Repository } from '../types';
import IssueItem from './IssueItem';
import { FaChevronDown, FaChevronRight, FaExternalLinkAlt } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

interface RepositoryIssueListProps {
  repository: Repository;
  issues: Issue[];
}

const RepositoryIssueList: React.FC<RepositoryIssueListProps> = ({
  repository,
  issues,
}) => {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState(true);

  const newIssuesCount = issues.filter(issue => issue.isNew).length;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="mb-4">
      <Card className="bg-card rounded-lg border border-border overflow-hidden gap-0 py-0">
        {/* Repository header */}
        <div className="bg-accent border-l-2 border-cyan-500">
          <CollapsibleTrigger asChild>
            <button className="w-full p-3 flex items-center justify-between cursor-pointer">
              <div className="flex items-center">
                {isExpanded ? (
                  <FaChevronDown className="text-muted-foreground mr-2" />
                ) : (
                  <FaChevronRight className="text-muted-foreground mr-2" />
                )}
                <h3 className="font-medium text-foreground font-[family-name:var(--font-mono)]">
                  {repository.owner}/{repository.name}
                </h3>
                <span className="ml-2 text-xs bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded font-mono">
                  {issues.length} {t('common.issues')}
                </span>
                {newIssuesCount > 0 && (
                  <span className="ml-2 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                    {newIssuesCount} {t('common.new')}
                  </span>
                )}
              </div>

              <a
                href={`https://github.com/${repository.owner}/${repository.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center text-sm"
                onClick={e => e.stopPropagation()}
              >
                <FaExternalLinkAlt className="mr-1 text-xs" />
                <span className="text-xs">{t('common.viewRepo')}</span>
              </a>
            </button>
          </CollapsibleTrigger>
        </div>

        {/* Issues list */}
        <CollapsibleContent>
          <div className="divide-y divide-border/50">
            {issues.map(issue => (
              <div key={issue.id} className="px-2 py-1">
                <IssueItem issue={issue} compact={true} />
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default RepositoryIssueList;
