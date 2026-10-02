import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PriceDepreciationChart } from '../PriceDepreciationChart';
import { Vehicle } from '../../types/vehicle';
import * as depreciationUtils from '../../utils/depreciation';

// Mock depreciation utility to provide predictable data
vi.mock('../../utils/depreciation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/depreciation')>();
  return {
    ...actual,
    calculateDepreciationForecast: vi.fn(),
  };
});

const mockVehicle = {
  id: '1',
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  priceAzn: 50000,
} as unknown as Vehicle;

const mockForecast = {
  annualRatePercent: 8.5,
  resaleScore: 'HIGH',
  retentionSummaryText: 'Excellent value retention.',
  points: [
    {
      yearIndex: 0,
      calendarYear: 2023,
      projectedPriceAzn: 50000,
      retainedPercent: 100,
      annualLossAzn: 0,
    },
    {
      yearIndex: 1,
      calendarYear: 2024,
      projectedPriceAzn: 45750,
      retainedPercent: 91.5,
      annualLossAzn: 4250,
    },
    {
      yearIndex: 2,
      calendarYear: 2025,
      projectedPriceAzn: 41861,
      retainedPercent: 83.7,
      annualLossAzn: 3889,
    },
  ],
};

describe('PriceDepreciationChart', () => {
  it('renders chart header and forecast summaries correctly', () => {
    vi.mocked(depreciationUtils.calculateDepreciationForecast).mockReturnValue(mockForecast as any);

    render(<PriceDepreciationChart vehicle={mockVehicle} currency="AZN" lang="az" />);

    expect(screen.getByText('8.5% illik orta')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('Excellent value retention.')).toBeInTheDocument();
  });

  it('renders data points for the forecast years', () => {
    vi.mocked(depreciationUtils.calculateDepreciationForecast).mockReturnValue(mockForecast as any);

    const { container } = render(<PriceDepreciationChart vehicle={mockVehicle} currency="AZN" lang="az" />);
    
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
    
    // Check if there are 3 SVG circles representing points
    const pointGroups = container.querySelectorAll('g.cursor-pointer');
    expect(pointGroups.length).toBe(3);
  });

  it('updates the active point details when a data point is hovered/clicked', () => {
    vi.mocked(depreciationUtils.calculateDepreciationForecast).mockReturnValue(mockForecast as any);

    const { container } = render(<PriceDepreciationChart vehicle={mockVehicle} currency="AZN" lang="az" />);

    // Initially active point is 0 (2023)
    expect(screen.getByText(/2023-ci ild/)).toBeInTheDocument();
    
    // Find the point groups
    const pointGroups = container.querySelectorAll('g.cursor-pointer');
    expect(pointGroups.length).toBe(3);

    // Click the 2nd point (2024)
    fireEvent.click(pointGroups[1]);

    expect(screen.getByText(/2024-ci ild/)).toBeInTheDocument();
    expect(screen.getByText('91.5%')).toBeInTheDocument();
  });
});
