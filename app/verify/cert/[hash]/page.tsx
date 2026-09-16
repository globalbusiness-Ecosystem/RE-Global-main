'use client';

// Public, no-login certificate verification page for RE Inspect.
// Anyone with the link (bank, insurer, buyer) can check a Property Health
// Certificate here — no Pi wallet, no app account required. Two layers of
// proof are shown independently:
//   1. On-chain proof: the tx hash is checked live against Pi Testnet
//      (Stellar Horizon-compatible API) via verifyTransactionOnStellar.
//   2. Report proof: if the `inspections` Firestore record exists for this
//      hash, the full report (scores, AI summary, findings) is shown too.
// The two are deliberately independent: even if Firestore is unreachable
// or the record hasn't been created yet, the on-chain check still works,
// because the whole point of certifying on-chain is that verification
// doesn't depend on RE Global's own servers being up.

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Link2,
  ExternalLink,
  Droplets,
  Thermometer,
  HardHat,
  Bot,
} from 'lucide-react';
import { verifyTransactionOnStellar, type StellarVerificationResult } from '@/lib/stellar-verify';
import { healthScoreColor, healthScoreLabel, type PropertyInspection } from '@/lib/inspections';
import { useFirebaseDatabase } from '@/lib/firebase-database';

export default function VerifyCertificatePage() {
  const params = useParams();
  const hash = decodeURIComponent(String(params?.hash ?? ''));
  const db = useFirebaseDatabase();

  const [chainStatus, setChainStatus] = useState<'loading' | 'done'>('loading');
  const [chainResult, setChainResult] = useState<StellarVerificationResult | null>(null);
  const [reportStatus, setReportStatus] = useState<'loading' | 'done'>('loading');
  const [report, setReport] = useState<PropertyInspection | null>(null);

  useEffect(() => {
    if (!hash) return;
    verifyTransactionOnStellar(hash).then((r) => {
      setChainResult(r);
      setChainStatus('done');
    });
    db.getInspectionByCertHash(hash)
      .then((r: PropertyInspection | null) => setReport(r))
      .catch(() => setReport(null))
      .finally(() => setReportStatus('done'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

  const subScores = report
    ? ([
        { key: 'structural', icon: HardHat, label: 'Structural' },
        { key: 'moisture', icon: Droplets, label: 'Moisture' },
        { key: 'thermal', icon: Thermometer, label: 'Thermal' },
        { key: 'safety', icon: ShieldCheck, label: 'Safety' },
      ] as const)
    : [];

  return (
    <main className="w-full min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-accent/15 p-2 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-accent">RE Inspect — Certificate Verification</h1>
            <p className="text-xs text-muted-foreground">Public record · No login required</p>
          </div>
        </div>

        {/* Hash being checked */}
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-1">Certificate hash</p>
          <p className="text-sm font-mono break-all">{hash || '—'}</p>
        </div>

        {/* Layer 1: on-chain proof — always independent of Firestore */}
        <section className="bg-card border border-border rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-accent" />
            <h2 className="font-semibold text-sm">On-chain proof (Pi Testnet)</h2>
          </div>

          {chainStatus === 'loading' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking Pi Testnet directly…
            </div>
          )}

          {chainStatus === 'done' && chainResult?.found && (
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-emerald-500 font-medium">
                <ShieldCheck className="w-4 h-4" /> Verified on-chain
              </div>
              <p className="text-muted-foreground">Ledger: {chainResult.ledger}</p>
              <p className="text-muted-foreground">Timestamp: {chainResult.createdAt}</p>
              <p className="text-muted-foreground break-all">Source account: {chainResult.sourceAccount}</p>
              <a
                href={`https://api.testnet.minepi.com/transactions/${hash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-accent text-xs mt-2 hover:underline"
              >
                View raw transaction <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {chainStatus === 'done' && !chainResult?.found && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <ShieldAlert className="w-4 h-4" />
              {chainResult?.error || 'Not found on-chain — this hash may be invalid.'}
            </div>
          )}
        </section>

        {/* Layer 2: full report — only if the Firestore record exists yet */}
        <section className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-accent" />
            <h2 className="font-semibold text-sm">Inspection report</h2>
          </div>

          {reportStatus === 'loading' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading report…
            </div>
          )}

          {reportStatus === 'done' && !report && (
            <p className="text-sm text-muted-foreground">
              The on-chain hash is the permanent proof; the full readable report for this certificate isn't
              published yet.
            </p>
          )}

          {reportStatus === 'done' && report && (
            <div className="space-y-4">
              <div>
                <p className="font-medium text-sm">{report.propertyTitleEn}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: healthScoreColor(report.overallHealthScore) }}
                  >
                    {report.overallHealthScore}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      color: healthScoreColor(report.overallHealthScore),
                      backgroundColor: `${healthScoreColor(report.overallHealthScore)}20`,
                    }}
                  >
                    {healthScoreLabel(report.overallHealthScore, false)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {subScores.map(({ key, icon: Icon, label }) => (
                  <div key={key} className="flex items-center gap-2 text-xs bg-muted/40 rounded-lg px-2 py-1.5">
                    <Icon className="w-3.5 h-3.5 text-accent" />
                    <span className="text-muted-foreground">{label}</span>
                    <span className="ml-auto font-medium">{report.scores[key]}</span>
                  </div>
                ))}
              </div>

              {report.aiSummaryEn && (
                <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
                  {report.aiSummaryEn}
                </p>
              )}
            </div>
          )}
        </section>

        <p className="text-[11px] text-muted-foreground text-center mt-6">
          Powered by RE Global · Certified on Pi Testnet
        </p>
      </div>
    </main>
  );
}
