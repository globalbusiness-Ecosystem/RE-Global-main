'use client';

import { useEffect } from 'react';
import { ErrorView } from '@/components/error-view';
import { reportClientError } from '@/lib/report-client-error';

// A page crashed while rendering: show a friendly screen (instead of a blank one) and tell the server.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { reportClientError('render', error); }, [error]);
  return <ErrorView kind="error" reset={reset} />;
}
