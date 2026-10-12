import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TradeInModal } from '../TradeInModal';
import { Vehicle } from '../../types/vehicle';
import { toastManager } from '../../hooks/useToast';

vi.mock('../../hooks/useToast', () => ({
  toastManager: {
    add: vi.fn(),
  },
}));

const mockTargetVehicle: Vehicle = {
  id: 'car-target-1',
  title: 'BMW 530i M Sport',
  vin: 'WBA5A7C50JB192841',
  make: 'BMW',
  model: '5-Series',
  year: 2022,
  priceAzn: 68000,
  mileageKm: 35000,
  engineVolumeLiters: 2.0,
  fuelType: 'petrol',
  transmission: 'automatic',
  drivetrain: 'rwd',
  powerHp: 252,
  fuelConsumptionLPer100Km: 6.8,
  bodyType: 'sedan',
  color: 'Black',
  interiorColor: 'Cognac',
  interiorMaterial: 'leather',
  city: 'Baku',
  images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'],
  features: ['M Sport Package', 'Harman Kardon'],
  damageReport: [],
  valuation: {
    status: 'good_deal',
    percentageDiff: -4,
    avgMarketPriceAzn: 71000,
    minMarketPriceAzn: 67000,
    maxMarketPriceAzn: 74000,
    confidenceScore: 92,
    priceHistoryTrend: [],
  },
  seller: {
    id: 's1',
    name: 'Baku Prestige Motors',
    phone: '+994 50 123 45 67',
    type: 'official_dealer',
    rating: 4.9,
    reviewsCount: 140,
    verifiedIdentity: true,
    memberSinceYear: 2018,
    city: 'Baku',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: true,
  publishedDate: '2026-03-10',
  viewsCount: 312,
  description: 'Clean BMW 530i in top condition.',
};

describe('TradeInModal', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <TradeInModal
        isOpen={false}
        onClose={onCloseMock}
        targetVehicle={mockTargetVehicle}
        currency="AZN"
        lang="az"
      />
    );
    expect(screen.queryByTestId('trade-in-modal')).not.toBeInTheDocument();
  });

  it('renders modal header, presets and valuation cards when open', () => {
    render(
      <TradeInModal
        isOpen={true}
        onClose={onCloseMock}
        targetVehicle={mockTargetVehicle}
        currency="AZN"
        lang="az"
      />
    );

    expect(screen.getByTestId('trade-in-modal')).toBeInTheDocument();
    expect(
      screen.getByText('AutoNext Trade-In & Barter Qiymətləndirməsi')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Populyar Modellər (Hazır Şablonlar)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Rəsmi Diler Barter Təklifi')
    ).toBeInTheDocument();
    expect(screen.getByText('Təcili Nağd Satış (Fast Cash)')).toBeInTheDocument();
    expect(
      screen.getByText('Şəxsi Bazar Qiyməti (Private Retail)')
    ).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <TradeInModal
        isOpen={true}
        onClose={onCloseMock}
        targetVehicle={mockTargetVehicle}
        currency="AZN"
        lang="az"
      />
    );

    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches vehicle presets and recalculates values', () => {
    render(
      <TradeInModal
        isOpen={true}
        onClose={onCloseMock}
        targetVehicle={mockTargetVehicle}
        currency="AZN"
        lang="az"
      />
    );

    // Click on Hyundai Elantra preset
    const elantraBtn = screen.getByText('Hyundai Elantra 1.8 (2017)');
    fireEvent.click(elantraBtn);

    const makeInput = screen.getByDisplayValue('Hyundai');
    expect(makeInput).toBeInTheDocument();
    const modelInput = screen.getByDisplayValue('Elantra');
    expect(modelInput).toBeInTheDocument();
  });

  it('updates condition and loan balance inputs', () => {
    render(
      <TradeInModal
        isOpen={true}
        onClose={onCloseMock}
        targetVehicle={mockTargetVehicle}
        currency="AZN"
        lang="az"
      />
    );

    // Select "İdeal (Zavod)" condition
    const idealBtn = screen.getByText('İdeal (Zavod)');
    fireEvent.click(idealBtn);

    // Enter existing loan balance
    const loanInput = screen.getByPlaceholderText('0');
    fireEvent.change(loanInput, { target: { value: '8000' } });
    expect(loanInput).toHaveValue(8000);
  });

  it('renders target vehicle upgrade calculations when targetVehicle is provided', () => {
    render(
      <TradeInModal
        isOpen={true}
        onClose={onCloseMock}
        targetVehicle={mockTargetVehicle}
        currency="AZN"
        lang="az"
      />
    );

    expect(screen.getByText('BMW 530i M Sport (2022)')).toBeInTheDocument();
    expect(screen.getByText(/Ödəniləcək Yekun Fərq/)).toBeInTheDocument();
    expect(screen.getByText(/Kreditlə Aylıq Fərq/)).toBeInTheDocument();
  });

  it('handles copy summary and submit request actions', () => {
    render(
      <TradeInModal
        isOpen={true}
        onClose={onCloseMock}
        targetVehicle={mockTargetVehicle}
        currency="AZN"
        lang="az"
      />
    );

    const copyBtn = screen.getByText('Təklifi Kopyala');
    fireEvent.click(copyBtn);
    expect(toastManager.add).toHaveBeenCalledWith(
      'Trade-In hesabatı kopyalandı!',
      'success'
    );

    const submitBtn = screen.getByText('Barter Müraciəti Göndər');
    fireEvent.click(submitBtn);
    expect(toastManager.add).toHaveBeenCalledWith(
      expect.stringContaining('Trade-In barter müraciətiniz uğurla qəbul edildi!'),
      'success'
    );
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('supports English and Russian localizations', () => {
    const { rerender } = render(
      <TradeInModal
        isOpen={true}
        onClose={onCloseMock}
        targetVehicle={mockTargetVehicle}
        currency="USD"
        lang="en"
      />
    );

    expect(
      screen.getByText('AutoNext Trade-In & Barter Valuation')
    ).toBeInTheDocument();
    expect(screen.getByText('Official Dealership Trade-In')).toBeInTheDocument();

    rerender(
      <TradeInModal
        isOpen={true}
        onClose={onCloseMock}
        targetVehicle={mockTargetVehicle}
        currency="EUR"
        lang="ru"
      />
    );

    expect(
      screen.getByText('Оценка Trade-In и Бартера AutoNext')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Trade-In у официального дилера')
    ).toBeInTheDocument();
  });
});
