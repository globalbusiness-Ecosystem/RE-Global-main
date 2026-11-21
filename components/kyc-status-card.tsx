'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { authHeaders } from '@/lib/api-token';
import { kl } from '@/lib/kyc-labels';

type Me = { required: boolean; status: 'none' | 'pending' | 'approved' | 'rejected'; rejectReason?: string | null };

// Where the person sees the result of their identity check (Pi and web accounts alike) and goes to start or fix it.
export function KycStatusCard({ language }: { language: string }) {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    let off = false;
    fetch('/api/kyc/me', { headers: authHeaders(), cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!off && j && typeof j.status === 'string') setMe(j as Me); })
      .catch(() => {});
    return () => { off = true; };
  }, []);
  if (!me) return null;
  const text = me.status === 'approved' ? kl('approved', language)
    : me.status === 'pending' ? kl('pending', language)
    : me.status === 'rejected' ? kl('rejected', language, { reason: me.rejectReason ?? '' })
    : kl('intro', language);
  const action = me.status === 'none' || me.status === 'rejected';
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><BadgeCheck className="w-4 h-4 text-accent" aria-hidden />{kl('title', language)}</div>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
      {action && <Link href="/kyc" className="mt-3 inline-block rounded-full border border-accent/40 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/10 transition">{kl('verifyCta', language)}</Link>}
      {!action && <Link href="/kyc" className="mt-3 inline-block text-xs text-muted-foreground underline">{kl('title', language)}</Link>}
    </div>
  );
}
