'use client';

import { useMemo, useState } from 'react';
import {
  ScanLine,
  Bot,
  ShieldCheck,
  ShieldAlert,
  Droplets,
  Thermometer,
  HardHat,
  Link2,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  DEMO_INSPECTION,
  INSPECTION_STEPS,
  healthScoreColor,
  healthScoreLabel,
  type InspectionSubScore,
} from '@/lib/inspections';
import { verifyTransactionOnStellar, type StellarVerificationResult } from '@/lib/stellar-verify';
import InspectionSimulationScene from '@/components/InspectionSimulationScene';

interface InspectionsPageProps {
  language: 'en' | 'ar';
  onBack?: () => void;
  onNavigate?: (pageId: string) => void;
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {}
      }}
      className="shrink-0 p-1 rounded hover:bg-white/10"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
}

function HealthGauge({ score, isArabic }: { score: number; isArabic: boolean }) {
  const color = healthScoreColor(score);
  const label = healthScoreLabel(score, isArabic);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      {/* scan sweep overlay, clipped to the circle */}
      <div className="absolute inset-2 rounded-full overflow-hidden pointer-events-none">
        <div
          className="absolute left-0 right-0 h-8 animate-scan-sweep"
          style={{ background: `linear-gradient(to bottom, transparent, ${color}33, transparent)` }}
        />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[11px] text-muted-foreground mt-1">{isArabic ? 'مؤشر صحة العقار' : 'Health Score'}</span>
        <span className="text-xs font-medium mt-0.5" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

function SubScoreRow({
  icon: Icon,
  labelEn,
  labelAr,
  value,
  isArabic,
}: {
  icon: any;
  labelEn: string;
  labelAr: string;
  value: number;
  isArabic: boolean;
}) {
  const color = healthScoreColor(value);
  return (
    <div className="flex items-center gap-3">
      <div className="bg-accent/10 p-2 rounded-lg shrink-0">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-foreground">{isArabic ? labelAr : labelEn}</span>
          <span className="text-sm font-semibold" style={{ color }}>{value}</span>
        </div>
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

export default function InspectionsPage({ language, onBack, onNavigate }: InspectionsPageProps) {
  const isArabic = language === 'ar';
  const demo = DEMO_INSPECTION;

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const [certInput, setCertInput] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [verifyResult, setVerifyResult] = useState<StellarVerificationResult | null>(null);

  const subScores: { key: keyof InspectionSubScore; icon: any; labelEn: string; labelAr: string }[] = useMemo(
    () => [
      { key: 'structural', icon: HardHat, labelEn: 'Structural', labelAr: 'الإنشائي' },
      { key: 'moisture', icon: Droplets, labelEn: 'Moisture', labelAr: 'الرطوبة' },
      { key: 'thermal', icon: Thermometer, labelEn: 'Thermal', labelAr: 'الحراري' },
      { key: 'safety', icon: ShieldCheck, labelEn: 'Safety', labelAr: 'السلامة' },
    ],
    []
  );

  const handleVerify = async () => {
    if (!certInput.trim()) return;
    setVerifyStatus('loading');
    const result = await verifyTransactionOnStellar(certInput.trim());
    setVerifyResult(result);
    setVerifyStatus('done');
  };

  const handleSendRequest = () => {
    // TODO backend wiring: POST to re-global-v2 once the inspections route exists.
    // For now this confirms the request locally so the flow can be reviewed end-to-end.
    console.log('[RE Inspect] Inspection requested', { note: requestNote });
    setRequestSent(true);
  };

  return (
    <main className="w-full min-h-screen bg-background pb-24" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto flex items-center gap-2">
          <div className="bg-accent/15 p-2 rounded-lg">
            <ScanLine className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-accent">RE Inspect</h1>
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'فحص العقارات بالروبوت والدرون، بشهادة موثقة على البلوكتشين' : 'Robotic property inspection, certified on-chain'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto space-y-8">
        {/* How the scan actually happens — per-property drone + robot simulation */}
        <InspectionSimulationScene
          propertyTitleEn={demo.propertyTitleEn}
          propertyTitleAr={demo.propertyTitleAr}
          isArabic={isArabic}
        />

        {/* Hero: live health score demo */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Bot className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {isArabic ? 'نموذج حي' : 'Live Demo'}
            </span>
          </div>
          <p className="text-center text-sm font-medium text-foreground mb-4">
            {isArabic ? demo.propertyTitleAr : demo.propertyTitleEn}
          </p>

          <HealthGauge score={demo.overallHealthScore} isArabic={isArabic} />

          <div className="mt-6 space-y-4">
            {subScores.map((s) => (
              <SubScoreRow
                key={s.key}
                icon={s.icon}
                labelEn={s.labelEn}
                labelAr={s.labelAr}
                value={demo.scores[s.key]}
                isArabic={isArabic}
              />
            ))}
          </div>

          <div className="mt-5 bg-accent/5 border border-accent/20 rounded-xl p-3.5 flex gap-2.5">
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
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            {isArabic ? 'كيف يعمل الفحص' : 'How the inspection works'}
          </h2>
          <div className="space-y-2">
            {INSPECTION_STEPS.map((step) => (
              <div key={step.id} className="flex gap-3 bg-card border border-border rounded-lg p-3.5">
                <div className="w-7 h-7 rounded-full bg-accent/15 text-accent text-sm font-semibold flex items-center justify-center shrink-0">
                  {step.id}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{isArabic ? step.titleAr : step.titleEn}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {isArabic ? step.descAr : step.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Inspection-to-Value */}
        <section className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-accent" />
            <h2 className="text-base font-semibold text-foreground">
              {isArabic ? 'من الفحص إلى القيمة' : 'Inspection-to-Value'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isArabic
              ? 'مؤشر صحة العقار لا يبقى في تقرير — هو يتغذى مباشرة في تسعير $RE Token الخاص بالعقار. تحسّن أو تراجع في الفحص الدوري يظهر كتنبيه فوري لحاملي التوكن عبر نظام التنبيهات الذكية.'
              : "The Health Score doesn't stay in a report — it feeds directly into that property's $RE Token pricing. A change in a follow-up inspection triggers an instant alert to token holders through the smart alerts system."}
          </p>
          <button
            onClick={() => onNavigate?.('re-token')}
            className="mt-3 flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            {isArabic ? 'عرض RE Token' : 'View RE Token'}
            <ChevronRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
          </button>
        </section>

        {/* On-chain certificate verification */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            {isArabic ? 'التحقق من الشهادة على البلوكتشين' : 'Verify an on-chain certificate'}
          </h2>
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isArabic
                ? 'كل تقرير فحص معتمد يُسجَّل كمعاملة على Pi Testnet — أدخل رقم المعاملة (hash) لأي شهادة للتحقق منها مباشرة من الشبكة، بشكل مستقل تمامًا عن قاعدة بياناتنا.'
                : "Every certified inspection is recorded as a transaction on Pi Testnet — enter a certificate's transaction hash to verify it directly from the network, independent of our database."}
            </p>
            <div className="flex gap-2">
              <input
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                placeholder={isArabic ? 'رقم معاملة الشهادة (txid)' : 'Certificate transaction hash (txid)'}
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                onClick={handleVerify}
                disabled={verifyStatus === 'loading' || !certInput.trim()}
                className="bg-accent text-accent-foreground text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50 flex items-center gap-1.5"
              >
                {verifyStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : (isArabic ? 'تحقق' : 'Verify')}
              </button>
            </div>

            {verifyStatus === 'done' && verifyResult && (
              <div
                className={`rounded-md p-3 text-xs flex items-start gap-2 ${
                  verifyResult.found ? 'bg-green-500/10 border border-green-500/30' : 'bg-destructive/10 border border-destructive/30'
                }`}
              >
                {verifyResult.found ? (
                  <ShieldCheck className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  {verifyResult.found ? (
                    <>
                      <p className="text-green-400 font-medium">
                        {isArabic ? 'تم التحقق على الشبكة' : 'Verified on-chain'}
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        {isArabic ? 'الليدجر' : 'Ledger'}: {verifyResult.ledger} · {verifyResult.createdAt}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-muted-foreground truncate">{verifyResult.sourceAccount}</span>
                        {verifyResult.sourceAccount && <CopyBtn value={verifyResult.sourceAccount} />}
                      </div>
                    </>
                  ) : (
                    <p className="text-destructive">{verifyResult.error || (isArabic ? 'لم يتم العثور على المعاملة' : 'Transaction not found')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Request CTA */}
        <section className="bg-card border border-border rounded-2xl p-5">
          {!requestOpen ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isArabic ? 'اطلب فحصًا معتمدًا' : 'Request a certified inspection'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isArabic ? 'متاح حاليًا في المدن التجريبية' : 'Currently available in pilot cities'}
                </p>
              </div>
              <button
                onClick={() => setRequestOpen(true)}
                className="bg-accent text-accent-foreground text-sm font-medium px-4 py-2.5 rounded-md shrink-0"
              >
                {isArabic ? 'اطلب الآن' : 'Request'}
              </button>
            </div>
          ) : requestSent ? (
            <div className="flex items-center gap-2.5 text-green-400">
              <Check className="w-5 h-5" />
              <p className="text-sm font-medium">
                {isArabic ? 'تم استلام طلبك — سيتواصل معك فريق العمليات لتحديد الموعد.' : "Request received — our operations team will reach out to schedule it."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                {isArabic ? 'تفاصيل الطلب' : 'Request details'}
              </p>
              <textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                placeholder={isArabic ? 'اسم العقار أو رابطه، والموعد المفضل...' : 'Property name or link, and preferred timing...'}
                rows={3}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSendRequest}
                  className="flex-1 bg-accent text-accent-foreground text-sm font-medium py-2.5 rounded-md"
                >
                  {isArabic ? 'إرسال الطلب' : 'Send request'}
                </button>
                <button
                  onClick={() => setRequestOpen(false)}
                  className="px-4 text-sm font-medium text-muted-foreground border border-border rounded-md"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
