'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    const queryString = params ? `?${params}` : '';
    router.replace(`/issues${queryString}`);
  }, [router, searchParams]);

  return null;
}
