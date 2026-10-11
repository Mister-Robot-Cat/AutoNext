import React, { useId } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type GaugeType = 'semicircle' | 'half' | 'radial' | 'circle';

export interface GaugeThreshold {
  /** Upper bound value for this color band */
  threshold: number;
  /** Color string (hex, rgb, hsl, or CSS variable) */
  color: string;
  /** Optional descriptor (e.g. 'Poor', 'Fair', 'Great') */
  label?: string;
}

export interface GaugeSegment {
  /** Minimum value for this segment (defaults to previous segment's max or gauge min) */
  min?: number;
  /** Maximum value for this segment */
  max: number;
  /** Segment stroke color */
  color: string;
  /** Optional segment label */
  label?: string;
}

export interface GaugeProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'color' | 'children'> {
  /** Current metric value */
  value: number;
  /** Minimum value on scale (default: 0) */
  min?: number;
  /** Maximum value on scale (default: 100) */
  max?: number;
  /** Diameter or bounding width in pixels (default: 160) */
  size?: number;
  /** Stroke thickness in pixels (default: 12) */
  thickness?: number;
  /** Visual type: 'semicircle' / 'half' (180°), 'radial' (270° open arc), or 'circle' (360° ring) (default: 'semicircle') */
  type?: GaugeType;
  /** Custom start angle in degrees (overrides type default) */
  startAngle?: number;
  /** Custom end angle in degrees (overrides type default) */
  endAngle?: number;
  /** Static stroke color for progress arc */
  color?: string;
  /** Automatically determine color based on value bands (rose/amber/emerald) */
  autoColor?: boolean;
  /** Threshold ranges to dynamically color the arc according to value */
  colorThresholds?: GaugeThreshold[];
  /** Segmented track regions */
  segments?: GaugeSegment[];
  /** Background track color (default: 'rgba(148, 163, 184, 0.2)') */
  trackColor?: string;
  /** Whether to use rounded stroke caps (default: true) */
  roundedCaps?: boolean;
  /** Whether to enable gradient stroke (default: false) */
  gradient?: boolean;
  /** Gradient start and stop colors [start, stop] */
  gradientColors?: [string, string];
  /** Whether to display an automotive needle pointer (default: false) */
  showNeedle?: boolean;
  /** Color of the needle pointer (default: '#ef4444') */
  needleColor?: string;
  /** Whether to render the center numerical value (default: true) */
  showValue?: boolean;
  /** Custom formatter for the displayed value */
  valueFormatter?: (value: number, percentage: number) => React.ReactNode;
  /** Unit suffix displayed next to value (e.g. '%', '₼', 'km/h') */
  unit?: string;
  /** Primary label displayed in gauge (e.g. 'AutoValue™', 'Confidence') */
  label?: React.ReactNode;
  /** Secondary subtitle / hint */
  sublabel?: React.ReactNode;
  /** Whether to display tick marks along arc (default: false) */
  showTicks?: boolean;
  /** Number of tick marks (default: 5) */
  ticksCount?: number;
  /** Custom children to override center content */
  children?: React.ReactNode;
  /** Container CSS class name */
  className?: string;
}

/**
 * Converts polar coordinates (angle in degrees, radius) to Cartesian (x, y) coordinates.
 * 0° corresponds to 3 o'clock (positive X axis), 90° to 6 o'clock (+Y axis),
 * 180° to 9 o'clock (-X axis), and 270° to 12 o'clock (-Y axis).
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

/**
 * Builds an SVG path string for an arc from startAngle to endAngle (clockwise).
 */
