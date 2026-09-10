'use client';
import type { NavLanguage } from '@/lib/nav-i18n';

import { useEffect, useState } from 'react';
import {
  BarChart3, TrendingUp, Home, ChevronRight, ShieldCheck, Lock, ScrollText,
  Loader2, Wallet, CheckCircle2, XCircle, Bot, Link2, Copy, Check,
  ShieldAlert, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useFirebaseDatabase, type SmartContract } from '@/lib/firebase-database';
import { useProperties, getLocalizedTitle, getLocalizedLocation } from '@/lib/useProperties';
import { verifyTransactionOnStellar, type StellarVerificationResult } from '@/lib/stellar-verify';
import { DASHBOARD_I18N } from '@/lib/dashboard-i18n';

interface DashboardPageProps {
  language: NavLanguage;
  onBack?: () => void;
  favorites: string[];
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

function VerifyRow({ txid, language }: { txid: string; language: NavLanguage }) {
  const t = DASHBOARD_I18N[language];
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [result, setResult] = useState<StellarVerificationResult | null>(null);

  const verify = async () => {
    setStatus('loading');
    const r = await verifyTransactionOnStellar(txid);
    setResult(r);
    setStatus('done');
  };

  if (status === 'idle') {
    return (
      <button onClick={verify} className="flex items-center gap-1.5 text-xs text-accent underline">
        <Link2 className="w-3 h-3" />
        {t.verifyOnChain}
      </button>
    );
  }
  if (status === 'loading') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        {t.verifying}
      </span>
    );
  }
  if (result?.found && result.successful) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-400">
        <ShieldCheck className="w-3 h-3" />
        {t.confirmedLedger(result.ledger ?? '')}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-red-400">
      <ShieldAlert className="w-3 h-3" />
      {result?.error || t.notVerified}
    </span>
  );
}

