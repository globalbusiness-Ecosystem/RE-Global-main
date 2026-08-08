#!/usr/bin/env python3
"""Run from the repo root: python3 apply_all.py"""
import os

def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()

def write(p, c):
    with open(p, "w", encoding="utf-8") as f:
        f.write(c)

SIMULATION_SCENE = """'use client';

// Real, per-property animated simulation of how RE Inspect physically works —
// not static icons. Takes the property's own title so it reads correctly for
// whichever listing is being inspected. Pure SVG/CSS motion, no external
// images (keeps it fast and avoids photo licensing entirely).
//
// Sequence (loops): exterior drone scan -> interior robot scan -> AI analysis
// -> on-chain certification. Each stage highlights its own icon + caption so
// it doubles as a legend, not just decoration.

import { useEffect, useState } from 'react';
import { Plane, Bot as RobotIcon, Sparkles, Link2 } from 'lucide-react';

interface InspectionSimulationSceneProps {
  propertyTitleEn: string;
  propertyTitleAr: string;
  isArabic: boolean;
}

const STAGES = [
  { key: 'exterior', icon: Plane, labelEn: 'Drone — exterior scan', labelAr: 'الدرون — مسح خارجي' },
  { key: 'interior', icon: RobotIcon, labelEn: 'Robot — interior scan', labelAr: 'الروبوت — مسح داخلي' },
  { key: 'analysis', icon: Sparkles, labelEn: 'Aladdin AI — analyzing', labelAr: 'علاء الدين — تحليل' },
  { key: 'certify', icon: Link2, labelEn: 'Certifying on-chain', labelAr: 'توثيق على البلوكتشين' },
] as const;

const STAGE_MS = 3200;

export default function InspectionSimulationScene({
  propertyTitleEn,
  propertyTitleAr,
  isArabic,
}: InspectionSimulationSceneProps) {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStageIdx((i) => (i + 1) % STAGES.length);
    }, STAGE_MS);
    return () => clearInterval(t);
  }, []);

  const stage = STAGES[stageIdx].key;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 pt-5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">
          {isArabic ? 'محاكاة حية' : 'Live simulation'}
        </p>
        <p className="text-sm font-medium text-foreground">
          {isArabic ? propertyTitleAr : propertyTitleEn}
        </p>
      </div>

      {/* Scene */}
      <div className="relative mt-3 h-[220px] bg-background/60">
        <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Ground */}
          <line x1="0" y1="196" x2="400" y2="196" stroke="hsl(var(--border))" strokeWidth="1" />

          {/* Building */}
          <rect x="140" y="60" width="120" height="136" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
          {/* Floor lines */}
          <line x1="140" y1="94" x2="260" y2="94" stroke="hsl(var(--border))" strokeWidth="1" />
          <line x1="140" y1="128" x2="260" y2="128" stroke="hsl(var(--border))" strokeWidth="1" />
          <line x1="140" y1="162" x2="260" y2="162" stroke="hsl(var(--border))" strokeWidth="1" />
          {/* Room dividers */}
          <line x1="200" y1="60" x2="200" y2="196" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.6" />

          {/* Drone orbit path (dotted) */}
          <ellipse
            cx="200"
            cy="128"
            rx="112"
            ry="66"
            fill="none"
            stroke="hsl(var(--border))"
            strokeDasharray="2 5"
            strokeWidth="1"
            opacity={stage === 'exterior' ? 0.9 : 0.25}
          />

          {/* Drone + scan beam, active during exterior stage */}
          {stage === 'exterior' && (
            <g>
              <circle r="5" fill="#c9974d">
                <animateMotion
                  dur="3.2s"
                  repeatCount="1"
                  path="M 312,128 A 112,66 0 1,1 88,128 A 112,66 0 1,1 312,128"
                />
              </circle>
              <line x1="200" y1="10" x2="200" y2="60" stroke="#c9974d" strokeWidth="1" opacity="0.5">
                <animate attributeName="opacity" values="0.15;0.6;0.15" dur="1.4s" repeatCount="indefinite" />
              </line>
            </g>
          )}

          {/* Ground robot, active during interior stage — sweeps room by room */}
          {stage === 'interior' && (
            <g>
              <rect width="8" height="8" x="-4" y="-4" fill="#3ddc97" rx="1.5">
                <animateMotion
                  dur="3s"
                  repeatCount="1"
                  keyPoints="0;0.5;0.5;1"
                  keyTimes="0;0.45;0.55;1"
                  calcMode="linear"
                  path="M 155,178 L 245,178 L 245,110 L 155,110"
                />
              </rect>
            </g>
          )}

          {/* AI analysis pulse over the whole building */}
          {stage === 'analysis' && (
            <rect x="140" y="60" width="120" height="136" fill="#c9974d" opacity="0.06">
              <animate attributeName="opacity" values="0.02;0.14;0.02" dur="1.6s" repeatCount="indefinite" />
            </rect>
          )}

          {/* Certification glow */}
          {stage === 'certify' && (
            <rect
              x="138"
              y="58"
              width="124"
              height="140"
              fill="none"
              stroke="#3ddc97"
              strokeWidth="1.5"
              rx="2"
              opacity="0.7"
            >
              <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.2s" repeatCount="indefinite" />
            </rect>
          )}
        </svg>

        {/* Stage caption */}
        <div className="absolute left-3 bottom-3 flex items-center gap-2 bg-background/80 backdrop-blur px-2.5 py-1.5 rounded-lg border border-border">
          {(() => {
            const Icon = STAGES[stageIdx].icon;
            return <Icon className="w-3.5 h-3.5 text-accent" />;
          })()}
          <span className="text-[11px] text-foreground">
            {isArabic ? STAGES[stageIdx].labelAr : STAGES[stageIdx].labelEn}
          </span>
        </div>
      </div>

      {/* Stage legend / scrubber */}
      <div className="grid grid-cols-4 border-t border-border">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const active = i === stageIdx;
          return (
            <button
              key={s.key}
              onClick={() => setStageIdx(i)}
              className={`flex flex-col items-center gap-1 py-3 transition-colors ${
                active ? 'text-accent bg-accent/5' : 'text-muted-foreground'
              } ${i !== 0 ? 'border-l border-border' : ''}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] leading-tight text-center px-1">
                {isArabic ? s.labelAr : s.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
"""

