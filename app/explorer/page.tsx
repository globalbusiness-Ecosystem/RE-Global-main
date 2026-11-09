'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { ex } from '@/lib/explorer-labels';
import { classifyQuery, type ChainTx } from '@/lib/explorer';

type Contract = { id: string; propertyTitle: string; type: string; contractHash: string; txid: string; signedAt: string | null; registry: { txid: string; entryId: number | null } | null };
type Result = { contract: Contract | null; tx: ChainTx | null; matches: boolean };

const HORIZON = 'https://api.testnet.minepi.com';

function Mono({ value, language }: { value: string; language: string }) {
  const [done, setDone] = useState(false);
  return (
    <span className="flex items-start gap-2">
      <code dir="ltr" className="min-w-0 flex-1 break-all text-[11px] text-gray-300">{value}</code>
      <button
        type="button"
        className="shrink-0 rounded border border-white/15 px-2 py-0.5 text-[11px] text-gray-300"
        onClick={async () => { try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200); } catch {} }}
      >{done ? ex('copied', language) : ex('copy', language)}</button>
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5 border-b border-white/10 py-2 last:border-0"><span className="text-[11px] text-gray-400">{label}</span><div className="text-sm text-white">{children}</div></div>;
}

// Public blockchain search: a transaction hash, a contract fingerprint or a contract number. No sign-in.
export default function ExplorerPage() {
  const { language } = useLanguage();
  const rtl = language === 'ar' || language === 'ur';
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<'invalid' | 'notFound' | 'failed' | null>(null);
  const [res, setRes] = useState<Result | null>(null);
  const [recent, setRecent] = useState<ChainTx[] | null>(null);

  const search = async (value: string) => {
    const { kind, q: clean } = classifyQuery(value);
    setRes(null);
    if (kind === 'invalid') { setErr('invalid'); return; }
    setErr(null); setBusy(true); setQ(clean);
    try {
      const r = await fetch(`/api/explorer?q=${encodeURIComponent(clean)}`, { cache: 'no-store' });
      if (r.status === 404) setErr('notFound');
      else if (!r.ok) setErr('failed');
      else setRes((await r.json()) as Result);
    } catch { setErr('failed'); } finally { setBusy(false); }
  };

  useEffect(() => {
    fetch('/api/explorer', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { recent: [] })).then((j) => setRecent(Array.isArray(j.recent) ? j.recent : [])).catch(() => setRecent([]));
    const first = new URLSearchParams(window.location.search).get('q');
    if (first) void search(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tx = res?.tx ?? null;
  const c = res?.contract ?? null;
  const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(language) : '-');

  return (
    <main dir={rtl ? 'rtl' : 'ltr'} className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-8 text-white md:max-w-2xl">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{ex('title', language)} <span className="text-xs font-normal text-yellow-500">· {ex('network', language)}</span></h1>
        <p className="text-sm text-gray-400">{ex('sub', language)}</p>
      </header>

      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void search(q); }}>
        <input
          value={q} onChange={(e) => setQ(e.target.value)} dir="ltr" inputMode="text" autoCapitalize="none" autoCorrect="off" spellCheck={false}
          placeholder={ex('placeholder', language)}
          aria-label={ex('placeholder', language)}
          className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-gray-500"
        />
        <button type="submit" disabled={busy} className="shrink-0 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-60">{busy ? ex('searching', language) : ex('search', language)}</button>
      </form>

      {err && <p role="alert" className="text-sm text-red-400">{ex(err === 'notFound' ? 'notFound' : err, language)}</p>}

      {tx && (
        <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
          <p className={`py-2 text-sm font-semibold ${tx.successful ? 'text-green-400' : 'text-red-400'}`}>{tx.successful ? '✓ ' + ex('confirmed', language) : ex('notConfirmed', language)}</p>
          <Row label={ex('hash', language)}><Mono value={tx.hash} language={language} /></Row>
          <Row label={ex('ledger', language)}>{tx.ledger ?? '-'}</Row>
          <Row label={ex('time', language)}>{when(tx.createdAt)}</Row>
          {tx.source && <Row label={ex('source', language)}><Mono value={tx.source} language={language} /></Row>}
          {tx.memoHex && <Row label={ex('fingerprint', language)}><Mono value={tx.memoHex} language={language} /></Row>}
          <Row label=""><a href={`${HORIZON}/transactions/${tx.hash}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 underline">{ex('openRaw', language)} ↗</a></Row>
        </section>
      )}

      {c && (
        <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
          <p className="py-2 text-sm font-semibold">{ex('contract', language)}</p>
          <Row label={ex('property', language)}>{c.propertyTitle || '-'} <span className="text-xs text-gray-400">({c.type})</span></Row>
          <Row label={ex('signed', language)}>{when(c.signedAt)}</Row>
          <Row label={ex('fingerprint', language)}><Mono value={c.contractHash} language={language} /></Row>
          {tx && res?.matches && <p className="py-2 text-sm text-green-400">✓ {ex('matches', language)}</p>}
          {!tx && <p className="py-2 text-sm text-yellow-500">{ex('notAnchored', language)}</p>}
          {c.registry && <Row label={ex('registry', language)}>✓ {ex('registryDone', language)}{c.registry.entryId != null ? ` #${c.registry.entryId}` : ''}</Row>}
          <Row label=""><Link href={`/verify/${c.id}`} className="text-xs text-blue-400 underline">{ex('openContract', language)} ↗</Link></Row>
        </section>
      )}

      {!res && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-gray-300">{ex('recent', language)}</h2>
          {recent && recent.length === 0 && <p className="text-xs text-gray-500">{ex('recentEmpty', language)}</p>}
          {recent?.map((t) => (
            <button key={t.hash} type="button" onClick={() => void search(t.hash)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-start">
              <code dir="ltr" className="block truncate text-[11px] text-gray-300">{t.hash}</code>
              <span className="text-[11px] text-gray-500">{when(t.createdAt)} · {ex('ledger', language)} {t.ledger ?? '-'}</span>
            </button>
          ))}
        </section>
      )}

      <Link href="/" className="mt-2 text-center text-sm text-gray-400 underline">{ex('home', language)}</Link>
    </main>
  );
}
