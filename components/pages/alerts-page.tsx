'use client';

import { useEffect, useState } from 'react';
import { Bell, X, TrendingUp, TrendingDown, ScrollText, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useFirebaseDatabase } from '@/lib/firebase-database';
import { useProperties } from '@/lib/useProperties';
import { generateSmartAlerts, type SmartAlert } from '@/lib/smart-alerts';

interface AlertsPageProps {
  language: 'en' | 'ar';
  onBack?: () => void;
}

const ICONS: Record<SmartAlert['type'], any> = {
  'price-up': TrendingUp,
  'price-down': TrendingDown,
  'contract-status': ScrollText,
  recommendation: Sparkles,
};

const COLORS: Record<SmartAlert['type'], string> = {
  'price-up': 'border-red-500/30 bg-red-500/5 text-red-400',
  'price-down': 'border-green-500/30 bg-green-500/5 text-green-400',
  'contract-status': 'border-blue-500/30 bg-blue-500/5 text-blue-400',
  recommendation: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
};

export default function AlertsPage({ language, onBack }: AlertsPageProps) {
  const isArabic = language === 'ar';
  const { username } = usePiAuth();
  const { getFavoritesForUser, getContractsForUser } = useFirebaseDatabase();
  const { properties } = useProperties();

  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    Promise.all([getFavoritesForUser(username), getContractsForUser(username)]).then(
      ([favorites, contracts]) => {
        setAlerts(generateSmartAlerts(favorites, properties, contracts));
        setLoading(false);
      }
    );
  }, [username, properties]);

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  return (
    <main className="w-full min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-accent">
                {isArabic ? 'التنبيهات الذكية' : 'Smart Alerts'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isArabic
                  ? 'مبنية على مفضلاتك وعقودك الفعلية'
                  : 'Based on your real favorites and contracts'}
              </p>
            </div>
            <div className="relative">
              <Bell className="w-6 h-6 text-accent" />
              {visibleAlerts.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {visibleAlerts.length}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md md:max-w-2xl lg:max-w-5xl mx-auto space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !username ? (
          <Card className="bg-card border border-border p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-sm">
              {isArabic ? 'سجّل الدخول عبر Pi لرؤية تنبيهاتك' : 'Sign in with Pi to see your alerts'}
            </p>
          </Card>
        ) : visibleAlerts.length === 0 ? (
          <Card className="bg-card border border-border p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {isArabic ? 'لا توجد تنبيهات في الوقت الحالي' : 'No alerts at this time'}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2">
              {isArabic
                ? 'حفظ عقارات في المفضلة يساعدنا نبعتلك تنبيهات تغيّر السعر والتوصيات'
                : 'Saving properties to favorites helps us send you price-change and recommendation alerts'}
            </p>
          </Card>
        ) : (
          visibleAlerts.map((alert) => {
            const AlertIcon = ICONS[alert.type];
            return (
              <Card key={alert.id} className={`border transition-all ${COLORS[alert.type]} p-4`}>
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${COLORS[alert.type]}`}>
                    <AlertIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">
                      {isArabic ? alert.titleAr : alert.titleEn}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isArabic ? alert.descriptionAr : alert.descriptionEn}
                    </p>
                  </div>
                  <button
                    onClick={() => setDismissed((prev) => new Set(prev).add(alert.id))}
                    className="text-muted-foreground hover:text-foreground transition flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </main>
  );
}
