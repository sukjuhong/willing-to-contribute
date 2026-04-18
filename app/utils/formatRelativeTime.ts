import type { useTranslations } from 'next-intl';

type CommonTranslator = ReturnType<typeof useTranslations<'common'>>;

export const formatRelativeTime = (
  date: string | Date | null | undefined,
  tCommon: CommonTranslator,
  locale: string = 'en',
): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const time = d.getTime();
  if (isNaN(time)) return '';

  const diffMs = Date.now() - time;
  if (diffMs < 0) return tCommon('justNow');

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return tCommon('justNow');
  if (diffHours < 1) return tCommon('minutesAgo', { minutes: diffMins });
  if (diffDays < 1) return tCommon('hoursAgo', { hours: diffHours });
  if (diffDays < 30) return tCommon('daysAgo', { days: diffDays });
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(d);
};
