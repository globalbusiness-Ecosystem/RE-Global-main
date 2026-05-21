'use client';

import { memo } from 'react';
import { 
  Building2, 
  Zap, 
  Home, 
  AlertCircle, 
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface PropertyAnalysis {
  roomType: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Repair';
  amenities: string[];
  features: string[];
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  piEstimate: {
    min: number;
    max: number;
  };
  investmentGrade: string;
  recommendations: string[];
  marketInsight: string;
}

interface PropertyPhotoAnalysisCardProps {
  analysis: PropertyAnalysis;
  language?: 'en' | 'ar';
  onInvest?: () => void;
}

const labels = {
  en: {
    detected: 'Property Detected',
    roomType: 'Room Type',
    condition: 'Condition',
    amenities: 'Amenities Found',
    features: 'Key Features',
    priceUSD: 'Estimated Price (USD)',
    pricePI: 'In Pi Network',
    investmentGrade: 'Investment Grade',
    recommendations: 'Smart Recommendations',
    marketInsight: 'Market Insight',
    perSqm: 'per m²',
    investNow: 'Invest Now',
  },
  ar: {
    detected: 'تم اكتشاف العقار',
    roomType: 'نوع الغرفة',
    condition: 'الحالة',
    amenities: 'المرافق المكتشفة',
    features: 'الميزات الرئيسية',
    priceUSD: 'السعر المقدر (دولار)',
    pricePI: 'في شبكة Pi',
    investmentGrade: 'درجة الاستثمار',
    recommendations: 'التوصيات الذكية',
    marketInsight: 'ملاحظة السوق',
    perSqm: 'لكل م²',
    investNow: 'استثمر الآن',
  },
};

const conditionColors = {
  'Excellent': { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400' },
  'Good': { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' },
  'Fair': { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400' },
  'Needs Repair': { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' },
};

const gradeColors: Record<string, string> = {
  'A+': 'bg-emerald-500 text-white',
  'A': 'bg-green-500 text-white',
  'B': 'bg-amber-500 text-white',
  'C': 'bg-red-500 text-white',
};

export default memo(function PropertyPhotoAnalysisCard({
  analysis,
  language = 'en',
  onInvest,
}: PropertyPhotoAnalysisCardProps) {
  const currentLabels = labels[language];
  const conditionStyle = conditionColors[analysis.condition];

  return (
    <div className="bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-900/60 border border-amber-500/20 rounded-xl p-5 space-y-4">
      {/* Header with Detected Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-amber-400/70 font-medium">{currentLabels.detected}</p>
            <p className="text-sm font-semibold text-white">{analysis.roomType}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${gradeColors[analysis.investmentGrade]}`}>
          {analysis.investmentGrade}
        </div>
      </div>

      {/* Condition Badge */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${conditionStyle.bg} ${conditionStyle.border}`}>
        {analysis.condition === 'Excellent' || analysis.condition === 'Good' ? (
          <CheckCircle2 className={`w-4 h-4 ${conditionStyle.text}`} />
        ) : (
          <AlertCircle className={`w-4 h-4 ${conditionStyle.text}`} />
        )}
        <div>
          <p className={`text-xs font-medium ${conditionStyle.text}`}>{currentLabels.condition}</p>
          <p className={`text-sm font-semibold ${conditionStyle.text}`}>{analysis.condition}</p>
        </div>
      </div>

      {/* Amenities Grid */}
      {analysis.amenities.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">{currentLabels.amenities}</p>
          <div className="grid grid-cols-2 gap-2">
            {analysis.amenities.slice(0, 4).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2 border border-amber-500/10">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                <p className="text-xs text-slate-300 line-clamp-1">{amenity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Highlight */}
      {analysis.features.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">{currentLabels.features}</p>
          <div className="space-y-1.5">
            {analysis.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0"></div>
                <span className="line-clamp-1">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Cards */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {/* USD Price */}
        <div className="bg-slate-800/60 border border-amber-500/20 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">{currentLabels.priceUSD}</p>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-amber-400">
                ${analysis.priceRange.min.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">-</span>
              <span className="text-lg font-bold text-amber-400">
                ${analysis.priceRange.max.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500">{currentLabels.perSqm}</p>
          </div>
        </div>

        {/* Pi Price */}
        <div className="bg-slate-800/60 border border-amber-500/20 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">{currentLabels.pricePI}</p>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-amber-400">
                {analysis.piEstimate.min.toLocaleString()}π
              </span>
              <span className="text-xs text-slate-500">-</span>
              <span className="text-lg font-bold text-amber-400">
                {analysis.piEstimate.max.toLocaleString()}π
              </span>
            </div>
            <p className="text-xs text-slate-500">Fractional</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-slate-800/40 border border-cyan-500/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <p className="text-xs font-semibold text-cyan-400 uppercase">{currentLabels.recommendations}</p>
          </div>
          <ul className="space-y-1">
            {analysis.recommendations.slice(0, 2).map((rec, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex gap-2">
                <span className="text-cyan-400">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Market Insight */}
      {analysis.marketInsight && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-emerald-400 mb-1">{currentLabels.marketInsight}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{analysis.marketInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Button */}
      {onInvest && (
        <button
          onClick={onInvest}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 text-sm"
        >
          {currentLabels.investNow}
        </button>
      )}
    </div>
  );
});
