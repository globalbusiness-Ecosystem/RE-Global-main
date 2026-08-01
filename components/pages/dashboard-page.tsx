'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Home, ChevronRight, ShieldCheck, Lock, ScrollText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useFirebaseDatabase, type SmartContract } from '@/lib/firebase-database';

interface DashboardPageProps {
  language: 'en' | 'ar';
  onBack?: () => void;
  favorites: string[];
}

const statusLabelAr: Record<SmartContract['status'], string> = {
  pending: 'قيد الانتظار',
  active: 'نشط',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export default function DashboardPage({ language, favorites }: DashboardPageProps) {
  const isArabic = language === 'ar';
  const { username } = usePiAuth();
  const { getContractsForUser } = useFirebaseDatabase();

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

  const stats = [
    {
      labelEn: 'Favorites Saved',
      labelAr: 'المفضلات المحفوظة',
      value: String(favorites.length),
      icon: Home,
      color: 'from-accent to-amber-500',
      pageId: 'favorites',
    },
    {
      labelEn: 'My Contracts',
      labelAr: 'عقودي',
      value: String(contracts.length),
      icon: ScrollText,
      color: 'from-blue-500 to-blue-600',
      pageId: 'contracts',
    },
    {
      labelEn: 'Portfolio Value',
      labelAr: 'قيمة المحفظة',
      value: `${portfolioValue.toLocaleString()}π`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      pageId: 'contracts',
    },
  ];

  const quickActions = [
    { labelEn: 'Search Properties', labelAr: 'البحث عن عقارات', pageId: 'home' },
    { labelEn: 'View Favorites', labelAr: 'عرض المفضلات', pageId: 'favorites' },
    { labelEn: 'My Contracts', labelAr: 'عقودي الذكية', pageId: 'contracts' },
    { labelEn: 'Browse Map', labelAr: 'استعرض الخريطة', pageId: 'map' },
  ];

  const handleQuickAction = (pageId: string) => {
    const event = new CustomEvent('navigateToPage', { detail: pageId });
    window.dispatchEvent(event);
  };

  return (
    <main className="w-full min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-accent">
            {isArabic ? 'لوحة التحكم' : 'Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isArabic ? 'أهلاً بعودتك' : 'Welcome back'}
          </p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto space-y-6">
        <div className="flex items-start gap-2.5 bg-green-500/10 border border-green-500/25 rounded-lg p-3">
          <ShieldCheck className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
          <p className="text-xs text-green-300">
            {isArabic
              ? 'هذه البيانات خاصة بحسابك أنت فقط، ولا يقدر أي مستخدم آخر يشوفها.'
              : 'This data is scoped to your account only — no other user can see it.'}
          </p>
        </div>

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
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? stat.labelAr : stat.labelEn}
                  </p>
                </Card>
              );
            })}
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                onClick={() => handleQuickAction(action.pageId)}
                variant="outline"
                className="h-auto py-4 border-border hover:bg-card hover:border-accent/50 transition"
              >
                <span className="text-center text-sm font-medium">
                  {isArabic ? action.labelAr : action.labelEn}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">
              {isArabic ? 'استثماراتك وعقودك' : 'Your Investments & Contracts'}
            </h2>
            <button
              onClick={() => handleQuickAction('contracts')}
              className="text-accent hover:text-accent/80 text-sm flex items-center gap-1"
            >
              {isArabic ? 'عرض الكل' : 'View All'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!loading && contracts.length === 0 && (
            <Card className="bg-card border border-border p-6 text-center">
              <ScrollText className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'لا توجد عقود أو استثمارات بعد' : 'No contracts or investments yet'}
              </p>
            </Card>
          )}

          <div className="space-y-3">
            {contracts.slice(0, 5).map((c) => (
              <Card key={c.id} className="bg-card border border-border p-4 hover:border-accent/50 transition">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate">{c.propertyTitle}</h3>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{c.type}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-accent font-bold text-sm">
                      {c.amount.toLocaleString()} {c.currency}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? statusLabelAr[c.status] : c.status}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-gradient-to-br from-accent/20 to-secondary/20 border border-accent/30 p-6">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-6 h-6 text-accent" />
            <h3 className="font-semibold text-foreground">
              {isArabic ? 'محفظتك' : 'Your Portfolio'}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {isArabic
              ? `${investments.length} استثمار نشط · القيمة الإجمالية ${portfolioValue.toLocaleString()}π`
              : `${investments.length} active investments · Total value ${portfolioValue.toLocaleString()}π`}
          </p>
          <Button
            onClick={() => handleQuickAction('contracts')}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isArabic ? 'عرض التفاصيل الكاملة' : 'View Full Details'}
          </Button>
        </Card>

        <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground pt-2">
          <Lock className="w-3.5 h-3.5" />
          {isArabic ? 'محمي بمصادقة Pi Network' : 'Secured by Pi Network authentication'}
        </div>
      </div>
    </main>
  );
}
