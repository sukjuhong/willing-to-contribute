import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { Database } from '@/app/types/supabase';

type UserBadgeRow = Database['public']['Tables']['user_badges']['Row'];

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
  metadata: Record<string, unknown>;
}

interface UseUserBadgesResult {
  earned: EarnedBadge[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Load badges granted to `userId`. Returns empty list when no userId is
 * provided so callers can render the locked state without conditional hooks.
 */
export default function useUserBadges(userId?: string): UseUserBadgesResult {
  const [earned, setEarned] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data, error: queryError } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at, metadata')
      .eq('user_id', uid)
      .order('earned_at', { ascending: true });

    if (queryError) {
      console.error('[useUserBadges] fetch failed:', queryError);
      throw queryError;
    }

    const rows = (data ?? []) as Pick<
      UserBadgeRow,
      'badge_id' | 'earned_at' | 'metadata'
    >[];
    return rows.map(
      (row): EarnedBadge => ({
        badgeId: row.badge_id,
        earnedAt: row.earned_at,
        metadata:
          row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
            ? (row.metadata as Record<string, unknown>)
            : {},
      }),
    );
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) {
      setEarned([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await fetchBadges(userId);
      setEarned(next);
    } catch {
      setError('Failed to load badges');
    } finally {
      setLoading(false);
    }
  }, [userId, fetchBadges]);

  useEffect(() => {
    if (!userId) {
      setEarned([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchBadges(userId)
      .then(rows => {
        if (!cancelled) setEarned(rows);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load badges');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, fetchBadges]);

  return { earned, loading, error, refresh };
}
