import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { Gauge, polarToCartesian, describeArc } from '../Gauge';

describe('Gauge Component', () => {
  it('renders correctly with default props', () => {
    render(<Gauge value={75} />);

    const gauge = screen.getByTestId('gauge');
    expect(gauge).toBeInTheDocument();
    expect(gauge).toHaveAttribute('role', 'meter');
    expect(gauge).toHaveAttribute('aria-valuenow', '75');
    expect(gauge).toHaveAttribute('aria-valuemin', '0');
    expect(gauge).toHaveAttribute('aria-valuemax', '100');

    expect(screen.getByTestId('gauge-track')).toBeInTheDocument();
    expect(screen.getByTestId('gauge-progress')).toBeInTheDocument();
    expect(screen.getByTestId('gauge-value')).toHaveTextContent('75');
  });

  it('clamps value below min and above max', () => {
    const { rerender } = render(<Gauge value={-25} min={0} max={100} />);
    let gauge = screen.getByTestId('gauge');
    expect(gauge).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByTestId('gauge-value')).toHaveTextContent('0');

    rerender(<Gauge value={150} min={0} max={100} />);
    gauge = screen.getByTestId('gauge');
    expect(gauge).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByTestId('gauge-value')).toHaveTextContent('100');
  });

  it('renders different gauge types: semicircle, radial, and circle', () => {
    const { rerender } = render(<Gauge value={50} size={200} type="semicircle" />);
    let gauge = screen.getByTestId('gauge');
    expect(Number(gauge.getAttribute('height'))).toBeLessThan(200);

    rerender(<Gauge value={50} size={200} type="radial" />);
    gauge = screen.getByTestId('gauge');
    expect(gauge.getAttribute('height')).toBe('200');

    rerender(<Gauge value={50} size={200} type="circle" />);
    gauge = screen.getByTestId('gauge');
    expect(gauge.getAttribute('height')).toBe('200');
  });

  it('applies colorThresholds according to value', () => {
    const thresholds = [
      { threshold: 40, color: '#ef4444', label: 'Zəif' },
      { threshold: 70, color: '#f59e0b', label: 'Orta' },
      { threshold: 100, color: '#10b981', label: 'Əla' },
    ];

    const { rerender } = render(
      <Gauge value={30} colorThresholds={thresholds} />
    );
    let progress = screen.getByTestId('gauge-progress');
    expect(progress).toHaveAttribute('stroke', '#ef4444');

    rerender(<Gauge value={65} colorThresholds={thresholds} />);
    progress = screen.getByTestId('gauge-progress');
    expect(progress).toHaveAttribute('stroke', '#f59e0b');

    rerender(<Gauge value={95} colorThresholds={thresholds} />);
    progress = screen.getByTestId('gauge-progress');
    expect(progress).toHaveAttribute('stroke', '#10b981');
  });

  it('applies autoColor bands dynamically when autoColor=true', () => {
    const { rerender } = render(<Gauge value={25} autoColor={true} />);
    let progress = screen.getByTestId('gauge-progress');
    expect(progress).toHaveAttribute('stroke', '#f43f5e');

    rerender(<Gauge value={55} autoColor={true} />);
    progress = screen.getByTestId('gauge-progress');
    expect(progress).toHaveAttribute('stroke', '#f59e0b');

    rerender(<Gauge value={90} autoColor={true} />);
    progress = screen.getByTestId('gauge-progress');
    expect(progress).toHaveAttribute('stroke', '#10b981');
  });

  it('supports type="half" as alias for semicircle', () => {
    render(<Gauge value={50} size={180} type="half" />);
    const gauge = screen.getByTestId('gauge');
    expect(Number(gauge.getAttribute('height'))).toBeLessThan(180);
  });

  it('renders segmented track when segments are provided', () => {
    const segments = [
      { max: 30, color: '#ef4444' },
      { max: 70, color: '#f59e0b' },
      { max: 100, color: '#10b981' },
    ];

    render(<Gauge value={60} segments={segments} />);
    expect(screen.getByTestId('gauge-segments')).toBeInTheDocument();
    expect(screen.getByTestId('gauge-segment-0')).toBeInTheDocument();
    expect(screen.getByTestId('gauge-segment-1')).toBeInTheDocument();
    expect(screen.getByTestId('gauge-segment-2')).toBeInTheDocument();
    expect(screen.queryByTestId('gauge-track')).not.toBeInTheDocument();
  });

  it('renders gradient stroke when gradient=true', () => {
    render(
      <Gauge
        value={80}
        gradient={true}
        gradientColors={['#3b82f6', '#10b981']}
      />
    );
    const progress = screen.getByTestId('gauge-progress');
    expect(progress.getAttribute('stroke')).toContain('url(#');
  });

  it('renders automotive needle when showNeedle=true', () => {
    render(<Gauge value={85} showNeedle={true} needleColor="#dc2626" />);
    expect(screen.getByTestId('gauge-needle')).toBeInTheDocument();
    const pointer = screen.getByTestId('gauge-needle-pointer');
    expect(pointer).toHaveAttribute('fill', '#dc2626');
  });

  it('renders tick marks when showTicks=true', () => {
    render(<Gauge value={50} showTicks={true} ticksCount={5} />);
    expect(screen.getByTestId('gauge-ticks')).toBeInTheDocument();
    expect(screen.getByTestId('gauge-tick-0')).toBeInTheDocument();
    expect(screen.getByTestId('gauge-tick-4')).toBeInTheDocument();
  });

  it('formats displayed value with custom valueFormatter and renders unit, label, sublabel', () => {
    render(
      <Gauge
        value={92.4}
        unit="%"
        label="AutoValue™ Qiymətləndirmə"
        sublabel="Bazar dəyərindən yüksək"
        valueFormatter={(val) => val.toFixed(1)}
      />
    );

    expect(screen.getByTestId('gauge-value')).toHaveTextContent('92.4');
    expect(screen.getByTestId('gauge-unit')).toHaveTextContent('%');
    expect(screen.getByTestId('gauge-label')).toHaveTextContent('AutoValue™ Qiymətləndirmə');
    expect(screen.getByTestId('gauge-sublabel')).toHaveTextContent('Bazar dəyərindən yüksək');
  });

  it('hides value when showValue=false', () => {
    render(<Gauge value={50} showValue={false} />);
    expect(screen.queryByTestId('gauge-value')).not.toBeInTheDocument();
  });

  it('renders custom children when provided', () => {
    render(
      <Gauge value={80}>
        <div data-testid="custom-center-metric">Custom 80/100</div>
      </Gauge>
    );

    expect(screen.getByTestId('custom-center-metric')).toBeInTheDocument();
    expect(screen.queryByTestId('gauge-value')).not.toBeInTheDocument();
  });

  describe('math utilities: polarToCartesian & describeArc', () => {
    it('calculates correct polar to cartesian coordinates', () => {
      // At 0° (3 o'clock / +X axis): (cx + r, cy)
      const p0 = polarToCartesian(100, 100, 50, 0);
      expect(p0.x).toBeCloseTo(150, 1);
      expect(p0.y).toBeCloseTo(100, 1);

      // At 90° (6 o'clock / +Y axis): (cx, cy + r)
      const p90 = polarToCartesian(100, 100, 50, 90);
      expect(p90.x).toBeCloseTo(100, 1);
      expect(p90.y).toBeCloseTo(150, 1);

      // At 180° (9 o'clock / -X axis): (cx - r, cy)
      const p180 = polarToCartesian(100, 100, 50, 180);
      expect(p180.x).toBeCloseTo(50, 1);
      expect(p180.y).toBeCloseTo(100, 1);

      // At 270° (12 o'clock / -Y axis): (cx, cy - r)
      const p270 = polarToCartesian(100, 100, 50, 270);
      expect(p270.x).toBeCloseTo(100, 1);
      expect(p270.y).toBeCloseTo(50, 1);
    });

    it('generates arc paths and handles edge cases', () => {
      // 0 delta returns empty string
      expect(describeArc(100, 100, 50, 180, 180)).toBe('');

      // Semicircle arc
      const semi = describeArc(100, 100, 50, 180, 360);
      expect(semi).toContain('M 50.00 100.00');
      expect(semi).toContain('A 50 50 0 0 1 150.00 100.00');

      // Full circle arc
      const full = describeArc(100, 100, 50, 0, 360);
      expect(full).toContain('M 150.00 100.00');
      expect(full.split('A 50 50').length).toBe(3); // splits into two 180-deg arcs
    });
  });
});
