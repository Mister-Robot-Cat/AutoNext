import React, { useState, useId } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BarChartDataPoint {
  /** Unique key or identifier */
  id?: string | number;
  /** Category or bracket label (e.g. "50k - 55k ₼", "BMW 3 Series") */
  label: string;
  /** Primary metric value (e.g. count of listings, price, volume) */
  value: number;
  /** Optional secondary comparison value */
  secondaryValue?: number;
  /** Custom fill color for this specific bar */
  color?: string;
  /** Whether this bar is highlighted (e.g. current vehicle's price bracket) */
  highlighted?: boolean;
  /** Sublabel or hint (e.g. "Cari elan", "Bazar medianı") */
  sublabel?: string;
  /** Custom tooltip content */
  tooltip?: React.ReactNode;
}

export interface BarChartReferenceLine {
  /** Metric value where reference line is drawn */
  value: number;
  /** Text label displayed next to or above the reference line */
  label?: string;
  /** Stroke color for the reference line (default: '#f59e0b') */
  color?: string;
  /** Stroke dasharray (default: '4 4') */
  strokeDasharray?: string;
}

export interface BarChartProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'color' | 'children'> {
  /** Array of data points to plot */
  data: BarChartDataPoint[];
  /** SVG viewBox width in pixels (default: 520) */
  width?: number;
  /** SVG viewBox height in pixels (default: 200) */
  height?: number;
  /** Chart orientation: vertical columns or horizontal bars (default: 'vertical') */
  orientation?: 'vertical' | 'horizontal';
  /** Base bar fill color (default: '#3b82f6') */
  barColor?: string;
  /** Accent fill color for highlighted bar (default: '#10b981') */
  highlightColor?: string;
  /** Optional reference lines (e.g. market average) */
  referenceLines?: BarChartReferenceLine[];
  /** Whether to show subtle background grid lines (default: true) */
  showGrid?: boolean;
  /** Number of grid division lines (default: 4) */
  gridCount?: number;
  /** Whether to render axis category labels (default: true) */
  showLabels?: boolean;
  /** Whether to display numerical values on/above bars (default: false) */
  showValues?: boolean;
  /** Formatter function for values */
  valueFormatter?: (value: number) => string;
  /** Rounded corner radius on bars (default: 4) */
  barRadius?: number;
  /** Bar thickness ratio relative to slot width (0.2 to 0.9, default: 0.65) */
  barRatio?: number;
  /** Maximum bar thickness in pixels (default: 44) */
  maxBarThickness?: number;
  /** Minimum value on scale (default: 0) */
  minValue?: number;
  /** Maximum value on scale (default: auto calculated) */
  maxValue?: number;
  /** Inset padding [top, right, bottom, left] */
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
  /** Controlled active/hovered bar index */
  activeIndex?: number | null;
  /** Callback fired when a bar is clicked */
  onBarClick?: (point: BarChartDataPoint, index: number) => void;
  /** Callback fired when a bar hover state changes */
  onBarHover?: (point: BarChartDataPoint | null, index: number | null) => void;
  /** Placeholder message when data array is empty */
  emptyMessage?: string;
  /** Whether to enable gradient bar shading (default: true) */
  gradient?: boolean;
  /** Additional container CSS class */
  className?: string;
  /** Accessible chart title */
  title?: string;
}

/**
 * Calculates price bracket distribution bins for vehicles.
 * Marks the bucket containing currentPrice as highlighted.
 */
