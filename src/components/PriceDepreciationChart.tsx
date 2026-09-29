import React, { useState } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import { calculateDepreciationForecast, DepreciationPoint } from '../utils/depreciation';
import { formatPrice } from '../utils/i18n';
import { TrendingDown, ShieldCheck, Info, Sparkles } from 'lucide-react';

interface PriceDepreciationChartProps {
  vehicle: Vehicle;
  currency: Currency;
  lang: Language;
}

export const PriceDepreciationChart: React.FC<PriceDepreciationChartProps> = ({
  vehicle,
  currency,
  lang,
}) => {
  const forecast = calculateDepreciationForecast(vehicle.priceAzn, vehicle.make, vehicle.year);
  const [activePointIndex, setActivePointIndex] = useState<number>(0);
  const activePoint = forecast.points[activePointIndex];

  // SVG Chart Dimensions
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const minPrice = Math.min(...forecast.points.map((p) => p.projectedPriceAzn));
  const maxPrice = Math.max(...forecast.points.map((p) => p.projectedPriceAzn));
  const priceRange = maxPrice - minPrice || 1;

  // Convert points to SVG coordinates
  const svgPoints = forecast.points.map((p, idx) => {
    const x = paddingX + (idx / (forecast.points.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((p.projectedPriceAzn - minPrice) / priceRange) * (height - paddingY * 2);
    return { x, y, point: p, idx };
  });

  const pathD = svgPoints.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${height - paddingY} L ${svgPoints[0].x} ${height - paddingY} Z`;

  return (
    <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">Dəyər İtkisi & Resale Proqnozu (5 İl)</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {forecast.annualRatePercent}% illik orta
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{forecast.retentionSummaryText}</p>
        </div>

        {/* Resale score badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300">Likvidlik dərəcəsi: </span>
          <strong className="text-emerald-400 uppercase font-bold text-[11px]">{forecast.resaleScore}</strong>
        </div>
      </div>

      {/* Interactive SVG Curve */}
      <div className="relative w-full overflow-hidden bg-slate-900/50 rounded-xl p-2 border border-slate-800/80">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="depreciationGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((pct) => (
            <line
              key={pct}
              x1={paddingX}
              y1={paddingY + pct * (height - paddingY * 2)}
              x2={width - paddingX}
              y2={paddingY + pct * (height - paddingY * 2)}
              stroke="#334155"
              strokeDasharray="4 4"
              strokeWidth="0.8"
            />
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#depreciationGrad)" />

          {/* Line stroke */}
          <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points */}
          {svgPoints.map((pt) => {
            const isActive = pt.idx === activePointIndex;
            return (
              <g
                key={pt.idx}
                className="cursor-pointer"
                onMouseEnter={() => setActivePointIndex(pt.idx)}
                onClick={() => setActivePointIndex(pt.idx)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 6 : 4}
                  className={`transition-all ${
                    isActive ? 'fill-cyan-300 stroke-cyan-500 stroke-4' : 'fill-slate-900 stroke-cyan-400 stroke-2'
                  }`}
                />
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {pt.point.calendarYear}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active Point Detail Pill */}
      {activePoint && (
        <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-slate-400">{activePoint.calendarYear}-ci ildə proqnozlaşdırılan bazar dəyəri: </span>
            <strong className="text-base text-cyan-300 font-black">
              {formatPrice(activePoint.projectedPriceAzn, currency)}
            </strong>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>
              Qorunan dəyər: <strong className="text-emerald-400">{activePoint.retainedPercent}%</strong>
            </span>
            {activePoint.annualLossAzn > 0 && (
              <span>
                İllik itki: <strong className="text-amber-400">-{formatPrice(activePoint.annualLossAzn, currency)}</strong>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