export function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const angleDelta = endAngle - startAngle;

  if (angleDelta <= 0.001) {
    return '';
  }

  // Handle full circle
  if (Math.abs(angleDelta) >= 359.99) {
    const midAngle = startAngle + 180;
    const p1 = polarToCartesian(cx, cy, radius, startAngle);
    const p2 = polarToCartesian(cx, cy, radius, midAngle);
    return [
      `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
      `A ${radius} ${radius} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
      `A ${radius} ${radius} 0 0 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    ].join(' ');
  }

  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = angleDelta > 180 ? 1 : 0;
  const sweepFlag = 1; // clockwise

  return [
    `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
  ].join(' ');
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  min = 0,
  max = 100,
  size = 160,
  thickness = 12,
  type = 'semicircle',
  startAngle: customStartAngle,
  endAngle: customEndAngle,
  color,
  autoColor = false,
  colorThresholds,
  segments,
  trackColor = 'rgba(148, 163, 184, 0.2)',
  roundedCaps = true,
  gradient = false,
  gradientColors,
  showNeedle = false,
  needleColor = '#ef4444',
  showValue = true,
  valueFormatter,
  unit,
  label,
  sublabel,
  showTicks = false,
  ticksCount = 5,
  children,
  className,
  'aria-label': ariaLabel,
  ...svgProps
}) => {
  const gradientId = useId();

  // Clamp value between min and max
  const clampedValue = Math.min(Math.max(value, min), max);
  const valueRange = max - min || 1;
  const ratio = (clampedValue - min) / valueRange;
  const percentage = Math.round(ratio * 100);

  // Determine angle bounds
  const isHalfOrSemicircle = type === 'semicircle' || type === 'half';
  let defaultStartAngle = 180;
  let defaultEndAngle = 360;

  if (type === 'radial') {
    defaultStartAngle = 135;
    defaultEndAngle = 405; // 270° sweep
  } else if (type === 'circle') {
    defaultStartAngle = 270;
    defaultEndAngle = 630; // 360° sweep
  }

  const startAngle = customStartAngle ?? defaultStartAngle;
  const endAngle = customEndAngle ?? defaultEndAngle;
  const totalSweep = endAngle - startAngle;
  const currentAngle = startAngle + ratio * totalSweep;

  // Geometry dimensions
  const padding = 8;
  const radius = Math.max((size - padding * 2 - thickness) / 2, 4);
  const cx = size / 2;

  // For semicircle/half, center Y can be positioned so the arc occupies the upper area
  const cy = size / 2;
  const svgHeight = isHalfOrSemicircle ? Math.ceil(size / 2 + thickness + padding) : size;

  // Resolve color
  let activeColor = color;
  if (!activeColor && colorThresholds && colorThresholds.length > 0) {
    const sortedThresholds = [...colorThresholds].sort((a, b) => a.threshold - b.threshold);
    const matched = sortedThresholds.find((t) => clampedValue <= t.threshold);
    activeColor = matched ? matched.color : sortedThresholds[sortedThresholds.length - 1].color;
  } else if (!activeColor && autoColor) {
    if (clampedValue <= min + valueRange * 0.4) {
      activeColor = '#f43f5e'; // rose/red
    } else if (clampedValue <= min + valueRange * 0.7) {
      activeColor = '#f59e0b'; // amber
    } else {
      activeColor = '#10b981'; // emerald
    }
  }
  if (!activeColor) {
    activeColor = '#3b82f6'; // default blue
  }

  const resolvedGradientColors = gradientColors || [activeColor, '#10b981'];

  // Arc paths
  const trackPath = describeArc(cx, cy, radius, startAngle, endAngle);
  const progressPath = describeArc(cx, cy, radius, startAngle, currentAngle);

  // Needle path calculation
  const needleLength = Math.max(radius - thickness / 2 - 2, 8);
  const needleTip = polarToCartesian(cx, cy, needleLength, currentAngle);
  const needleBase1 = polarToCartesian(cx, cy, 4, currentAngle - 90);
  const needleBase2 = polarToCartesian(cx, cy, 4, currentAngle + 90);
  const needleTail = polarToCartesian(cx, cy, 6, currentAngle + 180);
  const needlePath = `M ${needleBase1.x.toFixed(2)} ${needleBase1.y.toFixed(2)} L ${needleTip.x.toFixed(2)} ${needleTip.y.toFixed(2)} L ${needleBase2.x.toFixed(2)} ${needleBase2.y.toFixed(2)} L ${needleTail.x.toFixed(2)} ${needleTail.y.toFixed(2)} Z`;

  // Tick marks
  const ticks: { x1: number; y1: number; x2: number; y2: number; key: number }[] = [];
  if (showTicks && ticksCount > 1) {
    for (let i = 0; i < ticksCount; i++) {
      const tickAngle = startAngle + (i / (ticksCount - 1)) * totalSweep;
      const innerR = radius + thickness / 2 + 2;
      const outerR = radius + thickness / 2 + (i % 2 === 0 ? 6 : 4);
      const p1 = polarToCartesian(cx, cy, innerR, tickAngle);
      const p2 = polarToCartesian(cx, cy, outerR, tickAngle);
      ticks.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, key: i });
    }
  }

  // Display text sizing
  const valueTextSize = size < 90
    ? 'text-xs font-bold'
    : size < 130
    ? 'text-base font-bold'
    : 'text-2xl sm:text-3xl font-black';

  const labelTextSize = size < 90
    ? 'text-[8px]'
    : size < 130
    ? 'text-[10px]'
    : 'text-xs';

  const formattedValue = valueFormatter
    ? valueFormatter(clampedValue, percentage)
    : Math.round(clampedValue);

  return (
    <div
      className={cn(
        'relative inline-flex flex-col items-center select-none',
        className
      )}
      data-testid="gauge-container"
    >
      <svg
        width={size}
        height={svgHeight}
        viewBox={`0 0 ${size} ${svgHeight}`}
        role="meter"
        aria-valuenow={clampedValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={
          typeof label === 'string'
            ? label
            : ariaLabel || 'Valuation gauge meter'
        }
        className="overflow-visible"
        data-testid="gauge"
        {...svgProps}
      >
        <defs>
          {gradient && (
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={resolvedGradientColors[0]} />
              <stop offset="100%" stopColor={resolvedGradientColors[1]} />
            </linearGradient>
          )}
        </defs>

        {/* Segmented Track or Base Track */}
        {segments && segments.length > 0 ? (
          <g data-testid="gauge-segments">
            {segments.map((seg, idx) => {
              const segMin = seg.min ?? (idx === 0 ? min : segments[idx - 1].max);
              const segMax = seg.max;
              const segStartRatio = (Math.max(segMin, min) - min) / valueRange;
              const segEndRatio = (Math.min(segMax, max) - min) / valueRange;
              const sAngle = startAngle + segStartRatio * totalSweep;
              const eAngle = startAngle + segEndRatio * totalSweep;
              const segPath = describeArc(cx, cy, radius, sAngle, eAngle);
              return (
                <path
                  key={idx}
                  d={segPath}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={thickness}
                  strokeLinecap="butt"
                  opacity={0.35}
                  data-testid={`gauge-segment-${idx}`}
                />
              );
            })}
          </g>
        ) : (
          <path
            d={trackPath}
            fill="none"
            stroke={trackColor}
            strokeWidth={thickness}
            strokeLinecap={roundedCaps ? 'round' : 'butt'}
            data-testid="gauge-track"
          />
        )}

        {/* Progress Arc */}
        {progressPath && (
          <path
            d={progressPath}
            fill="none"
            stroke={gradient ? `url(#${gradientId})` : activeColor}
            strokeWidth={thickness}
            strokeLinecap={roundedCaps ? 'round' : 'butt'}
            data-testid="gauge-progress"
          />
        )}

        {/* Tick Marks */}
        {ticks.length > 0 && (
          <g data-testid="gauge-ticks">
            {ticks.map((t) => (
              <line
                key={t.key}
                x1={t.x1.toFixed(2)}
                y1={t.y1.toFixed(2)}
                x2={t.x2.toFixed(2)}
                y2={t.y2.toFixed(2)}
                stroke="currentColor"
                className="text-slate-400/60 dark:text-slate-500/60"
                strokeWidth={1.5}
                data-testid={`gauge-tick-${t.key}`}
              />
            ))}
          </g>
        )}

        {/* Automotive Needle */}
        {showNeedle && (
          <g data-testid="gauge-needle">
            <path
              d={needlePath}
              fill={needleColor}
              data-testid="gauge-needle-pointer"
            />
            <circle
              cx={cx}
              cy={cy}
              r={Math.max(thickness / 2.5, 4)}
              fill={needleColor}
            />
            <circle
              cx={cx}
              cy={cy}
              r={Math.max(thickness / 5, 2)}
              fill="#ffffff"
            />
          </g>
        )}
      </svg>

      {/* Center / Bottom Content */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center pointer-events-none',
          isHalfOrSemicircle
            ? 'justify-end pb-1'
            : 'justify-center'
        )}
        data-testid="gauge-content"
      >
        {children ? (
          children
        ) : (
          <>
            {showValue && (
              <div className="flex items-baseline gap-0.5 leading-none">
                <span
                  className={cn('text-slate-900 dark:text-white', valueTextSize)}
                  data-testid="gauge-value"
                >
                  {formattedValue}
                </span>
                {unit && (
                  <span
                    className={cn('font-semibold text-slate-500 dark:text-slate-400', labelTextSize)}
                    data-testid="gauge-unit"
                  >
                    {unit}
                  </span>
                )}
              </div>
            )}

            {label && (
              <span
                className={cn('font-medium text-slate-500 dark:text-slate-400 text-center leading-tight mt-0.5', labelTextSize)}
                data-testid="gauge-label"
              >
                {label}
              </span>
            )}

            {sublabel && (
              <span
                className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight mt-0.5"
                data-testid="gauge-sublabel"
              >
                {sublabel}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
