import React from 'react';
import { MarketPriceValuation, Language } from '../types/vehicle';
import { TRANSLATIONS } from '../utils/i18n';
import { TrendingDown, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';

interface FairPriceBadgeProps {
  valuation: MarketPriceValuation;
  lang: Language;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const FairPriceBadge: React.FC<FairPriceBadgeProps> = ({
  valuation,
  lang,
  size = 'md',
  showDetails = false,
}) => {
  const t = TRANSLATIONS[lang];
  const { status, percentageDiff } = valuation;

  let colorClasses = '';
  let icon = null;
  let text = '';

  switch (status) {
    case 'great_deal':
      colorClasses = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      icon = <TrendingDown className="w-3.5 h-3.5" />;
      text = `${t.fairPriceBadge} (${Math.abs(percentageDiff)}% ${t.diffBelowMarket})`;
      break;
    case 'good_deal':
      colorClasses = 'bg-sky-500/15 text-sky-400 border border-sky-500/30';
      icon = <TrendingDown className="w-3.5 h-3.5" />;
      text = `${t.goodDealBadge} (${Math.abs(percentageDiff)}% ${t.diffBelowMarket})`;
      break;
    case 'fair_price':
      colorClasses = 'bg-slate-700/50 text-slate-300 border border-slate-600/40';
      icon = <CheckCircle2 className="w-3.5 h-3.5" />;
      text = t.fairMarketBadge;
      break;
    case 'overpriced':
      colorClasses = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      icon = <AlertTriangle className="w-3.5 h-3.5" />;
      text = `${t.overpricedBadge} (+${percentageDiff}% ${t.diffAboveMarket})`;
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <div className="inline-flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1.5 rounded-full backdrop-blur-md transition-all shadow-sm ${sizeClasses} ${colorClasses}`}>
        {icon}
        <span>{text}</span>
      </span>

      {showDetails && (
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <span>AI Dəqiqlik dərəcəsi:</span>
          <span className="text-emerald-400 font-semibold">{valuation.confidenceScore}%</span>
        </span>
      )}
    </div>
  );
};
