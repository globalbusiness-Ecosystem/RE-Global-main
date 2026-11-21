'use client';
import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { authHeaders } from '@/lib/api-token';
import { cv } from '@/lib/contract-view-labels';

type Priv = { legalName: string; idNumber: string; phone: string; commitmentValid: boolean };

// The owner's private side of a contract. For anyone else (or when there is nothing private) the server answers 403/404 and this renders nothing,
// so the public verification page is unchanged. Details are fetched only when the owner taps "show".
export function ContractPrivateCard({ contractId, language }: { contractId: string; language: string }) {
  const [has, setHas] = useState(false);
  const [data, setData] = useState<Priv | null>(null);
  const [open, setOpen] = useState(false);
  const url = `/api/contracts/private?id=${encodeURIComponent(contractId)}`;

  useEffect(() => {
    let off = false;
    if (!contractId) return;
    fetch(url, { headers: authHeaders(), cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!off && j) { setHas(true); setData(j as Priv); } })
      .catch(() => {});
    return () => { off = true; };
  }, [contractId, url]);

  if (!has || !data) return null;
  const row = (label: string, value: string) => value ? <div className="flex justify-between gap-3 text-xs"><span className="text-muted-foreground">{label}</span><span className="font-mono text-foreground break-all" dir="ltr">{value}</span></div> : null;
  return (
    <div className="mx-6 mb-4 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground"><Lock className="w-3.5 h-3.5 text-accent" aria-hidden />{cv('privTitle', language)}</div>
      <p className="mt-1 text-[11px] text-muted-foreground">{cv('privNote', language)}</p>
      <button type="button" onClick={() => setOpen((v) => !v)} className="mt-2 rounded-full border border-accent/40 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/10 transition">
        {open ? cv('privHide', language) : cv('privShow', language)}
      </button>
      {open && (
        <div className="mt-3 space-y-1.5">
          {row(cv('privName', language), data.legalName)}
          {row(cv('privId', language), data.idNumber)}
          {row(cv('privPhone', language), data.phone)}
          <p className={`pt-1 text-[11px] ${data.commitmentValid ? 'text-emerald-400' : 'text-red-400'}`}>{data.commitmentValid ? cv('privMatch', language) : cv('privMismatch', language)}</p>
        </div>
      )}
    </div>
  );
}
