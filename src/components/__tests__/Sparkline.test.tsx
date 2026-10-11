import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Sparkline } from '../Sparkline';

describe('Sparkline Component', () => {
  it('renders fallback line for empty data array', () => {
    render(<Sparkline data={[]} />);
    expect(screen.getByTestId('sparkline-empty')).toBeInTheDocument();
  });

  it('renders single point marker for single item array', () => {
    render(<Sparkline data={[50]} />);
    expect(screen.getByTestId('sparkline-single')).toBeInTheDocument();
  });

  it('renders flat line when all data points have the same value', () => {
    render(<Sparkline data={[10, 10, 10, 10]} />);
    const sparkline = screen.getByTestId('sparkline');
    expect(sparkline).toBeInTheDocument();
    const line = screen.getByTestId('sparkline-line');
    expect(line).toBeInTheDocument();
    expect(line.getAttribute('d')).not.toContain('NaN');
  });

  it('renders smooth curve by default', () => {
    const data = [10, 25, 18, 30, 45];
    render(<Sparkline data={data} />);
    const line = screen.getByTestId('sparkline-line');
    expect(line.getAttribute('d')).toContain('C');
  });

  it('renders linear polyline when curve="linear"', () => {
    const data = [10, 25, 18, 30, 45];
    render(<Sparkline data={data} curve="linear" />);
    const line = screen.getByTestId('sparkline-line');
    expect(line.getAttribute('d')).not.toContain('C');
    expect(line.getAttribute('d')).toContain('L');
  });

  it('renders gradient area fill when fill=true', () => {
    const data = [10, 20, 15, 35];
    render(<Sparkline data={data} fill={true} />);
    expect(screen.getByTestId('sparkline-area')).toBeInTheDocument();
  });

  it('does not render gradient area fill when fill=false', () => {
    const data = [10, 20, 15, 35];
    render(<Sparkline data={data} fill={false} />);
    expect(screen.queryByTestId('sparkline-area')).not.toBeInTheDocument();
  });

  it('renders last point marker when showLastPoint=true', () => {
    const data = [10, 20, 15, 35];
    render(<Sparkline data={data} showLastPoint={true} />);
    expect(screen.getByTestId('sparkline-last-point')).toBeInTheDocument();
  });

  it('applies positive color when autoColorTrend=true and trend is upwards', () => {
    const data = [10, 15, 25, 40];
    render(
      <Sparkline
        data={data}
        autoColorTrend={true}
        positiveColor="#00ff00"
        negativeColor="#ff0000"
      />
    );
    const line = screen.getByTestId('sparkline-line');
    expect(line.getAttribute('stroke')).toBe('#00ff00');
  });

  it('applies negative color when autoColorTrend=true and trend is downwards', () => {
    const data = [40, 30, 20, 10];
    render(
      <Sparkline
        data={data}
        autoColorTrend={true}
        positiveColor="#00ff00"
        negativeColor="#ff0000"
      />
    );
    const line = screen.getByTestId('sparkline-line');
    expect(line.getAttribute('stroke')).toBe('#ff0000');
  });

  it('applies neutral color when autoColorTrend=true and trend is flat', () => {
    const data = [20, 35, 10, 20];
    render(
      <Sparkline
        data={data}
        autoColorTrend={true}
        neutralColor="#123456"
      />
    );
    const line = screen.getByTestId('sparkline-line');
    expect(line.getAttribute('stroke')).toBe('#123456');
  });

  it('applies custom dimensions, title, and accessible attributes', () => {
    const data = [5, 10, 15];
    render(
      <Sparkline
        data={data}
        width={200}
        height={60}
        title="Price Trend 2026"
        className="custom-sparkline"
      />
    );
    const svg = screen.getByTestId('sparkline');
    expect(svg.getAttribute('width')).toBe('200');
    expect(svg.getAttribute('height')).toBe('60');
    expect(svg.getAttribute('aria-label')).toBe('Price Trend 2026');
    expect(screen.getByText('Price Trend 2026')).toBeInTheDocument();
    expect(svg.classList.contains('custom-sparkline')).toBe(true);
  });
});
