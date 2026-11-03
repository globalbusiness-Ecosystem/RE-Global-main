'use client';
import { formatNumber } from '@/lib/format';
import type { NavLanguage } from '@/lib/nav-i18n';
import { estimateLabels } from '@/lib/estimate-labels';

import { useState, useMemo, memo, useCallback } from 'react';
import { X, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

interface AIPriceEstimateProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
  listedPrice: number;
  city: string;
  language: NavLanguage;
  category?: string;
}

const MARKET_MULTIPLIERS: Record<string, number> = {
  Dubai: 1.15,
  'New York': 1.08,
  London: 1.12,
  Paris: 1.18,
  Tokyo: 0.95,
  Bangkok: 0.85,
  Sydney: 1.05,
  Singapore: 1.22,
};

const CATEGORY_MULTIPLIERS: Record<string, number> = {
  buy: 1.0,
  rent: 0.8,
  hotel: 1.25,
  invest: 1.1,
  tokenized: 1.05,
  offplan: 0.9,
};

export default memo(function AIPriceEstimate({
  isOpen,
  onClose,
  propertyTitle,
  listedPrice,
  city,
  language,
  category = 'buy',
}: AIPriceEstimateProps) {
  const [isCalculating, setIsCalculating] = useState(false);

  // Memoized fair value calculation
  const fairValue = useMemo(() => {
    return Math.round(
      listedPrice * (MARKET_MULTIPLIERS[city] || 1.0) * (CATEGORY_MULTIPLIERS[category] || 1.0)
    );
  }, [listedPrice, city, category]);

  const priceMetrics = useMemo(() => {
    const difference = fairValue - listedPrice;
    const percentageDiff = ((difference / listedPrice) * 100).toFixed(1);
    const isUnderpriced = difference < 0;
    return { difference, percentageDiff, isUnderpriced };
  }, [fairValue, listedPrice]);

  const handleCalculate = useCallback(() => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
    }, 800);
  }, []);

  const currentLabels = estimateLabels(language);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            {currentLabels.title}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4">
          {/* Property Info */}
          <div className="bg-background/50 rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">{currentLabels.property}</p>
            <p className="font-semibold text-foreground line-clamp-2">{propertyTitle}</p>
            <p className="text-xs text-muted-foreground mt-1">{city}</p>
          </div>

          {/* Price Comparison */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{currentLabels.listed}</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(listedPrice, language)}π</p>
              </div>
              <TrendingUp className="w-5 h-5 text-accent/50" />
            </div>

            <div className="border-t border-border/30 pt-3">
              <p className="text-xs text-muted-foreground mb-1">{currentLabels.estimate}</p>
              {isCalculating ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <p className="text-sm text-muted-foreground">
                    {currentLabels.calculating}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-accent">{formatNumber(fairValue, language)}π</p>
                  {priceMetrics.difference !== 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {priceMetrics.isUnderpriced ? '-' : '+'}{Math.abs(Number(priceMetrics.percentageDiff))}%
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Price Difference */}
          <div className={`bg-background/50 rounded-lg p-3 border-l-4 ${
            priceMetrics.isUnderpriced ? 'border-l-green-500' : 'border-l-red-500'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{currentLabels.difference}</p>
              <p className={`text-sm font-semibold ${priceMetrics.isUnderpriced ? 'text-green-500' : 'text-red-500'}`}>
                {priceMetrics.isUnderpriced ? '-' : '+'}{formatNumber(Math.abs(priceMetrics.difference), language)}π
              </p>
            </div>
            <p className={`text-xs font-medium ${priceMetrics.isUnderpriced ? 'text-green-500' : 'text-red-500'}`}>
              ({priceMetrics.isUnderpriced ? '' : '+'}{priceMetrics.percentageDiff}%)
            </p>
          </div>

          {/* Recommendation */}
          <div className={`bg-background/50 rounded-lg p-3 border border-border/50 flex gap-3`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 ${priceMetrics.isUnderpriced ? 'text-green-500' : 'text-yellow-500'}`} />
            <div>
              <p className="text-xs font-semibold mb-1">{currentLabels.recommendation}</p>
              <p className={`text-xs leading-relaxed ${priceMetrics.isUnderpriced ? 'text-green-600' : 'text-yellow-600'}`}>
                {priceMetrics.isUnderpriced ? currentLabels.underpriced : currentLabels.overpriced}
              </p>
            </div>
          </div>

          {/* Factors */}
          <div className="bg-background/50 rounded-lg p-3 border border-border/50 text-xs space-y-2">
            <p className="font-semibold text-foreground">{currentLabels.factors}</p>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>{currentLabels.location}</span>
                <span className="text-accent font-medium">×{(MARKET_MULTIPLIERS[city] || 1.0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{currentLabels.type}</span>
                <span className="text-accent font-medium">×{(CATEGORY_MULTIPLIERS[category] || 1.0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{currentLabels.trend}</span>
                <span className="text-accent font-medium">+2.5% YoY</span>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="w-full py-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isCalculating 
              ? currentLabels.calculating
              : currentLabels.refresh}
          </button>

          {/* Disclaimer */}
          <div className="bg-background/30 rounded-lg p-3 border border-border/30 text-xs text-muted-foreground leading-relaxed">
            {currentLabels.disclaimer}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
