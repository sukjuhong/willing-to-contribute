'use client';

import { useEffect, useRef } from 'react';
import { env } from '@/app/lib/env';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
}

function AdUnit({ adSlot, adFormat = 'auto', fullWidthResponsive = true }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded or ad blocker active
    }
  }, []);

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive}
    />
  );
}

interface AdSidebarProps {
  position: 'left' | 'right';
}

export default function AdSidebar({ position }: AdSidebarProps) {
  const adSlot = env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

  if (!adSlot) return null;

  const positionClass =
    position === 'left'
      ? 'left-0 xl:left-4 2xl:left-8'
      : 'right-0 xl:right-4 2xl:right-8';

  return (
    <aside
      className={`fixed top-1/3 hidden w-40 xl:w-44 2xl:w-52 xl:block ${positionClass}`}
    >
      <div className="rounded-lg bg-[#161b22] border border-gray-700 p-3">
        <p className="mb-2 text-center text-gray-600 text-xs">AD</p>
        <AdUnit adSlot={adSlot} />
      </div>
    </aside>
  );
}
