import { useEffect } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(err => {
          console.error('SW registration failed:', err);
        });
      } catch (error) {
        console.error('SW registration error:', error);
      }
    }
  }, []);
}
