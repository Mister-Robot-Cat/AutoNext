import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import {
  BarChart,
  BarChartDataPoint,
  generateVehiclePriceDistribution,
} from '../BarChart';

describe('BarChart Component', () => {
  const sampleData: BarChartDataPoint[] = [
    { id: '1', label: '50k - 55k', value: 4 },
    { id: '2', label: '55k - 60k', value: 12 },
    { id: '3', label: '60k - 65k', value: 18, highlighted: true, sublabel: 'Cari Elan' },
    { id: '4', label: '65k - 70k', value: 9 },
    { id: '5', label: '70k - 75k', value: 3 },
  ];

  it('renders correctly with default vertical props', () => {
    render(<BarChart data={sampleData} title="Bazar Qiymətləri" />);

    const chart = screen.getByTestId('barchart');
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveAttribute('role', 'img');
    expect(chart).toHaveAttribute('aria-label', 'Bazar Qiymətləri');

    expect(screen.getByTestId('barchart-grid')).toBeInTheDocument();
    expect(screen.getByTestId('barchart-bars')).toBeInTheDocument();

    // Check all labels exist
    expect(screen.getByText('50k - 55k')).toBeInTheDocument();
    expect(screen.getByText('60k - 65k')).toBeInTheDocument();
    expect(screen.getByText('70k - 75k')).toBeInTheDocument();
  });

  it('renders empty message when data is empty', () => {
    render(<BarChart data={[]} emptyMessage="Heç bir məlumat tapılmadı" />);

    expect(screen.getByTestId('barchart-empty')).toBeInTheDocument();
    expect(screen.getByText('Heç bir məlumat tapılmadı')).toBeInTheDocument();
  });

  it('renders horizontal orientation correctly', () => {
    render(<BarChart data={sampleData} orientation="horizontal" />);

    const chart = screen.getByTestId('barchart');
    expect(chart).toBeInTheDocument();
    expect(screen.getByText('50k - 55k')).toBeInTheDocument();
  });

  it('renders highlighted bar and indicator pin', () => {
    render(<BarChart data={sampleData} highlightColor="#10b981" />);

    const highlightedPin = screen.getByTestId('barchart-highlight-pin-2');
    expect(highlightedPin).toBeInTheDocument();
  });

  it('renders reference line with label', () => {
    render(
      <BarChart
        data={sampleData}
        referenceLines={[
          { value: 15, label: 'Orta göstərici: 15', color: '#f59e0b' },
        ]}
      />
    );

    expect(screen.getByTestId('barchart-reference-line')).toBeInTheDocument();
    expect(screen.getByText('Orta göstərici: 15')).toBeInTheDocument();
  });

  it('renders values when showValues is true', () => {
    render(
      <BarChart
        data={sampleData}
        showValues={true}
        valueFormatter={(v) => `${v} maşın`}
      />
    );

    expect(screen.getByText('18 maşın')).toBeInTheDocument();
    expect(screen.getByText('4 maşın')).toBeInTheDocument();
  });

  it('calls onBarClick when a bar is clicked', () => {
    const handleClick = vi.fn();
    render(<BarChart data={sampleData} onBarClick={handleClick} />);

    const barGroup = screen.getByTestId('barchart-bar-1');
    fireEvent.click(barGroup);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(sampleData[1], 1);
  });

  it('calls onBarHover and displays tooltip on hover', () => {
    const handleHover = vi.fn();
    render(<BarChart data={sampleData} onBarHover={handleHover} />);

    const barGroup = screen.getByTestId('barchart-bar-2');
    fireEvent.mouseEnter(barGroup);

    expect(handleHover).toHaveBeenCalledWith(sampleData[2], 2);
    expect(screen.getByTestId('barchart-tooltip')).toBeInTheDocument();
    expect(screen.getByText('Cari Elan')).toBeInTheDocument();

    fireEvent.mouseLeave(barGroup);
    expect(handleHover).toHaveBeenCalledWith(null, null);
  });

  it('hides grid and labels when showGrid and showLabels are false', () => {
    render(
      <BarChart
        data={sampleData}
        showGrid={false}
        showLabels={false}
      />
    );

    expect(screen.queryByTestId('barchart-grid')).not.toBeInTheDocument();
    expect(screen.queryByText('50k - 55k')).not.toBeInTheDocument();
  });

  describe('generateVehiclePriceDistribution', () => {
    it('generates price buckets and highlights the bracket containing the current vehicle price', () => {
      const buckets = generateVehiclePriceDistribution({
        currentPrice: 68500,
        avgPrice: 70000,
        minPrice: 55000,
        maxPrice: 85000,
        bucketsCount: 5,
        currencySymbol: '₼',
      });

      expect(buckets).toHaveLength(5);
      const highlighted = buckets.filter((b) => b.highlighted);
      expect(highlighted.length).toBeGreaterThanOrEqual(1);
      expect(highlighted[0].sublabel).toBe('Cari Avtomobil');
      expect(highlighted[0].value).toBeGreaterThan(0);
    });

    it('handles edge cases where currentPrice is outside min/max range', () => {
      const buckets = generateVehiclePriceDistribution({
        currentPrice: 120000,
        avgPrice: 70000,
        minPrice: 50000,
        maxPrice: 80000,
        bucketsCount: 4,
      });

      expect(buckets).toHaveLength(4);
      expect(buckets.some((b) => b.highlighted)).toBe(true);
    });
  });
});
