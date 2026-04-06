'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const tTabs = useTranslations('tabs');

  const tabs = [
    { name: 'issues' as const, path: '/issues' as const },
    { name: 'repositories' as const, path: '/repositories' as const },
    { name: 'settings' as const, path: '/settings' as const },
  ];

  return (
    <div className="mb-6">
      <div className="sm:hidden">
        <select
          value={pathname}
          onChange={e => {
            router.push(e.target.value as '/issues' | '/repositories' | '/settings');
          }}
          className="block w-full rounded-md bg-card border border-border text-foreground"
        >
          {tabs.map(tab => (
            <option key={tab.path} value={tab.path}>
              {tTabs(tab.name)}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <Tabs value={pathname}>
          <TabsList>
            {tabs.map(tab => (
              <TabsTrigger key={tab.path} value={tab.path} asChild>
                <Link
                  href={tab.path}
                  aria-current={pathname === tab.path ? 'page' : undefined}
                >
                  {tTabs(tab.name)}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