VERIFY_PAGE = """'use client';

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
"""

# --- 1. delete the one-off patch script + orphan standalone /inspections route ---
for p in ["3-patch-page-and-home.py", "app/inspections/page.tsx"]:
    if os.path.exists(p):
        os.remove(p)
        print(f"✔ removed {p}")
try:
    os.rmdir("app/inspections")
    print("✔ removed empty app/inspections/")
except OSError:
    pass

# --- 2. app/page.tsx: collapse 3 duplicate 'retoken' case blocks into 1 ---
path = "app/page.tsx"
c = read(path)
dup3 = """      case 'retoken':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <RETokenPage language={language} onBack={() => handlePageChange('home')} onNavigate={handlePageChange} />
          </div>
        );
      case 'retoken':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <RETokenPage language={language} onBack={() => handlePageChange('home')} onNavigate={handlePageChange} />
          </div>
        );
      case 'retoken':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <RETokenPage language={language} onBack={() => handlePageChange('home')} onNavigate={handlePageChange} />
          </div>
        );"""
single = """      case 'retoken':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <RETokenPage language={language} onBack={() => handlePageChange('home')} onNavigate={handlePageChange} />
          </div>
        );"""
if dup3 in c:
    c = c.replace(dup3, single, 1)
    write(path, c)
    print("✔ app/page.tsx: deduplicated retoken cases")
elif single in c and c.count(single) == 1:
    print("• app/page.tsx: already clean, skipped")
else:
    print("⚠ app/page.tsx: anchor not found — check manually")

# --- 3. lib/firebase-database.ts: add getInspectionByCertHash (class method) ---
path = "lib/firebase-database.ts"
c = read(path)
anchor_method = """  // User Profile
  async getProfile(username: string): Promise<UserProfile | null> {"""
new_method = """  // Inspections (RE Inspect public certificates)
  async getInspectionByCertHash(certHash: string): Promise<import('./inspections').PropertyInspection | null> {
    try {
      const q = query(collection(db, 'inspections'), where('blockchainCertHash', '==', certHash));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as import('./inspections').PropertyInspection;
    } catch (error) {
      console.error('[DB] Get inspection by cert hash error:', error);
      return null;
    }
  }

  // User Profile
  async getProfile(username: string): Promise<UserProfile | null> {"""
if "getInspectionByCertHash" in c:
    print("• firebase-database.ts: method already present, skipped")
elif anchor_method in c:
    c = c.replace(anchor_method, new_method, 1)
    write(path, c)
    print("✔ firebase-database.ts: added getInspectionByCertHash method")
else:
    print("⚠ firebase-database.ts: method anchor not found — check manually")

# --- 4. lib/firebase-database.ts: expose it on the useFirebaseDatabase() wrapper ---
c = read(path)
anchor_wrap = """    // User Profile
    getProfile: (username: string) => firebaseDB.getProfile(username),"""
new_wrap = """    // Inspections (RE Inspect public certificates)
    getInspectionByCertHash: (certHash: string) => firebaseDB.getInspectionByCertHash(certHash),

    // User Profile
    getProfile: (username: string) => firebaseDB.getProfile(username),"""
if "getInspectionByCertHash:" in c:
    print("• firebase-database.ts: wrapper already present, skipped")
