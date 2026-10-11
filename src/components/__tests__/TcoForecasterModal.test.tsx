import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TcoForecasterModal } from '../TcoForecasterModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'test-car-tco',
  title: 'Toyota Camry 2.5 Hybrid',
  vin: 'JTDKN3DU5A1234567',
  make: 'Toyota',
  model: 'Camry',
  year: 2022,
  priceAzn: 50000,
  mileageKm: 35000,
  engineVolumeLiters: 2.5,
  fuelType: 'hybrid',
  transmission: 'automatic',
  drivetrain: 'fwd',
  powerHp: 218,
  fuelConsumptionLPer100Km: 5.2,
  bodyType: 'sedan',
  color: 'Ağ',
  interiorColor: 'Qara',
  interiorMaterial: 'leather',
  city: 'Bakı',
  images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'],
  features: ['LED', 'Kamera'],
  damageReport: [],
  valuation: {
    status: 'fair_price',
    percentageDiff: -3,
    avgMarketPriceAzn: 51500,
    minMarketPriceAzn: 48000,
    maxMarketPriceAzn: 55000,
    confidenceScore: 92,
    priceHistoryTrend: [],
  },
  seller: {
    id: 'seller-1',
    name: 'Əli Məmmədov',
    phone: '+994 50 123 45 67',
    type: 'private',
    rating: 4.9,
    reviewsCount: 15,
    verifiedIdentity: true,
    memberSinceYear: 2021,
    city: 'Bakı',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2026-03-10',
  viewsCount: 220,
  description: 'Əla vəziyyətdə Toyota Camry Hybrid',
};

describe('TcoForecasterModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <TcoForecasterModal
        isOpen={false}
        onClose={vi.fn()}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    expect(screen.queryByTestId('tco-forecaster-modal')).not.toBeInTheDocument();
  });

  it('renders modal header, vehicle title, and KPI cards when open', () => {
    render(
      <TcoForecasterModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    expect(screen.getByTestId('tco-forecaster-modal')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('5-İllik Sahiblik Xərci Proqnozu (TCO)')).toBeInTheDocument();
    expect(screen.getByText(/2022 Toyota Camry/)).toBeInTheDocument();

    // KPI cards
    expect(screen.getByTestId('tco-total-cost')).toBeInTheDocument();
    expect(screen.getByTestId('tco-monthly-cost')).toBeInTheDocument();
    expect(screen.getByTestId('tco-per-km-cost')).toBeInTheDocument();
    expect(screen.getByTestId('tco-residual-value')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <TcoForecasterModal
        isOpen={true}
        onClose={handleClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    const closeBtn = screen.getByTestId('tco-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches between Cost Structure (Summary) and Dynamic Matrix tabs', () => {
    render(
      <TcoForecasterModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    // Initial tab: Summary (stacked bar exists)
    expect(screen.getByTestId('tco-stacked-bar')).toBeInTheDocument();
    expect(screen.queryByTestId('tco-matrix-table')).not.toBeInTheDocument();

    // Click Matrix Tab
    const matrixTab = screen.getByTestId('tco-tab-matrix');
    fireEvent.click(matrixTab);

    expect(screen.getByTestId('tco-matrix-table')).toBeInTheDocument();
    expect(screen.queryByTestId('tco-stacked-bar')).not.toBeInTheDocument();

    // Click back to Summary Tab
    const summaryTab = screen.getByTestId('tco-tab-summary');
    fireEvent.click(summaryTab);
    expect(screen.getByTestId('tco-stacked-bar')).toBeInTheDocument();
  });

  it('updates calculations when changing ownership term duration (1, 3, 5 years)', () => {
    render(
      <TcoForecasterModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    const initialTotalText = screen.getByTestId('tco-total-cost').textContent;

    // Switch to 1 Year
    const btn1Yr = screen.getByTestId('tco-term-btn-1');
    fireEvent.click(btn1Yr);

    const oneYrTotalText = screen.getByTestId('tco-total-cost').textContent;
    expect(oneYrTotalText).not.toEqual(initialTotalText);

    // Switch to 3 Years
    const btn3Yr = screen.getByTestId('tco-term-btn-3');
    fireEvent.click(btn3Yr);

    const threeYrTotalText = screen.getByTestId('tco-total-cost').textContent;
    expect(threeYrTotalText).not.toEqual(oneYrTotalText);
  });

  it('updates calculations when adjusting annual mileage slider', () => {
    render(
      <TcoForecasterModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    const slider = screen.getByTestId('tco-mileage-slider');
    const initialPerKm = screen.getByTestId('tco-per-km-cost').textContent;

    // Change mileage from 15,000 to 30,000 km
    fireEvent.change(slider, { target: { value: '30000' } });

    expect(screen.getByText('30,000 km')).toBeInTheDocument();
    const updatedPerKm = screen.getByTestId('tco-per-km-cost').textContent;
    expect(updatedPerKm).not.toBe(initialPerKm);
  });

  it('toggles KASKO insurance and updates total cost', () => {
    render(
      <TcoForecasterModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    const initialTotal = screen.getByTestId('tco-total-cost').textContent;
    const kaskoToggle = screen.getByTestId('tco-kasko-toggle');

    // Enable KASKO
    fireEvent.click(kaskoToggle);

    const withKaskoTotal = screen.getByTestId('tco-total-cost').textContent;
    expect(withKaskoTotal).not.toBe(initialTotal);
  });

  it('handles CSV copy and download buttons', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <TcoForecasterModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    const copyBtn = screen.getByTestId('tco-copy-csv-btn');
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
    });

    // Test download CSV button
    const downloadBtn = screen.getByTestId('tco-download-csv-btn');
    fireEvent.click(downloadBtn);
  });
});
