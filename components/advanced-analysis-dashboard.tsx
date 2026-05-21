import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp, PieChart, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedAnalysisProps {
  language?: 'en' | 'ar';
  userId: string;
}

export function AdvancedAnalysisComponent({ language = 'en', userId }: AdvancedAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [tab, setTab] = useState<'portfolio' | 'forecast' | 'opportunities'>('portfolio');

  const isArabic = language === 'ar';

  const getLabel = (key: string) => {
    const labels: { [key: string]: { en: string; ar: string } } = {
      portfolio: { en: 'Portfolio Analysis', ar: 'تحليل المحفظة' },
      forecast: { en: 'Market Forecast', ar: 'توقعات السوق' },
      opportunities: { en: 'Best Opportunities', ar: 'أفضل الفرص' },
      analyze: { en: 'Analyze Portfolio', ar: 'تحليل المحفظة' },
      forecast_market: { en: 'Forecast Markets', ar: 'توقعات الأسواق' },
      find_opportunities: { en: 'Find Opportunities', ar: 'ابحث عن الفرص' },
    };
    return labels[key]?.[language] || key;
  };

  const handleAnalyzePortfolio = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/advisor/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze-portfolio',
          data: {
            properties: [
              { id: '1', market: 'Dubai', purchasePrice: 100, currentValue: 112, roi: 0.12, currency: 'AED' },
              { id: '2', market: 'Cairo', purchasePrice: 50, currentValue: 56, roi: 0.12, currency: 'EGP' },
            ],
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAnalysis(result.data);
        setTab('portfolio');
        toast.success(getLabel('Portfolio analysis complete'));
      }
    } catch (error) {
      toast.error('Failed to analyze portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleForecastMarkets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/advisor/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'forecast-market',
          data: { market: 'Dubai', price: 100 },
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAnalysis(result.data);
        setTab('forecast');
        toast.success(getLabel('Market forecast complete'));
      }
    } catch (error) {
      toast.error('Failed to forecast market');
    } finally {
      setLoading(false);
    }
  };

  const handleFindOpportunities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/advisor/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'best-entry-points',
          data: { budget: 100 },
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAnalysis(result.data);
        setTab('opportunities');
        toast.success(getLabel('Opportunities found'));
      }
    } catch (error) {
      toast.error('Failed to find opportunities');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-6 p-4 ${isArabic ? 'rtl' : 'ltr'}`}>
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {getLabel('portfolio')}
          </CardTitle>
          <CardDescription>Advanced investment analysis powered by Aladdin AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={handleAnalyzePortfolio}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {getLabel('analyze')}
            </Button>
            <Button
              onClick={handleForecastMarkets}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {getLabel('forecast_market')}
            </Button>
            <Button
              onClick={handleFindOpportunities}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {getLabel('find_opportunities')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            {tab === 'portfolio' && (
              <>
                <CardTitle>Portfolio Analysis</CardTitle>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-lg font-bold">π{analysis.totalValue?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-sm text-gray-600">Avg ROI</p>
                    <p className="text-lg font-bold">{(analysis.avgROI * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded">
                    <p className="text-sm text-gray-600">Risk Score</p>
                    <p className="text-lg font-bold">{analysis.riskScore}/100</p>
                  </div>
                </div>
              </>
            )}

            {tab === 'forecast' && (
              <>
                <CardTitle>{analysis.market} Market Forecast</CardTitle>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600">Current Price</p>
                    <p className="text-lg font-bold">π{analysis.currentPrice}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-sm text-gray-600">12-Month Forecast</p>
                    <p className="text-lg font-bold">π{analysis.forecastedPrice12M}</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-semibold">Trend: {analysis.trend.toUpperCase()}</p>
                  <p className="text-sm">Confidence: {analysis.confidence}%</p>
                </div>
              </>
            )}

            {tab === 'opportunities' && (
              <>
                <CardTitle>Best Investment Opportunities</CardTitle>
                <div className="mt-4 space-y-2">
                  {analysis.map((opp: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded hover:bg-gray-50">
                      <p className="font-semibold">{opp.market}</p>
                      <p className="text-sm text-gray-600">{opp.opportunity}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

export default AdvancedAnalysisComponent;
