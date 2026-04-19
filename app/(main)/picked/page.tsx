'use client';

import { useState } from 'react';
import { FaBookmark, FaSync, FaRegBookmark } from 'react-icons/fa';
import BadgeGrid from '@/app/components/BadgeGrid';
import LoginPrompt from '@/app/components/LoginPrompt';
import PickedIssueItem from '@/app/components/PickedIssueItem';
import PrivacyToggle from '@/app/components/PrivacyToggle';
import {
  useAuth,
  useAppSettings,
  usePicked,
  useProfile,
} from '@/app/contexts/AppContext';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

export default function PickedPage() {
  const t = useTranslations();
  const { authState } = useAuth();
  const { settings, updateNotificationFrequency, toggleHideClosedIssues } =
    useAppSettings();
  const {
    pickedIssues,
    pickedIssuesLoading,
    unpickIssue,
    updateIssueTags,
    refreshPickedIssues,
  } = usePicked();
  const { profile, updatePrivacySettings } = useProfile();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPickedIssues();
    setRefreshing(false);
  };

  const visibleIssues = settings.hideClosedIssues
    ? pickedIssues.filter(s => s.lastKnownState === 'open')
    : pickedIssues;

  if (!authState.isLoggedIn) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FaBookmark className="text-primary" />
          {t('picked.title')}
        </h2>
        <LoginPrompt />
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <FaRegBookmark className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t('picked.guestTitle')}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {t('picked.guestDesc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FaBookmark className="text-primary" />
          {t('picked.title')}
          {pickedIssues.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({pickedIssues.length})
            </span>
          )}
        </h2>

        {pickedIssues.length > 0 && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || pickedIssuesLoading}
              className="text-xs"
            >
              <FaSync
                className={refreshing || pickedIssuesLoading ? 'animate-spin' : ''}
              />
              {t('picked.refresh')}
            </Button>
          </div>
        )}
      </div>

      {/* Options bar */}
      {pickedIssues.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              checked={settings.hideClosedIssues}
              onChange={e => toggleHideClosedIssues(e.target.checked)}
              className="rounded"
            />
            {t('picked.hideClosed')}
          </label>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{t('picked.notifyFrequency')}</span>
            <Select
              value={settings.notificationFrequency}
              onValueChange={v =>
                updateNotificationFrequency(v as 'hourly' | '6hours' | 'daily' | 'never')
              }
            >
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">{t('picked.frequency.hourly')}</SelectItem>
                <SelectItem value="6hours">{t('picked.frequency.6hours')}</SelectItem>
                <SelectItem value="daily">{t('picked.frequency.daily')}</SelectItem>
                <SelectItem value="never">{t('picked.frequency.never')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Privacy settings */}
      {profile !== null && (
        <PrivacyToggle
          isPublic={profile.is_public ?? false}
          onToggle={updatePrivacySettings}
        />
      )}

      {/* Badge progress */}
      <BadgeGrid userId={authState.userId} />

      {/* Issue list */}
      {pickedIssuesLoading && !refreshing ? (
        <div className="flex justify-center items-center p-8">
          <FaSync className="animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">{t('common.loading')}</span>
        </div>
      ) : visibleIssues.length === 0 ? (
        <div className="text-center bg-card border border-border rounded-lg p-8">
          <FaRegBookmark className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="mt-2 text-lg font-medium text-foreground">
            {t('picked.empty')}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{t('picked.emptyDesc')}</p>
          <Link href="/issues">
            <Button variant="outline" className="mt-4">
              {t('picked.browseIssues')}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleIssues.map(issue => (
            <PickedIssueItem
              key={issue.id}
              issue={issue}
              onUnpick={unpickIssue}
              onUpdateTags={updateIssueTags}
            />
          ))}
        </div>
      )}
    </div>
  );
}