export function generateVehiclePriceDistribution(params: {
  currentPrice: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  bucketsCount?: number;
  currencySymbol?: string;
}): BarChartDataPoint[] {
  const {
    currentPrice,
    avgPrice,
    minPrice,
    maxPrice,
    bucketsCount = 5,
    currencySymbol = '₼',
  } = params;

  const effectiveMin = Math.floor(Math.min(minPrice, currentPrice * 0.85) / 1000) * 1000;
  const effectiveMax = Math.ceil(Math.max(maxPrice, currentPrice * 1.15) / 1000) * 1000;
  const range = Math.max(1000, effectiveMax - effectiveMin);
  const step = Math.ceil(range / bucketsCount / 500) * 500;

  const buckets: BarChartDataPoint[] = [];

  for (let i = 0; i < bucketsCount; i++) {
    const bucketStart = effectiveMin + i * step;
    const bucketEnd = bucketStart + step;
    const isLast = i === bucketsCount - 1;

    // Normal distribution curve density centered around avgPrice
    const midpoint = (bucketStart + bucketEnd) / 2;
    const stdDev = range / 3;
    const z = (midpoint - avgPrice) / (stdDev || 1);
    const density = Math.exp(-0.5 * z * z);
    const estimatedCount = Math.max(1, Math.round(density * 18 + Math.sin(i * 1.5) * 2));

    const isCurrentInBucket =
      currentPrice >= bucketStart && (isLast ? currentPrice <= bucketEnd * 1.05 : currentPrice < bucketEnd);

    const formatK = (num: number) => {
      const k = num / 1000;
      return k >= 1 ? `${Math.round(k)}k` : `${num}`;
    };

    buckets.push({
      id: `bracket-${i}`,
      label: `${formatK(bucketStart)}-${formatK(bucketEnd)} ${currencySymbol}`,
      value: estimatedCount,
      highlighted: isCurrentInBucket,
      sublabel: isCurrentInBucket ? 'Cari Avtomobil' : undefined,
    });
  }

  // Ensure at least one bucket is highlighted
  if (!buckets.some((b) => b.highlighted) && buckets.length > 0) {
    let closestIndex = 0;
    let minDistance = Infinity;
    buckets.forEach((_, idx) => {
      const bucketMid = effectiveMin + (idx + 0.5) * step;
      const dist = Math.abs(currentPrice - bucketMid);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });
    buckets[closestIndex].highlighted = true;
    buckets[closestIndex].sublabel = 'Cari Avtomobil';
  }

  return buckets;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 520,
  height = 200,
  orientation = 'vertical',
  barColor = '#3b82f6',
  highlightColor = '#10b981',
  referenceLines = [],
  showGrid = true,
  gridCount = 4,
  showLabels = true,
  showValues = false,
  valueFormatter = (val) => val.toLocaleString(),
  barRadius = 4,
  barRatio = 0.65,
  maxBarThickness = 44,
  minValue = 0,
  maxValue,
  padding: customPadding,
  activeIndex: controlledActiveIndex,
  onBarClick,
  onBarHover,
  emptyMessage = 'Məlumat yoxdur',
  gradient = true,
  className,
  title,
  ...svgProps
}) => {
  const gradientId = useId();
  const highlightGradientId = useId();
  const [internalActiveIndex, setInternalActiveIndex] = useState<number | null>(null);

  const activeIndex = controlledActiveIndex !== undefined ? controlledActiveIndex : internalActiveIndex;

  const defaultPadding =
    orientation === 'vertical'
      ? { top: 24, right: 20, bottom: showLabels ? 36 : 14, left: 32 }
      : { top: 20, right: 36, bottom: 24, left: showLabels ? 96 : 32 };

  const padding = {
    top: customPadding?.top ?? defaultPadding.top,
    right: customPadding?.right ?? defaultPadding.right,
    bottom: customPadding?.bottom ?? defaultPadding.bottom,
    left: customPadding?.left ?? defaultPadding.left,
  };

  const chartW = Math.max(10, width - padding.left - padding.right);
  const chartH = Math.max(10, height - padding.top - padding.bottom);

  // Determine scale boundaries
  const allValues = [
    ...data.map((d) => d.value),
    ...referenceLines.map((r) => r.value),
    minValue,
  ];
  const calculatedMax = maxValue !== undefined ? maxValue : Math.max(...allValues, 1);
  const calculatedMin = minValue;
  const valueSpan = Math.max(1, calculatedMax - calculatedMin);

  const handleMouseEnter = (item: BarChartDataPoint, index: number) => {
    setInternalActiveIndex(index);
    onBarHover?.(item, index);
  };

  const handleMouseLeave = () => {
    setInternalActiveIndex(null);
    onBarHover?.(null, null);
  };

  const handleClick = (item: BarChartDataPoint, index: number) => {
    onBarClick?.(item, index);
  };

  if (!data || data.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center p-6 text-sm text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800', className)}
        data-testid="barchart-empty"
      >
        <span>{emptyMessage}</span>
      </div>
    );
  }

  const isVertical = orientation === 'vertical';

  return (
    <div className={cn('relative w-full overflow-hidden select-none', className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label={title || 'Bar chart'}
        data-testid="barchart"
        {...svgProps}
      >
        <defs>
          {gradient && (
            <>
              <linearGradient id={`${gradientId}-default`} x1="0" y1="0" x2={isVertical ? '0' : '1'} y2={isVertical ? '1' : '0'}>
                <stop offset="0%" stopColor={barColor} stopOpacity="0.95" />
                <stop offset="100%" stopColor={barColor} stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id={`${highlightGradientId}-highlight`} x1="0" y1="0" x2={isVertical ? '0' : '1'} y2={isVertical ? '1' : '0'}>
                <stop offset="0%" stopColor={highlightColor} stopOpacity="1" />
                <stop offset="100%" stopColor={highlightColor} stopOpacity="0.75" />
              </linearGradient>
            </>
          )}
        </defs>

        {/* Background Grid Lines */}
        {showGrid && (
          <g className="grid-lines" data-testid="barchart-grid">
            {Array.from({ length: gridCount + 1 }).map((_, i) => {
              const ratio = i / gridCount;
              if (isVertical) {
                const y = padding.top + chartH * (1 - ratio);
                return (
                  <line
                    key={`grid-y-${i}`}
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartW}
                    y2={y}
                    stroke="rgba(148, 163, 184, 0.15)"
                    strokeDasharray="3 3"
                    strokeWidth="0.8"
                  />
                );
              } else {
                const x = padding.left + chartW * ratio;
                return (
                  <line
                    key={`grid-x-${i}`}
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartH}
                    stroke="rgba(148, 163, 184, 0.15)"
                    strokeDasharray="3 3"
                    strokeWidth="0.8"
                  />
                );
              }
            })}
          </g>
        )}

        {/* Reference Lines (e.g. Market Average) */}
        {referenceLines.map((ref, idx) => {
          const ratio = Math.max(0, Math.min(1, (ref.value - calculatedMin) / valueSpan));
          const lineColor = ref.color || '#f59e0b';
          const dash = ref.strokeDasharray || '4 4';

          if (isVertical) {
            const y = padding.top + chartH * (1 - ratio);
            return (
              <g key={`ref-${idx}`} data-testid="barchart-reference-line">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartW}
                  y2={y}
                  stroke={lineColor}
                  strokeDasharray={dash}
                  strokeWidth="1.5"
                />
                {ref.label && (
                  <g>
                    <rect
                      x={padding.left + chartW - (ref.label.length * 6.5 + 12)}
                      y={y - 18}
                      width={ref.label.length * 6.5 + 8}
                      height={16}
                      rx={3}
                      fill="rgba(15, 23, 42, 0.85)"
                      stroke={lineColor}
                      strokeWidth="0.8"
                    />
                    <text
                      x={padding.left + chartW - (ref.label.length * 6.5 + 8)}
                      y={y - 6}
                      fill={lineColor}
                      fontSize="9"
                      fontWeight="600"
                    >
                      {ref.label}
                    </text>
                  </g>
                )}
              </g>
            );
          } else {
            const x = padding.left + chartW * ratio;
            return (
              <g key={`ref-${idx}`} data-testid="barchart-reference-line">
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartH}
                  stroke={lineColor}
                  strokeDasharray={dash}
                  strokeWidth="1.5"
                />
                {ref.label && (
                  <text
                    x={x + 4}
                    y={padding.top + 12}
                    fill={lineColor}
                    fontSize="9"
                    fontWeight="600"
                  >
                    {ref.label}
                  </text>
                )}
              </g>
            );
          }
        })}

        {/* Bars */}
        <g className="bars" data-testid="barchart-bars">
          {data.map((item, index) => {
            const isHighlighted = !!item.highlighted;
            const isActive = activeIndex === index;

            // Fill color resolution
            let fillColor = item.color;
            if (!fillColor) {
              if (gradient) {
                fillColor = isHighlighted
                  ? `url(#${highlightGradientId}-highlight)`
                  : `url(#${gradientId}-default)`;
              } else {
                fillColor = isHighlighted ? highlightColor : barColor;
              }
            }

            const valRatio = Math.max(0, Math.min(1, (item.value - calculatedMin) / valueSpan));

            if (isVertical) {
              const slotW = chartW / data.length;
              const barW = Math.min(slotW * barRatio, maxBarThickness);
              const x = padding.left + index * slotW + (slotW - barW) / 2;
              const barH = Math.max(3, valRatio * chartH);
              const y = padding.top + chartH - barH;

              return (
                <g
                  key={item.id ?? index}
                  data-testid={`barchart-bar-${index}`}
                  className="transition-all duration-200 cursor-pointer group"
                  onClick={() => handleClick(item, index)}
                  onMouseEnter={() => handleMouseEnter(item, index)}
                  onMouseLeave={handleMouseLeave}
                  tabIndex={0}
                  role="graphics-symbol"
                  aria-label={`${item.label}: ${valueFormatter(item.value)}`}
                >
                  {/* Invisible hit target for smooth hovering */}
                  <rect
                    x={padding.left + index * slotW}
                    y={padding.top}
                    width={slotW}
                    height={chartH + (showLabels ? 24 : 0)}
                    fill="transparent"
                  />

                  {/* Visual Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    rx={barRadius}
                    fill={fillColor}
                    className={cn(
                      'transition-all duration-200',
                      isActive ? 'filter brightness-125 stroke-white/40 stroke-1' : '',
                      isHighlighted ? 'ring-2 ring-emerald-400/50' : ''
                    )}
                  />

                  {/* Highlight indicator pin/badge on top of bar */}
                  {isHighlighted && (
                    <g data-testid={`barchart-highlight-pin-${index}`}>
                      <circle
                        cx={x + barW / 2}
                        cy={y - 8}
                        r={3}
                        fill={highlightColor}
                        className="animate-pulse"
                      />
                    </g>
                  )}

                  {/* Numerical Value on/above Bar */}
                  {showValues && (
                    <text
                      x={x + barW / 2}
                      y={y - (isHighlighted ? 14 : 5)}
                      textAnchor="middle"
                      fill={isActive ? '#ffffff' : 'rgba(203, 213, 225, 0.9)'}
                      fontSize="10"
                      fontWeight="600"
                    >
                      {valueFormatter(item.value)}
                    </text>
                  )}

                  {/* X-Axis Category Label */}
                  {showLabels && (
                    <text
                      x={x + barW / 2}
                      y={padding.top + chartH + 16}
                      textAnchor="middle"
                      fill={isHighlighted ? highlightColor : isActive ? '#ffffff' : '#94a3b8'}
                      fontSize="9.5"
                      fontWeight={isHighlighted || isActive ? '700' : '500'}
                      className="transition-colors duration-150"
                    >
                      {item.label}
                    </text>
                  )}
                </g>
              );
            } else {
              // Horizontal orientation
              const slotH = chartH / data.length;
              const barH = Math.min(slotH * barRatio, maxBarThickness);
              const y = padding.top + index * slotH + (slotH - barH) / 2;
              const barW = Math.max(3, valRatio * chartW);
              const x = padding.left;

              return (
                <g
                  key={item.id ?? index}
                  data-testid={`barchart-bar-${index}`}
                  className="transition-all duration-200 cursor-pointer group"
                  onClick={() => handleClick(item, index)}
                  onMouseEnter={() => handleMouseEnter(item, index)}
                  onMouseLeave={handleMouseLeave}
                  tabIndex={0}
                  role="graphics-symbol"
                  aria-label={`${item.label}: ${valueFormatter(item.value)}`}
                >
                  {/* Invisible hit target */}
                  <rect
                    x={0}
                    y={padding.top + index * slotH}
                    width={width}
                    height={slotH}
                    fill="transparent"
                  />

                  {/* Visual Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    rx={barRadius}
                    fill={fillColor}
                    className={cn(
                      'transition-all duration-200',
                      isActive ? 'filter brightness-125 stroke-white/40 stroke-1' : '',
                      isHighlighted ? 'ring-2 ring-emerald-400/50' : ''
                    )}
                  />

                  {/* Highlight indicator pin */}
                  {isHighlighted && (
                    <circle
                      cx={x + barW + 8}
                      cy={y + barH / 2}
                      r={3}
                      fill={highlightColor}
                      className="animate-pulse"
                      data-testid={`barchart-highlight-pin-${index}`}
                    />
                  )}

                  {/* Numerical Value on/next to Bar */}
                  {showValues && (
                    <text
                      x={x + barW + (isHighlighted ? 16 : 8)}
                      y={y + barH / 2 + 3.5}
                      fill={isActive ? '#ffffff' : 'rgba(203, 213, 225, 0.9)'}
                      fontSize="10"
                      fontWeight="600"
                    >
                      {valueFormatter(item.value)}
                    </text>
                  )}

                  {/* Y-Axis Category Label */}
                  {showLabels && (
                    <text
                      x={padding.left - 8}
                      y={y + barH / 2 + 3.5}
                      textAnchor="end"
                      fill={isHighlighted ? highlightColor : isActive ? '#ffffff' : '#94a3b8'}
                      fontSize="9.5"
                      fontWeight={isHighlighted || isActive ? '700' : '500'}
                      className="transition-colors duration-150"
                    >
                      {item.label}
                    </text>
                  )}
                </g>
              );
            }
          })}
        </g>
      </svg>

      {/* Floating Tooltip when Bar is Active */}
      {activeIndex !== null && data[activeIndex] && (
        <div
          data-testid="barchart-tooltip"
          className="pointer-events-none mt-2 p-2.5 rounded-lg bg-slate-900/95 border border-slate-700/80 text-xs shadow-xl backdrop-blur-sm flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-150"
        >
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <span>{data[activeIndex].label}</span>
              {data[activeIndex].highlighted && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {data[activeIndex].sublabel || 'Seçilmiş'}
                </span>
              )}
            </div>
            {data[activeIndex].sublabel && !data[activeIndex].highlighted && (
              <span className="text-[10px] text-slate-400 block">{data[activeIndex].sublabel}</span>
            )}
          </div>
          <div className="font-extrabold text-blue-400 text-sm">
            {valueFormatter(data[activeIndex].value)}
          </div>
        </div>
      )}
    </div>
  );
};