export default function DashboardPage({ language, favorites }: DashboardPageProps) {
  const t = DASHBOARD_I18N[language];
  const { username, isAuthenticated } = usePiAuth();
  const { getContractsForUser } = useFirebaseDatabase();
  const { properties } = useProperties();

  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    getContractsForUser(username).then((c) => {
      setContracts(c);
      setLoading(false);
    });
  }, [username]);

  const investments = contracts.filter((c) => c.type === 'invest' || c.type === 'tokenized');
  const portfolioValue = contracts
    .filter((c) => c.status === 'active' || c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0);

  const watchlist = properties.filter((p) => favorites.includes(p.id));

  const stats = [
    { labelEn: 'Favorites Saved', labelKey: 'favoritesSaved' as const, value: String(favorites.length), icon: Home, color: 'from-accent to-amber-500', pageId: 'favorites' },
    { labelEn: 'My Contracts', labelKey: 'myContracts' as const, value: String(contracts.length), icon: ScrollText, color: 'from-blue-500 to-blue-600', pageId: 'contracts' },
    { labelEn: 'Portfolio Value', labelKey: 'portfolioValueLabel' as const, value: `${portfolioValue.toLocaleString()}π`, icon: TrendingUp, color: 'from-green-500 to-green-600', pageId: 'contracts' },
  ];

  const handleQuickAction = (pageId: string) => {
    const event = new CustomEvent('navigateToPage', { detail: pageId });
    window.dispatchEvent(event);
  };

  return (
    <main className="w-full min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-accent">{t.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.welcomeBack}</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto space-y-6">
        <div className="flex items-start gap-2.5 bg-green-500/10 border border-green-500/25 rounded-lg p-3">
          <ShieldCheck className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
          <p className="text-xs text-green-300">{t.privacyNote}</p>
        </div>

        <Card className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-accent" />
            <h2 className="font-semibold text-sm">{t.walletConnectionTitle}</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.status}</span>
              {isAuthenticated ? (
                <span className="flex items-center gap-1.5 text-green-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> {t.connected}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-red-400 font-medium">
                  <XCircle className="w-4 h-4" /> {t.notConnected}
                </span>
              )}
            </div>
            {username && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t.username}</span>
                <span className="font-mono text-xs">{username}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.network}</span>
              <span className="text-xs">Pi Testnet</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 border-t border-border pt-2">{t.sdkNote}</p>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={idx}
                  onClick={() => handleQuickAction(stat.pageId)}
                  className="bg-card border border-border p-4 hover:border-accent/50 transition cursor-pointer"
                >
                  <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg w-fit mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-accent mb-1">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{t[stat.labelKey]}</p>
                </Card>
              );
            })}
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">{t.myInvestmentPortfolio}</h2>
          {!loading && investments.length === 0 ? (
            <Card className="bg-card border border-border p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">{t.noInvestmentsYet}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {investments.map((c) => (
                <Card key={c.id} className="bg-card border border-border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm truncate flex-1">{c.propertyTitle}</h3>
                    <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full capitalize shrink-0 ml-2">
                      {c.type}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t.yourStake}</p>
                      <p className="text-lg font-bold text-accent">{c.amount.toLocaleString()} {c.currency}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t.statusLabels[c.status]}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground mt-2">{t.rentalYieldNote}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-accent" />
              {t.watchlist}
            </h2>
            <button onClick={() => handleQuickAction('favorites')} className="text-accent text-sm flex items-center gap-1">
              {t.viewAll} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {watchlist.length === 0 ? (
            <Card className="bg-card border border-border p-6 text-center">
              <Star className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">{t.noSavedPropertiesYet}</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {watchlist.slice(0, 5).map((p) => (
                <Card key={p.id} className="bg-card border border-border p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{getLocalizedTitle(p, language)}</p>
                    <p className="text-xs text-muted-foreground">{getLocalizedLocation(p, language)}</p>
                  </div>
                  <p className="text-accent font-bold text-sm shrink-0 ml-3">
                    {p.price.toLocaleString()} {p.currency || 'π'}
                  </p>
                </Card>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground mt-2">{t.priceDropAlertsNote}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-accent" />
            {t.contractVault}
          </h2>
          {!loading && contracts.filter((c) => c.txid || c.contractIdOnChain).length === 0 ? (
            <Card className="bg-card border border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">{t.noOnChainContractsYet}</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {contracts
                .filter((c) => c.txid || c.contractIdOnChain)
                .map((c) => (
                  <Card key={c.id} className="bg-card border border-border p-4 space-y-2">
                    <p className="text-sm font-medium">{c.propertyTitle}</p>
                    {c.contractIdOnChain && (
                      <div className="flex items-center gap-1.5 bg-background/60 rounded px-2 py-1">
                        <code className="text-[11px] text-muted-foreground break-all flex-1">
                          {c.contractIdOnChain}
                        </code>
                        <CopyBtn value={c.contractIdOnChain} />
                      </div>
                    )}
                    {c.txid && <VerifyRow txid={c.txid} language={language} />}
                  </Card>
                ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground mt-2">{t.spvNote}</p>
        </div>

        <Card className="bg-gradient-to-br from-purple-500/10 to-accent/10 border border-accent/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-sm">{t.aladdinInsightTitle}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {favorites.length > 0 ? t.aladdinHasSaved(favorites.length) : t.aladdinNoSaved}
          </p>
          <Button onClick={() => handleQuickAction('home')} variant="outline" className="w-full border-accent/40 text-accent">
            {t.chatWithAladdin}
          </Button>
        </Card>

        <Card className="bg-gradient-to-br from-accent/20 to-secondary/20 border border-accent/30 p-6">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-6 h-6 text-accent" />
            <h3 className="font-semibold text-foreground">{t.yourPortfolio}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t.portfolioSummary(investments.length, portfolioValue.toLocaleString())}
          </p>
          <Button onClick={() => handleQuickAction('contracts')} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {t.viewFullDetails}
          </Button>
        </Card>

        <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground pt-2">
          <Lock className="w-3.5 h-3.5" />
          {t.securedByPi}
        </div>
      </div>
    </main>
  );
}
