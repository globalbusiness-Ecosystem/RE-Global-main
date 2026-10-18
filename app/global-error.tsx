'use client';

import { useEffect } from 'react';
import { ErrorView } from '@/components/error-view';
import { reportClientError } from '@/lib/report-client-error';

// The last safety net: the root layout itself crashed, so this replaces the whole page.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { reportClientError('render', error); }, [error]);
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0a0a0a' }}>
        <ErrorView kind="error" reset={reset} />
      </body>
    </html>
  );
}
