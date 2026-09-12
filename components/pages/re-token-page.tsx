'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { useEffect, useState } from 'react';
import { Wallet, RefreshCw, Info } from 'lucide-react';
import { SimplePiPaymentButton } from '@/components/simple-pi-payment-button';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { RE_TOKEN_I18N } from '@/lib/re-token-i18n';

interface RETokenPageProps {
  language: NavLanguage;
  onBack?: () => void;
  onNavigate?: (newPage: string) => void;
}

interface WalletData {
  balance: number;
  piUsername: string;
}

interface Quote {
  reAmount: number;
  unitPriceUsd: number;
  valueUsd: number;
  piUsdRate: number;
  networkFeePi: number;
  totalPi: number;
  priceType: string;
  quotedAt: string;
}

const PRESET_AMOUNTS = [50, 100, 250, 500];
const MIN_RE = 10;
const QUOTE_DEBOUNCE_MS = 400;

export default function RETokenPage({ language = 'en', onBack }: RETokenPageProps) {
  const { user, isAuthenticated } = usePiAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(PRESET_AMOUNTS[0]);
  const [customAmount, setCustomAmount] = useState('');

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const activeAmount = customAmount !== '' ? Number(customAmount) : selectedAmount;
  const isAmountValid = Number.isFinite(activeAmount) && activeAmount >= MIN_RE;

  const t = RE_TOKEN_I18N[language];
  const isRTL = language === 'ar' || language === 'ur';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (isAuthenticated && user?.username) {
      loadWallet(user.username);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAmountValid) {
      setQuote(null);
      return;
    }
    setQuoteError('');
    const timer = setTimeout(() => fetchQuote(activeAmount), QUOTE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAmount, isAmountValid]);

  const fetchQuote = async (reAmount: number) => {
    try {
      setQuoteLoading(true);
      const res = await fetch(`${apiUrl}/api/token-sale/quote?reAmount=${reAmount}`);
      if (!res.ok) throw new Error('quote_failed');
      const data = await res.json();
      setQuote(data);
    } catch (error) {
      console.error('[v0] Credits quote fetch error:', error);
      setQuote(null);
      setQuoteError(t.couldNotFetchPrice);
    } finally {
      setQuoteLoading(false);
    }
  };

  const loadWallet = async (piUsername: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/token-sale/wallet/${piUsername}`);
      if (res.ok) {
        const data = await res.json();
        setWallet(data);
      }
    } catch (error) {
      console.error('[v0] Credits wallet fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSuccess = () => {
    if (user?.username) loadWallet(user.username);
  };

  return (
    <div className={`flex flex-col h-full bg-background pb-24 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="bg-gradient-to-r from-accent/20 to-accent/10 p-4 border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          {onBack && (
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition">
              ←
            </button>
          )}
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-5 h-5 text-accent" />
            {t.platformCredits}
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
          {t.balanceForServices}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isAuthenticated && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">
              {t.yourBalance}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? '...' : `${(wallet?.balance ?? 0).toLocaleString()} ${t.credits}`}
            </p>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-foreground">
            {t.topUpYourCredits}
          </h2>
          <p className="text-xs text-muted-foreground -mt-2">
            {t.useCreditsFor}
          </p>

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
              placeholder={t.orEnterAmount(MIN_RE)}
              className="w-full py-2 px-3 rounded-lg text-sm bg-background text-foreground border border-border focus:border-accent focus:outline-none"
            />
            {customAmount !== '' && !isAmountValid && (
              <p className="text-xs text-destructive mt-1">
                {t.minimumTopUp(MIN_RE)}
              </p>
            )}
          </div>

          <div className="bg-background border border-border rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                {t.priceBreakdown}
              </p>
            </div>

            {quoteLoading && (
              <p className="text-xs text-muted-foreground">
                {t.calculatingPrice}
              </p>
            )}

            {quoteError && !quoteLoading && (
              <p className="text-xs text-destructive">{quoteError}</p>
            )}

            {quote && !quoteLoading && !quoteError && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t.creditValue}
                  </span>
                  <span className="text-foreground font-medium">${quote.valueUsd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t.currentRate}
                  </span>
                  <span className="text-foreground font-medium">${quote.piUsdRate.toFixed(6)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t.networkFee}</span>
                  <span className="text-foreground font-medium">{quote.networkFeePi} π</span>
                </div>
                <div className="flex justify-between text-sm pt-1.5 border-t border-border">
                  <span className="text-foreground font-semibold">{t.total}</span>
                  <span className="text-accent font-bold">{quote.totalPi.toFixed(4)} π</span>
                </div>
              </>
            )}
          </div>

          {isAmountValid && quote && !quoteLoading && (
            <SimplePiPaymentButton
              reAmount={activeAmount}
              language={language}
              onSuccess={handlePurchaseSuccess}
              onError={(err) => console.error('[v0] Credits top-up failed:', err)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
