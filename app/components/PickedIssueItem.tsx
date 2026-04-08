'use client';

import React, { useState } from 'react';
import { PickedIssue } from '../types';
import { FaGithub, FaBookmark, FaTimes, FaTag, FaPlus } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PickedIssueItemProps {
  issue: PickedIssue;
  onUnpick: (issueId: string) => Promise<void>;
  onUpdateTags: (issueId: string, tags: string[]) => Promise<void>;
}

const PickedIssueItem: React.FC<PickedIssueItemProps> = ({
  issue,
  onUnpick,
  onUpdateTags,
}) => {
  const t = useTranslations();
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTag.trim();
    if (!tag || issue.userTags.includes(tag)) return;
    await onUpdateTags(issue.id, [...issue.userTags, tag]);
    setNewTag('');
    setShowTagInput(false);
  };

  const handleRemoveTag = async (tag: string) => {
    await onUpdateTags(
      issue.id,
      issue.userTags.filter(t => t !== tag),
    );
  };

  const repo = `${issue.repository.owner}/${issue.repository.name}`;

  return (
    <Card
      className={cn(
        'rounded-lg border-border p-4 hover:border-border/80 transition-colors border-l-2 gap-0',
        issue.lastKnownState === 'open'
          ? 'border-[color:var(--color-success)]'
          : 'border-[color:var(--color-danger)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground truncate">
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <span className="font-mono text-muted-foreground">#{issue.number}</span>{' '}
                {issue.title}
              </a>
            </h3>
            <Badge
              variant="outline"
              className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                issue.lastKnownState === 'open'
                  ? 'bg-[color:var(--color-success)]/10 text-[color:var(--color-success)] border-[color:var(--color-success)]/20'
                  : 'bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)] border-[color:var(--color-danger)]/20',
              )}
            >
              {issue.lastKnownState}
            </Badge>
            {issue.assignee && (
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                @{issue.assignee}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="font-mono">{repo}</span>
            <span>·</span>
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80"
            >
              <FaGithub className="text-[10px]" />
              {t('common.viewIssue')}
            </a>
          </div>

          {/* Labels */}
          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {issue.labels.slice(0, 4).map(label => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="text-xs px-1.5 py-0.5 rounded border-none"
                  style={{
                    backgroundColor: `#${label.color}15`,
                    color: `#${label.color}`,
                  }}
                >
                  {label.name}
                </Badge>
              ))}
              {issue.labels.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{issue.labels.length - 4}
                </span>
              )}
            </div>
          )}

          {/* User tags */}
          <div className="flex flex-wrap items-center gap-1 mt-2">
            {issue.userTags.map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border-primary/20"
              >
                <FaTag className="text-[8px] mr-1" />
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <FaTimes className="text-[8px]" />
                </button>
              </Badge>
            ))}
            {showTagInput ? (
              <form onSubmit={handleAddTag} className="inline-flex items-center gap-1">
                <Input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder={t('picked.tagPlaceholder')}
                  className="h-6 text-xs w-24 px-2"
                  autoFocus
                  onBlur={() => {
                    if (!newTag.trim()) setShowTagInput(false);
                  }}
                />
              </form>
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <FaPlus className="text-[8px]" />
                {t('picked.addTag')}
              </button>
            )}
          </div>
        </div>

        {/* Unsave button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUnpick(issue.id)}
          className="flex-shrink-0 text-primary hover:text-destructive"
          title={t('picked.unpick')}
        >
          <FaBookmark className="text-sm" />
        </Button>
      </div>
    </Card>
  );
};

export default PickedIssueItem;
