'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const tTabs = useTranslations('tabs');

  const tabs = [
    { name: 'issues' as const, path: '/issues' },
    { name: 'repositories' as const, path: '/repositories' },
    { name: 'settings' as const, path: '/settings' },
  ];

  return (
    <div className="mb-6">
      <div className="sm:hidden">
        <select
          value={pathname}
          onChange={e => {
            router.push(e.target.value);
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
