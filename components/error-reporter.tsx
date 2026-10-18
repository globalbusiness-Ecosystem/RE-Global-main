'use client';

import { useEffect } from 'react';
import { reportClientError } from '@/lib/report-client-error';

// Mounted once: reports errors that no component caught (script errors and rejected promises).
export function ErrorReporter() {
  useEffect(() => {
    const onError = (ev: ErrorEvent) => reportClientError('script', ev.error ?? ev.message);
    const onRejection = (ev: PromiseRejectionEvent) => reportClientError('promise', ev.reason);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  return null;
}
