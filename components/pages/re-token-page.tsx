'use client';

import { useEffect, useState } from 'react';
import { Coins, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimplePiPaymentButton } from '@/components/simple-pi-payment-button';
import { usePiAuth } from '@/contexts/pi-auth-context';

interface RETokenPageProps {
  language: 'en' | 'ar';
  onBack?: () => void;
}

interface WalletData {
  balance: number;
  piUsername: string;
}

const RE_TOKEN_PRICE_PI = 0.01; // 1 $RE = 0.01 π (تقدر تغيّرها لاحقًا من الباك اند)
const RE_TOTAL_SUPPLY = 100_000_000;

const PRESET_AMOUNTS = [1000, 5000, 10000, 50000];
const MIN_RE = 10; // أصغر كمية شراء مسموحة

export default function RETokenPage({ language = 'en', onBack }: RETokenPageProps) {
  const { user, isAuthenticated } = usePiAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(PRESET_AMOUNTS[0]);
  const [customAmount, setCustomAmount] = useState('');

  // الكمية الفعلية: لو المستخدم كاتب رقم يدوي بنستخدمه، غير كده بنستخدم الزرار المختار
  const activeAmount = customAmount !== '' ? Number(customAmount) : selectedAmount;
  const isAmountValid = Number.isFinite(activeAmount) && activeAmount >= MIN_RE;
  // حساب دقيق بالقسمة على 100 بدل الضرب في 0.01 لتفادي أخطاء الفاصلة العشرية
  const piCost = isAmountValid ? activeAmount / 100 : 0;

  const isArabic = language === 'ar';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (isAuthenticated && user?.username) {
      loadWallet(user.username);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadWallet = async (piUsername: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/token-sale/wallet/${piUsername}`);
      if (res.ok) {
        const data = await res.json();
        setWallet(data);
      }
    } catch (error) {
      console.error('[v0] RE Token wallet fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSuccess = () => {
    if (user?.username) loadWallet(user.username);
  };

  return (
    <div className={`flex flex-col h-full bg-background pb-24 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/20 to-accent/10 p-4 border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          {onBack && (
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition">
              ←
            </button>
          )}
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Coins className="w-5 h-5 text-accent" />
            {isArabic ? 'عملة RE Token' : 'RE Token'}
          </h1>
          <button
            onClick={() => user?.username && loadWallet(user.username)}
            className="text-muted-foreground hover:text-foreground transition"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          {isArabic ? 'عملة المنصة الرسمية' : "The platform's currency"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* رصيدك */}
        {isAuthenticated && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">
              {isArabic ? 'رصيدك الحالي' : 'Your Balance'}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? '...' : `${(wallet?.balance ?? 0).toLocaleString()} $RE`}
            </p>
          </div>
        )}

        {/* السعر والسوبلاي */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">
              {isArabic ? 'سعر التوكن' : 'Token Price'}
            </p>
            <p className="text-lg font-bold text-accent">1 $RE = {RE_TOKEN_PRICE_PI}π</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">
              {isArabic ? 'إجمالي المعروض' : 'Total Supply'}
            </p>
            <p className="text-lg font-bold text-foreground">
              {(RE_TOTAL_SUPPLY / 1_000_000).toFixed(0)}M $RE
            </p>
          </div>
        </div>

        {/* شراء توكن */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            {isArabic ? 'اشترِ $RE' : 'Buy $RE'}
          </h2>

          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                className={`py-2 rounded-lg text-sm font-medium border transition ${
                  selectedAmount === amount && customAmount === ''
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-background text-muted-foreground border-border hover:border-accent/50'
                }`}
              >
                {amount.toLocaleString()}
              </button>
            ))}
          </div>

          <div>
            <input
              type="number"
              min={MIN_RE}
              step="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder={isArabic ? `أو اكتب كمية (الحد الأدنى ${MIN_RE})` : `Or enter amount (min ${MIN_RE})`}
              className="w-full py-2 px-3 rounded-lg text-sm bg-background text-foreground border border-border focus:border-accent focus:outline-none"
            />
            {customAmount !== '' && !isAmountValid && (
              <p className="text-xs text-destructive mt-1">
                {isArabic ? `أقل كمية للشراء هي ${MIN_RE} $RE` : `Minimum purchase is ${MIN_RE} $RE`}
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            {isArabic ? 'ستدفع' : 'You will pay'}:{' '}
            <span className="text-foreground font-semibold">
              {piCost.toFixed(2)} π
            </span>
          </p>

          {isAmountValid && (
            <SimplePiPaymentButton
              reAmount={activeAmount}
              language={language}
              onSuccess={handlePurchaseSuccess}
              onError={(err) => console.error('[v0] RE Token purchase failed:', err)}
            />
          )}
        </div>

        {/* طرق ثانية للكسب */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-3">
            {isArabic ? 'طرق أخرى للحصول على $RE' : 'How to Earn'}
          </h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• {isArabic ? 'شراء عقارات' : 'Buy Properties'}</p>
            <p>• {isArabic ? 'الاستثمار في أصول مُرمّزة' : 'Invest in Tokenized Assets'}</p>
            <p>• {isArabic ? 'دعوة أصدقاء' : 'Refer Friends'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
