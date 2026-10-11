import React, { useId } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SparklineProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'fill'> {
  /** Numeric values to plot on the sparkline */
  data: number[];
  /** SVG viewBox width in pixels (default: 120) */
  width?: number;
  /** SVG viewBox height in pixels (default: 36) */
  height?: number;
  /** Stroke width in pixels (default: 2) */
  strokeWidth?: number;
  /** Stroke color (default: 'currentColor' or autoColorTrend) */
  strokeColor?: string;
  /** Whether to render a translucent gradient fill under the line (default: false) */
  fill?: boolean;
  /** Fill opacity from 0 to 1 (default: 0.15) */
  fillOpacity?: number;
  /** Interpolation type: 'smooth' (cubic bezier) or 'linear' (default: 'smooth') */
  curve?: 'smooth' | 'linear';
  /** Whether to render a highlight marker dot on the final data point (default: false) */
  showLastPoint?: boolean;
  /** Radius of the last point circle marker (default: 3) */
  lastPointRadius?: number;
  /** Automatically detect trend (first vs last) and color stroke accordingly (default: false) */
  autoColorTrend?: boolean;
  /** Stroke color applied when trend is positive / up (default: '#10b981') */
  positiveColor?: string;
  /** Stroke color applied when trend is negative / down (default: '#f43f5e') */
  negativeColor?: string;
  /** Stroke color applied when trend is flat / neutral (default: '#06b6d4') */
  neutralColor?: string;
  /** Inset padding so stroke edges aren't clipped (default: 4) */
  padding?: number;
  /** Accessible title or label */
  title?: string;
}

/**
 * Calculates a smooth SVG path using cubic Bezier curves between coordinates.
 */
function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length <= 1) return '';
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const prev = points[i - 1] || current;
    const nextNext = points[i + 2] || next;

    // Catmull-Rom to Cubic Bezier control points conversion
    const tension = 0.2;
    const cp1x = current.x + (next.x - prev.x) * tension;
    const cp1y = current.y + (next.y - prev.y) * tension;
    const cp2x = next.x - (nextNext.x - current.x) * tension;
    const cp2y = next.y - (nextNext.y - current.y) * tension;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
  }

  return d;
}

/**
 * Calculates a standard polyline SVG path.
 */
function createLinearPath(points: { x: number; y: number }[]): string {
  return points.reduce((acc, point, index) => {
    return index === 0
      ? `M ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
      : `${acc} L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }, '');
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 120,
  height = 36,
  strokeWidth = 2,
  strokeColor,
  fill = false,
  fillOpacity = 0.15,
  curve = 'smooth',
  showLastPoint = false,
  lastPointRadius = 3,
  autoColorTrend = false,
  positiveColor = '#10b981',
  negativeColor = '#f43f5e',
  neutralColor = '#06b6d4',
  padding = 4,
  title,
  className,
  ...svgProps
}) => {
  const gradientId = useId();

  // Handle empty or invalid data gracefully
  if (!data || data.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn('overflow-visible opacity-40', className)}
        role="img"
        aria-label={title || 'Empty sparkline'}
        data-testid="sparkline-empty"
        {...svgProps}
      >
        {title && <title>{title}</title>}
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="2,2"
        />
      </svg>
    );
  }

  // Handle single data point
  if (data.length === 1) {
    const singleY = height / 2;
    const singleX = width / 2;
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn('overflow-visible', className)}
        role="img"
        aria-label={title || 'Single value sparkline'}
        data-testid="sparkline-single"
        {...svgProps}
      >
        {title && <title>{title}</title>}
        <circle cx={singleX} cy={singleY} r={lastPointRadius} fill={strokeColor || neutralColor} />
      </svg>
    );
  }

  // Determine trend color if autoColorTrend is enabled
  let resolvedColor = strokeColor;
  if (autoColorTrend) {
    const firstVal = data[0];
    const lastVal = data[data.length - 1];
    if (lastVal > firstVal) {
      resolvedColor = positiveColor;
    } else if (lastVal < firstVal) {
      resolvedColor = negativeColor;
    } else {
      resolvedColor = neutralColor;
    }
  } else if (!resolvedColor) {
    resolvedColor = 'currentColor';
  }

  // Calculate coordinates
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const valRange = maxVal - minVal;

  const innerWidth = Math.max(width - padding * 2, 1);
  const innerHeight = Math.max(height - padding * 2, 1);

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * innerWidth;
    // When range is 0 (all values equal), position at the vertical center
    const y = valRange === 0
      ? height / 2
      : height - padding - ((val - minVal) / valRange) * innerHeight;
    return { x, y };
  });

  const linePath = curve === 'smooth' ? createSmoothPath(points) : createLinearPath(points);

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const bottomY = height - padding;
  const areaPath = `${linePath} L ${lastPoint.x.toFixed(2)} ${bottomY} L ${firstPoint.x.toFixed(2)} ${bottomY} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
      role="img"
      aria-label={title || 'Sparkline chart'}
      data-testid="sparkline"
      {...svgProps}
    >
      {title && <title>{title}</title>}
      <defs>
        {fill && (
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={resolvedColor} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={resolvedColor} stopOpacity={0} />
          </linearGradient>
        )}
      </defs>

      {fill && (
        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
          data-testid="sparkline-area"
        />
      )}

      <path
        d={linePath}
        fill="none"
        stroke={resolvedColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        data-testid="sparkline-line"
      />

      {showLastPoint && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={lastPointRadius}
          fill={resolvedColor}
          data-testid="sparkline-last-point"
        />
      )}
    </svg>
  );
};
