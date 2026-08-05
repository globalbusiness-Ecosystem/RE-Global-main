'use client';

import { useState } from 'react';
import { Coins, TrendingUp, ShoppingCart, Zap, Users, Link2, Loader2, ShieldCheck, ShieldAlert, Copy, Check } from 'lucide-react';
import { verifyTransactionOnStellar, type StellarVerificationResult } from '@/lib/stellar-verify';

interface RETokenPageProps {
  language: 'en' | 'ar';
  onBack?: () => void;
  onNavigate?: (pageId: string) => void;
}

const RE_TOKEN_CONTRACT = 'CBSNKBKIAUWS7XIC7M4AMY5273XH6OV757XOH32HCNSC6VQP4DG6VROY';

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

export default function RETokenPage({ language, onBack, onNavigate }: RETokenPageProps) {
  const isArabic = language === 'ar';
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [verifyResult, setVerifyResult] = useState<StellarVerificationResult | null>(null);

  const earnActions = [
    { labelEn: 'Buy Properties', labelAr: 'شراء العقارات', icon: ShoppingCart, pageId: 'buy' },
    { labelEn: 'Invest in Tokenized Assets', labelAr: 'الاستثمار في الأصول الرمزية', icon: TrendingUp, pageId: 'tokenized' },
    { labelEn: 'Refer Friends', labelAr: 'اطلب من الأصدقاء', icon: Users, pageId: 'partners' },
  ];

  return (
    <main className="w-full min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto flex items-center gap-2">
          <Coins className="w-6 h-6 text-accent" />
          <div>
            <h1 className="text-2xl font-bold text-accent">RE Token</h1>
            <p className="text-sm text-muted-foreground">{isArabic ? 'عملة المنصة' : "The platform's currency"}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{isArabic ? 'سعر الرمز' : 'Token Price'}</p>
            <p className="text-xl font-bold text-accent">1 $RE = 0.01π</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{isArabic ? 'الإمداد الكلي' : 'Total Supply'}</p>
            <p className="text-xl font-bold text-accent">100M $RE</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            {isArabic ? 'كيفية الكسب' : 'How to Earn'}
          </h2>
          <div className="space-y-2">
            {earnActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.pageId}
                  onClick={() => onNavigate?.(action.pageId)}
                  className="w-full flex items-center gap-3 bg-card border border-border hover:border-accent/50 rounded-lg p-3.5 transition text-left"
                >
                  <div className="bg-accent/15 p-2 rounded-lg">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium flex-1">
                    {isArabic ? action.labelAr : action.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            {isArabic ? 'العقد على البلوكشين' : 'On-Chain Contract'}
          </h2>
          <div className="flex items-center gap-1.5 bg-background/60 rounded px-2 py-2">
            <code className="text-[11px] text-muted-foreground break-all flex-1">{RE_TOKEN_CONTRACT}</code>
            <CopyBtn value={RE_TOKEN_CONTRACT} />
          </div>
          <p className="text-xs text-muted-foreground">Pi Testnet</p>

          {verifyStatus === 'idle' && (
            <button
              onClick={async () => {
                setVerifyStatus('loading');
                const r = await verifyTransactionOnStellar(RE_TOKEN_CONTRACT);
                setVerifyResult(r);
                setVerifyStatus('done');
              }}
              className="flex items-center gap-1.5 text-xs text-accent underline"
            >
              <Link2 className="w-3 h-3" />
              {isArabic ? 'تحقق على Stellar' : 'Verify on Stellar'}
            </button>
          )}
          {verifyStatus === 'loading' && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              {isArabic ? 'جاري التحقق...' : 'Verifying...'}
            </span>
          )}
          {verifyStatus === 'done' && verifyResult?.found && verifyResult.successful && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <ShieldCheck className="w-3 h-3" />
              {isArabic ? `مؤكد · ليدجر ${verifyResult.ledger}` : `Confirmed · Ledger ${verifyResult.ledger}`}
            </span>
          )}
          {verifyStatus === 'done' && !(verifyResult?.found && verifyResult.successful) && (
            <span className="flex items-center gap-1.5 text-xs text-yellow-400">
              <ShieldAlert className="w-3 h-3" />
              {isArabic
                ? 'هذا معرّف عقد وليس معاملة — استخدم مستكشف Stellar لعرض تفاصيله الكاملة'
                : "This is a contract ID, not a transaction — use a Stellar explorer to view full details"}
            </span>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          {isArabic
            ? 'RE Token يعمل حالياً على شبكة Pi Testnet — القيم هنا للاختبار وليست ذات قيمة نقدية حقيقية.'
            : 'RE Token currently runs on Pi Testnet — values shown are for testing and have no real monetary value.'}
        </p>
      </div>
    </main>
  );
}