elif anchor_wrap in c:
    c = c.replace(anchor_wrap, new_wrap, 1)
    write(path, c)
    print("✔ firebase-database.ts: exposed getInspectionByCertHash on wrapper")
else:
    print("⚠ firebase-database.ts: wrapper anchor not found — check manually")

# --- 5. components/pages/inspections-page.tsx: import the simulation scene ---
path = "components/pages/inspections-page.tsx"
c = read(path)
anchor_imp = "import { verifyTransactionOnStellar, type StellarVerificationResult } from '@/lib/stellar-verify';"
new_imp = anchor_imp + "\nimport InspectionSimulationScene from '@/components/InspectionSimulationScene';"
if "InspectionSimulationScene" in c:
    print("• inspections-page.tsx: import already present, skipped")
elif anchor_imp in c:
    c = c.replace(anchor_imp, new_imp, 1)
    write(path, c)
    print("✔ inspections-page.tsx: added InspectionSimulationScene import")
else:
    print("⚠ inspections-page.tsx: import anchor not found — check manually")

# --- 6. components/pages/inspections-page.tsx: render it above the score hero ---
c = read(path)
anchor_hero = """      <div className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto space-y-8">
        {/* Hero: live health score demo */}
        <section className="bg-card border border-border rounded-2xl p-6">"""
new_hero = """      <div className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto space-y-8">
        {/* How the scan actually happens — per-property drone + robot simulation */}
        <InspectionSimulationScene
          propertyTitleEn={demo.propertyTitleEn}
          propertyTitleAr={demo.propertyTitleAr}
          isArabic={isArabic}
        />

        {/* Hero: live health score demo */}
        <section className="bg-card border border-border rounded-2xl p-6">"""
if "propertyTitleEn={demo.propertyTitleEn}" in c:
    print("• inspections-page.tsx: simulation scene already wired, skipped")
elif anchor_hero in c:
    c = c.replace(anchor_hero, new_hero, 1)
    write(path, c)
    print("✔ inspections-page.tsx: wired simulation scene above score hero")
else:
    print("⚠ inspections-page.tsx: hero anchor not found — check manually")

# --- 7. components/pages/inspections-page.tsx: public-verify note in the AI summary card ---
c = read(path)
anchor_ai = """          <div className="mt-5 bg-accent/5 border border-accent/20 rounded-xl p-3.5 flex gap-2.5">
            <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isArabic ? demo.aiSummaryAr : demo.aiSummaryEn}
              <span className="block mt-1 text-accent/80 font-medium">
                {isArabic ? '— بواسطة علاء الدين (Aladdin AI)' : '— by Aladdin AI'}
              </span>
            </p>
          </div>
        </section>"""
new_ai = """          <div className="mt-5 bg-accent/5 border border-accent/20 rounded-xl p-3.5 flex gap-2.5">
            <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isArabic ? demo.aiSummaryAr : demo.aiSummaryEn}
              <span className="block mt-1 text-accent/80 font-medium">
                {isArabic ? '— بواسطة علاء الدين (Aladdin AI)' : '— by Aladdin AI'}
              </span>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 text-xs bg-muted/30 rounded-lg px-3 py-2.5">
            <span className="text-muted-foreground">
              {isArabic
                ? 'أي شهادة معتمدة قابلة للتحقق علنًا — بدون حساب أو تسجيل دخول'
                : 'Every certified report is publicly verifiable — no account or login needed'}
            </span>
            <a
              href="/verify/demo-cert-hash"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 flex items-center gap-1 text-accent font-medium hover:underline"
            >
              {isArabic ? 'مثال' : 'Example'}
              <ChevronRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
            </a>
          </div>
        </section>"""
if 'href="/verify/demo-cert-hash"' in c:
    print("• inspections-page.tsx: public-verify note already present, skipped")
elif anchor_ai in c:
    c = c.replace(anchor_ai, new_ai, 1)
    write(path, c)
    print("✔ inspections-page.tsx: added public-verify note")
else:
    print("⚠ inspections-page.tsx: AI-summary anchor not found — check manually")

# --- 8. new file: components/InspectionSimulationScene.tsx ---
os.makedirs("components", exist_ok=True)
path = "components/InspectionSimulationScene.tsx"
if os.path.exists(path):
    print(f"• {path} already exists, skipped")
else:
    write(path, SIMULATION_SCENE)
    print(f"✔ created {path}")

# --- 9. new file: app/verify/[hash]/page.tsx ---
os.makedirs("app/verify/[hash]", exist_ok=True)
path = "app/verify/[hash]/page.tsx"
if os.path.exists(path):
    print(f"• {path} already exists, skipped")
else:
    write(path, VERIFY_PAGE)
    print(f"✔ created {path}")

print("\nDone. Now run: pnpm install && pnpm build")
