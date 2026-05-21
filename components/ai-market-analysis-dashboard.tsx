'use client';

import { useMemo, useState, useEffect, memo, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Download, RefreshCw, Brain } from 'lucide-react';

interface MarketAnalysisDashboardProps {
  language: 'en' | 'ar';
}

// Monthly price trend data for cities
const cityPriceTrends = [
  {
    month: 'Jan',
    Dubai: 85000,
    'New York': 65000,
    London: 75000,
    Paris: 92000,
    Tokyo: 52000,
  },
  {
    month: 'Feb',
    Dubai: 86200,
    'New York': 66500,
    London: 76100,
    Paris: 93500,
    Tokyo: 51800,
  },
  {
    month: 'Mar',
    Dubai: 87100,
    'New York': 67200,
    London: 77000,
    Paris: 94200,
    Tokyo: 52300,
  },
  {
    month: 'Apr',
    Dubai: 88500,
    'New York': 68100,
    London: 78200,
    Paris: 95600,
    Tokyo: 52800,
  },
  {
    month: 'May',
    Dubai: 89300,
    'New York': 69400,
    London: 79500,
    Paris: 96800,
    Tokyo: 53500,
  },
  {
    month: 'Jun',
    Dubai: 90800,
    'New York': 71200,
    London: 81200,
    Paris: 98500,
    Tokyo: 54200,
  },
];

// Weekly market report summary
const weeklyReportTemplate = {
  en: {
    title: 'Weekly Market Report',
    topGainers: 'Top Price Gainers',
    topFallers: 'Price Declines',
    avgTrend: 'Average Market Trend',
    generatedAt: 'Generated on',
  },
  ar: {
    title: 'تقرير السوق الأسبوعي',
    topGainers: 'أكثر المدن ارتفاعاً',
    topFallers: 'المدن الهابطة',
    avgTrend: 'متوسط اتجاه السوق',
    generatedAt: 'تم إنشاؤه في',
  },
};

// City performance metrics
const cityMetrics = [
  { city: 'Dubai', lastWeek: 90800, thisWeek: 92500, change: 1.9, flag: '🇦🇪' },
  { city: 'New York', lastWeek: 71200, thisWeek: 73400, change: 3.1, flag: '🇺🇸' },
  { city: 'London', lastWeek: 81200, thisWeek: 83100, change: 2.3, flag: '🇬🇧' },
  { city: 'Paris', lastWeek: 98500, thisWeek: 101200, change: 2.7, flag: '🇫🇷' },
  { city: 'Tokyo', lastWeek: 54200, thisWeek: 55800, change: 3.0, flag: '🇯🇵' },
];

