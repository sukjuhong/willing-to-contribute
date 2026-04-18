'use client';

import DailyDiscoveries from '@/app/components/DailyDiscoveries';
import RecommendedIssues from '@/app/components/RecommendedIssues';

export default function IssuesPage() {
  return (
    <div className="space-y-6">
      <DailyDiscoveries />
      <RecommendedIssues />
    </div>
  );
}
