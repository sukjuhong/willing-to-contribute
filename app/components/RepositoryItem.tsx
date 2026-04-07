import React from 'react';
import { Repository } from '../types';
import { FaStar, FaTrash, FaGithub } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RepositoryItemProps {
  repository: Repository;
  onRemove: (id: string) => void;
}

const RepositoryItem: React.FC<RepositoryItemProps> = ({ repository, onRemove }) => {
  const t = useTranslations();

  return (
    <Card className="bg-card border-border p-4 hover:border-border/80 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-primary font-mono">
            {repository.owner}/{repository.name}
          </h3>

          {repository.description && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
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
              className="flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <FaGithub className="mr-1" />
              <span>{t('common.viewOnGithub')}</span>
            </a>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label={t('common.removeRepository', {
                repo: `${repository.owner}/${repository.name}`,
              })}
            >
              <FaTrash />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {repository.owner}/{repository.name}
              </AlertDialogTitle>
              <AlertDialogDescription>
                이 레포지토리를 삭제하시겠습니까? / Delete this repository?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => onRemove(repository.id)}
              >
                {t('settings.remove')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};

export default RepositoryItem;
