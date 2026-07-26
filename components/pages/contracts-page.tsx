'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ScrollText, Lock, Copy, Check, ShieldCheck } from 'lucide-react';
import { useFirebaseDatabase, type SmartContract } from '@/lib/firebase-database';
import { usePiAuth } from '@/contexts/pi-auth-context';

interface ContractsPageProps {
  language: 'en' | 'ar';
  onBack?: () => void;
}

const statusStyles: Record<SmartContract['status'], string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  active: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const statusLabelAr: Record<SmartContract['status'], string> = {
  pending: 'قيد الانتظار',
  active: 'نشط',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

const typeLabelAr: Record<SmartContract['type'], string> = {
  buy: 'شراء',
  rent: 'إيجار',
  invest: 'استثمار',
  tokenized: 'رمزي',
};

function CopyId({ value }: { value: string }) {
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

export default function ContractsPage({ language, onBack }: ContractsPageProps) {
  const isArabic = language === 'ar';
  const { username } = usePiAuth();
  const { getContractsForUser, getAllContracts } = useFirebaseDatabase();

  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const load = async (asAdmin: boolean) => {
    setLoading(true);
    try {
      if (asAdmin) {
        const all = await getAllContracts();
        setContracts(all);
      } else if (username) {
        const mine = await getContractsForUser(username);
        setContracts(mine);
      } else {
        setContracts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(adminMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleAdminToggle = () => {
    if (adminMode) {
      setAdminMode(false);
      load(false);
      return;
    }
    setShowPinPrompt(true);
  };

  const submitPin = () => {
    if (pin === '202500') {
      setAdminMode(true);
      setShowPinPrompt(false);
      setPin('');
      setPinError(false);
      load(true);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-1.5 rounded-md hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-accent flex items-center gap-2">
                <ScrollText className="w-5 h-5" />
                {isArabic ? 'العقود الذكية' : 'Smart Contracts'}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {adminMode
                  ? (isArabic ? 'عرض الأدمن: كل العقود' : 'Admin view: all contracts')
                  : (isArabic ? 'عقودك أنت فقط' : 'Your contracts only')}
              </p>
            </div>
          </div>

          <button
            onClick={handleAdminToggle}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition ${
              adminMode
                ? 'bg-accent/20 border-accent text-accent'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {adminMode ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {adminMode ? (isArabic ? 'أدمن' : 'Admin') : (isArabic ? 'عرض الكل' : 'View All')}
          </button>
        </div>

        {showPinPrompt && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'أدخل PIN الأدمن لعرض كل العقود' : 'Enter admin PIN to view all contracts'}
            </p>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && submitPin()}
              className="w-full bg-background border border-border rounded-md py-2 px-3 text-center tracking-widest"
              placeholder="••••••"
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-red-400">{isArabic ? 'PIN غير صحيح' : 'Incorrect PIN'}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={submitPin}
                className="flex-1 py-2 rounded-md bg-accent text-accent-foreground font-semibold"
              >
                {isArabic ? 'دخول' : 'Unlock'}
              </button>
              <button
                onClick={() => {
                  setShowPinPrompt(false);
                  setPin('');
                }}
                className="flex-1 py-2 rounded-md border border-border text-muted-foreground"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            {isArabic ? 'جاري التحميل...' : 'Loading...'}
          </p>
        ) : contracts.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <ScrollText className="w-10 h-10 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'لا توجد عقود حتى الآن' : 'No contracts yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-lg p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{c.propertyTitle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isArabic ? typeLabelAr[c.type] : c.type} · {c.amount.toLocaleString()} {c.currency}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-1 rounded-full border ${statusStyles[c.status]}`}>
                    {isArabic ? statusLabelAr[c.status] : c.status}
                  </span>
                </div>

                {adminMode && (
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                    <span>{isArabic ? 'المشتري' : 'Buyer'}: {c.buyerUsername}</span>
                    <span>{isArabic ? 'البائع' : 'Seller'}: {c.sellerUsername}</span>
                  </div>
                )}

                {c.contractIdOnChain && (
                  <div className="flex items-center gap-1.5 bg-background/60 rounded px-2 py-1">
                    <code className="text-[11px] text-muted-foreground break-all flex-1">
                      {c.contractIdOnChain}
                    </code>
                    <CopyId value={c.contractIdOnChain} />
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground/70">
                  {c.createdAt.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
