'use client';

import { TrendingUp, MapPin, Home, DollarSign, Users, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AIMarketAnalysisDashboard from '@/components/ai-market-analysis-dashboard';

interface AnalyticsPageProps {
  language: 'en' | 'ar';
  currency: 'PI' | 'USD';
}

// Regional statistics data
const regionalData = [
  {
    region: 'Dubai',
    country: 'AE',
    totalProperties: 1245,
    avgPrice: 850000,
    rentAvg: 2500,
    demand: 98,
    priceChange: 2.5,
    cityFlag: '🇦🇪',
  },
  {
    region: 'New York',
    country: 'US',
    totalProperties: 856,
    avgPrice: 650000,
    rentAvg: 3200,
    demand: 92,
    priceChange: 1.8,
    cityFlag: '🇺🇸',
  },
  {
    region: 'London',
    country: 'GB',
    totalProperties: 723,
    avgPrice: 750000,
    rentAvg: 2800,
    demand: 85,
    priceChange: 0.5,
    cityFlag: '🇬🇧',
  },
  {
    region: 'Paris',
    country: 'FR',
    totalProperties: 654,
    avgPrice: 920000,
    rentAvg: 3500,
    demand: 88,
    priceChange: 1.2,
    cityFlag: '🇫🇷',
  },
  {
    region: 'Tokyo',
    country: 'JP',
    totalProperties: 589,
    avgPrice: 520000,
    rentAvg: 1600,
    demand: 79,
    priceChange: -0.3,
    cityFlag: '🇯🇵',
  },
  {
    region: 'Bangkok',
    country: 'TH',
    totalProperties: 512,
    avgPrice: 450000,
    rentAvg: 850,
    demand: 82,
    priceChange: 3.2,
    cityFlag: '🇹🇭',
  },
  {
    region: 'Sydney',
    country: 'AU',
    totalProperties: 478,
    avgPrice: 580000,
    rentAvg: 2100,
    demand: 75,
    priceChange: 1.1,
    cityFlag: '🇦🇺',
  },
  {
    region: 'Singapore',
    country: 'SG',
    totalProperties: 445,
    avgPrice: 1200000,
    rentAvg: 4200,
    demand: 94,
    priceChange: 2.8,
    cityFlag: '🇸🇬',
  },
];

// Market type distribution
const marketDistribution = [
  { name: 'Buy', value: 45, color: '#B8860B' },
  { name: 'Rent', value: 28, color: '#AA71C2' },
  { name: 'Hotel', value: 12, color: '#FFD700' },
  { name: 'Invest', value: 15, color: '#C0C0C0' },
];

// Price trend data
const priceTrendData = [
  { month: 'Jan', avg: 680000 },
  { month: 'Feb', avg: 695000 },
  { month: 'Mar', avg: 710000 },
  { month: 'Apr', avg: 705000 },
  { month: 'May', avg: 728000 },
  { month: 'Jun', avg: 745000 },
  { month: 'Jul', avg: 760000 },
  { month: 'Aug', avg: 775000 },
  { month: 'Sep', avg: 785000 },
  { month: 'Oct', avg: 795000 },
  { month: 'Nov', avg: 810000 },
  { month: 'Dec', avg: 825000 },
];

// Demand by region
const demandData = regionalData
  .sort((a, b) => b.demand - a.demand)
  .slice(0, 6)
  .map((r) => ({
    name: r.region,
    demand: r.demand,
  }));

export default function AnalyticsPage({ language, currency }: AnalyticsPageProps) {
  // Sort by demand
  const topRegions = useMemo(() => {
    return [...regionalData].sort((a, b) => b.demand - a.demand);
  }, []);

  // Calculate total statistics
  const totalStats = useMemo(() => {
    const total = regionalData.length;
    const totalProperties = regionalData.reduce((sum, r) => sum + r.totalProperties, 0);
    const avgPrice = Math.round(
      regionalData.reduce((sum, r) => sum + r.avgPrice, 0) / total
    );
    const avgDemand = Math.round(
      regionalData.reduce((sum, r) => sum + r.demand, 0) / total
    );

    return { total, totalProperties, avgPrice, avgDemand };
  }, []);

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">
          {language === 'en' ? 'Market Analytics' : 'تحليلات السوق'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en'
            ? 'Global real estate statistics and regional insights'
            : 'إحصائيات العقارات العالمية والرؤى الإقليمية'}
        </p>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">
              {language === 'en' ? 'Total Properties' : 'إجمالي العقارات'}
            </span>
            <Home className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold text-accent">
            {totalStats.totalProperties.toLocaleString()}
          </p>
          <p className="text-xs text-green-500 mt-1">+12% this month</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">
              {language === 'en' ? 'Avg Price' : 'متوسط السعر'}
            </span>
            <DollarSign className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold text-accent">
            {Math.round(totalStats.avgPrice / 1000)}K {currency}
          </p>
          <p className="text-xs text-green-500 mt-1">+2.1% growth</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">
              {language === 'en' ? 'Active Regions' : 'المناطق النشطة'}
            </span>
            <MapPin className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold text-accent">{totalStats.total}</p>
          <p className="text-xs text-green-500 mt-1">Worldwide coverage</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">
              {language === 'en' ? 'Avg Demand' : 'متوسط الطلب'}
            </span>
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold text-accent">{totalStats.avgDemand}%</p>
          <p className="text-xs text-green-500 mt-1">High interest</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Price Trend Chart */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-lg font-semibold text-accent mb-4">
            {language === 'en' ? 'Average Price Trend' : 'اتجاه متوسط السعر'}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                }}
                formatter={(value) => `${Math.round(value as number / 1000)}K`}
              />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="#B8860B"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Market Distribution */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-lg font-semibold text-accent mb-4">
            {language === 'en' ? 'Market Distribution' : 'توزيع السوق'}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={marketDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {marketDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Demand by Region */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-lg font-semibold text-accent mb-4">
            {language === 'en' ? 'Top Markets by Demand' : 'أفضل الأسواق حسب الطلب'}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demandData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                }}
                formatter={(value) => `${value}%`}
              />
              <Bar dataKey="demand" fill="#B8860B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Regional Summary */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-lg font-semibold text-accent mb-4">
            {language === 'en' ? 'Regional Leaders' : 'قادة المناطق'}
          </h2>
          <div className="space-y-2">
            {topRegions.slice(0, 5).map((region) => (
              <div
                key={region.region}
                className="flex items-center justify-between p-2 bg-background/50 rounded border border-border/50"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-lg">{region.cityFlag}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {region.region}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {region.totalProperties} properties
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-accent">
                    {region.demand}%
                  </p>
                  <p
                    className={`text-xs flex items-center justify-end gap-1 ${
                      region.priceChange >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {region.priceChange >= 0 ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    {Math.abs(region.priceChange)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Regional Table */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-lg font-semibold text-accent mb-4">
          {language === 'en' ? 'Regional Statistics' : 'الإحصائيات الإقليمية'}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 text-accent font-semibold">
                  {language === 'en' ? 'Region' : 'المنطقة'}
                </th>
                <th className="text-right p-2 text-accent font-semibold">
                  {language === 'en' ? 'Properties' : 'العقارات'}
                </th>
                <th className="text-right p-2 text-accent font-semibold">
                  {language === 'en' ? 'Avg Price' : 'متوسط السعر'}
                </th>
                <th className="text-right p-2 text-accent font-semibold">
                  {language === 'en' ? 'Rent Avg' : 'متوسط الإيجار'}
                </th>
                <th className="text-right p-2 text-accent font-semibold">
                  {language === 'en' ? 'Demand' : 'الطلب'}
                </th>
                <th className="text-right p-2 text-accent font-semibold">
                  {language === 'en' ? 'Change' : 'التغيير'}
                </th>
              </tr>
            </thead>
            <tbody>
              {topRegions.map((region) => (
                <tr
                  key={region.region}
                  className="border-b border-border/50 hover:bg-background/50 transition"
                >
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{region.cityFlag}</span>
                      <span className="font-semibold text-foreground">
                        {region.region}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 text-right text-muted-foreground">
                    {region.totalProperties.toLocaleString()}
                  </td>
                  <td className="p-2 text-right font-semibold text-accent">
                    {(region.avgPrice / 1000).toFixed(0)}K {currency}
                  </td>
                  <td className="p-2 text-right font-semibold text-secondary">
                    {region.rentAvg.toLocaleString()} {currency}
                  </td>
                  <td className="p-2 text-right">
                    <div className="bg-accent/20 rounded px-2 py-1 inline-block">
                      <span className="text-accent font-semibold">
                        {region.demand}%
                      </span>
                    </div>
                  </td>
                  <td
                    className={`p-2 text-right font-semibold flex items-center justify-end gap-1 ${
                      region.priceChange >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {region.priceChange >= 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    {Math.abs(region.priceChange)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Market Analysis Dashboard */}
      <div className="border border-border rounded-xl overflow-hidden">
        <AIMarketAnalysisDashboard language={language} />
      </div>

      {/* Insights */}
      <div className="bg-background/50 border border-border rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold text-accent">
          {language === 'en' ? 'Market Insights' : 'رؤى السوق'}
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>
              {language === 'en'
                ? 'Dubai leads with 98% demand, followed by Singapore at 94%'
                : 'دبي تتصدر بطلب بنسبة 98٪، تليها سنغافورة بنسبة 94٪'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>
              {language === 'en'
                ? 'Average property prices increased 2.1% over the past year'
                : 'ارتفعت متوسط أسعار العقارات بنسبة 2.1٪ على مدار السنة الماضية'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>
              {language === 'en'
                ? 'Bangkok showing highest growth rate at 3.2% month-over-month'
                : 'تايلاند تظهر أعلى معدل نمو بنسبة 3.2٪ من شهر لآخر'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>
              {language === 'en'
                ? 'Residential properties account for 45% of market, rentals 28%'
                : 'تمثل العقارات السكنية 45٪ من السوق، والإيجارات 28٪'}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
