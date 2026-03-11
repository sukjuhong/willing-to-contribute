'use client';

import { useEffect, useRef } from 'react';

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
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive}
    />
  );
}

export default function AdSidebar() {
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

  if (!adSlot) return null;

  return (
    <aside className="hidden lg:block lg:col-span-1">
      <div className="sticky top-8 space-y-6">
        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <p className="mb-2 text-center text-xs text-gray-400 dark:text-gray-500">AD</p>
          <AdUnit adSlot={adSlot} />
        </div>
      </div>
    </aside>
  );
}
