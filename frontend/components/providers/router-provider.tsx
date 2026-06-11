'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { setGlobalRouter } from '@/lib/api/client';

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Set global router for API client navigation
    setGlobalRouter(router);
  }, [router]);

  return <>{children}</>;
}