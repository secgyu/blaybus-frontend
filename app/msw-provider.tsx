'use client';

import { type ReactNode, useEffect, useState } from 'react';

interface MSWProviderProps {
  children: ReactNode;
}

export function MSWProvider({ children }: MSWProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initMSW() {
      if (
        typeof window !== 'undefined' &&
        process.env.NODE_ENV === 'development'
      ) {
        try {
          const { worker } = await import('@/mocks/browser');
          await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
              url: '/mockServiceWorker.js',
            },
          });
          console.log('[MSW] Mock Service Worker started');
        } catch (error) {
          console.warn('[MSW] Failed to start Mock Service Worker:', error);
        }
      }
      setIsReady(true);
    }

    initMSW();
  }, []);

  // Show nothing until MSW is ready in development
  if (!isReady && process.env.NODE_ENV === 'development') {
    return null;
  }

  return <>{children}</>;
}