export default memo(function AIMarketAnalysisDashboard({ language }: MarketAnalysisDashboardProps) {
  const [reportGenerated, setReportGenerated] = useState<boolean>(true);
  const [lastGenerated, setLastGenerated] = useState<string>('');

  const labels = weeklyReportTemplate[language];

  useEffect(() => {
    // Set last generated date on mount only
    const now = new Date();
    setLastGenerated(now.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'));
  }, [language]);

  const topGainers = useMemo(() => {
    return [...cityMetrics].sort((a, b) => b.change - a.change).slice(0, 3);
  }, []);

  const topFallers = useMemo(() => {
    return [...cityMetrics].sort((a, b) => a.change - b.change).slice(0, 2);
  }, []);

  const avgTrendChange = useMemo(() => {
    return (cityMetrics.reduce((sum, city) => sum + city.change, 0) / cityMetrics.length).toFixed(2);
  }, []);

  const handleGenerateReport = useCallback(() => {
    setReportGenerated(false);
    setTimeout(() => {
      const now = new Date();
      setLastGenerated(now.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'));
      setReportGenerated(true);
    }, 1500);
  }, [language]);

  const handleExportReport = useCallback(() => {
    const report = `
RE Global Market Analysis Report
Generated: ${lastGenerated}

TOP PRICE GAINERS:
${topGainers.map(c => `${c.city}: +${c.change}% (${c.thisWeek}π)`).join('\n')}

PRICE DECLINES:
${topFallers.map(c => `${c.city}: +${c.change}% (${c.thisWeek}π)`).join('\n')}

AVERAGE MARKET TREND: +${avgTrendChange}%
    `.trim();
    
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(report)}`);
    element.setAttribute('download', `market-report-${lastGenerated}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [lastGenerated, topGainers, topFallers, avgTrendChange]);

  return (
    <div className="w-full space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-accent" />
          <div>
            <h2 className="text-xl font-bold text-foreground">{labels.title}</h2>
            <p className="text-xs text-muted-foreground">{labels.generatedAt} {lastGenerated}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={!reportGenerated}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${!reportGenerated ? 'animate-spin' : ''}`} />
            {language === 'en' ? 'Refresh' : 'تحديث'}
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            {language === 'en' ? 'Export' : 'تصدير'}
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        {/* Price Trend Chart */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {language === 'en' ? 'Price Trends (6 Months)' : 'اتجاهات الأسعار (6 أشهر)'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cityPriceTrends}>
              <defs>
                <linearGradient id="colorDubai" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNewYork" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Area type="monotone" dataKey="Dubai" stackId="1" stroke="#F59E0B" fill="url(#colorDubai)" />
              <Area type="monotone" dataKey="New York" stackId="1" stroke="#8B5CF6" fill="url(#colorNewYork)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Performance */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {language === 'en' ? 'Weekly City Performance' : 'أداء المدن الأسبوعية'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cityMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="city" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="change" fill="#F59E0B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
        {/* Top Gainers */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            {labels.topGainers}
          </h3>
          <div className="space-y-3">
            {topGainers.map((city) => (
              <div key={city.city} className="flex items-center justify-between p-2 bg-background/50 rounded-lg hover:bg-background transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{city.flag}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{city.city}</p>
                    <p className="text-xs text-muted-foreground">{city.thisWeek}π</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-500">+{city.change}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Overview */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {language === 'en' ? 'Market Overview' : 'نظرة عامة على السوق'}
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{labels.avgTrend}</p>
              <p className="text-2xl font-bold text-accent">+{avgTrendChange}%</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{language === 'en' ? 'Cities Tracked' : 'المدن المتابعة'}</p>
                <p className="text-lg font-semibold text-foreground">{cityMetrics.length}</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{language === 'en' ? 'Update Frequency' : 'تكرار التحديث'}</p>
                <p className="text-lg font-semibold text-foreground">{language === 'en' ? 'Weekly' : 'أسبوعي'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Cities Metrics */}
      <div className="px-4 bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          {language === 'en' ? 'All Markets' : 'جميع الأسواق'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left py-2 px-2">{language === 'en' ? 'City' : 'المدينة'}</th>
                <th className="text-right py-2 px-2">{language === 'en' ? 'Last Week' : 'الأسبوع الماضي'}</th>
                <th className="text-right py-2 px-2">{language === 'en' ? 'This Week' : 'هذا الأسبوع'}</th>
                <th className="text-right py-2 px-2">{language === 'en' ? 'Change' : 'التغيير'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cityMetrics.map((city) => (
                <tr key={city.city} className="hover:bg-background/50 transition-colors">
                  <td className="py-3 px-2 flex items-center gap-2">
                    <span className="text-lg">{city.flag}</span>
                    <span className="font-medium text-foreground">{city.city}</span>
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">{city.lastWeek.toLocaleString()}π</td>
                  <td className="py-3 px-2 text-right font-semibold text-foreground">{city.thisWeek.toLocaleString()}π</td>
                  <td className={`py-3 px-2 text-right font-semibold flex items-center justify-end gap-1 ${city.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {city.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {city.change >= 0 ? '+' : ''}{city.change}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Note */}
      <div className="px-4 bg-gradient-to-r from-accent/10 to-secondary/10 border border-accent/20 rounded-lg p-4 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-accent flex-shrink-0" />
          {language === 'en' 
            ? 'AI-generated market analysis updated weekly. Use for investment research only.' 
            : 'تحليل السوق المولد بالذكاء الاصطناعي يتم تحديثه أسبوعياً. للاستخدام في البحث الاستثماري فقط.'}
        </p>
      </div>
    </div>
  );
});
