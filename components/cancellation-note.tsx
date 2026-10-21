'use client';

import { useEffect, useState } from 'react';
import { cancelStrings, policyOf, policyText, type CancellationPolicy } from '@/lib/cancellation';

// The cancellation policy shown on a hotel / rental page, before the guest books.
export function CancellationNote({ language }: { language: string }) {
  const [policy, setPolicy] = useState<CancellationPolicy | null>(null);
  useEffect(() => {
    let alive = true;
    fetch('/api/bookings/policy')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d?.policy) setPolicy(policyOf(d.policy)); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  if (!policy) return null;
  return (
    <p className="rounded-md bg-white/5 p-2 text-xs text-gray-300">
      <span className="font-semibold text-white">{cancelStrings(language).policyTitle}: </span>
      {policyText(language, policy)}
    </p>
  );
}
