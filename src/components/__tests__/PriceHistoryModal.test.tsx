import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PriceHistoryModal } from '../PriceHistoryModal';
import { Vehicle } from '../../types/vehicle';
import { toastManager } from '../../hooks/useToast';

const mockVehicle: Vehicle = {
  id: 'car-test-1',
  title: 'BMW 530i M Sport',
  vin: 'WBA5A7C50JB192841',
  make: 'BMW',
  model: '530i',
  year: 2021,
  priceAzn: 68500,
  mileageKm: 42000,
  engineVolumeLiters: 2.0,
  fuelType: 'petrol',
  transmission: 'automatic',
  drivetrain: 'rwd',
  powerHp: 252,
  fuelConsumptionLPer100Km: 6.8,
  bodyType: 'sedan',
  color: 'Mineral Grey Metallic',
  interiorColor: 'Cognac Brown',
  interiorMaterial: 'leather',
  city: 'Bakı',
  images: ['/img1.jpg'],
  features: ['M Sport Package'],
  damageReport: [],
  valuation: {
    status: 'great_deal',
    percentageDiff: -7.5,
    avgMarketPriceAzn: 74000,
    minMarketPriceAzn: 69000,
    maxMarketPriceAzn: 79000,
    confidenceScore: 94,
    priceHistoryTrend: [],
  },
  seller: {
    id: 'sel-1',
    name: 'Rəşad Əliyev',
    phone: '+994 50 211 44 88',
    type: 'private',
    rating: 4.9,
    reviewsCount: 14,
    verifiedIdentity: true,
    memberSinceYear: 2021,
    city: 'Bakı',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2026-02-15',
  viewsCount: 100,
  description: 'Test description',
};

describe('PriceHistoryModal', () => {
  const mockOnClose = vi.fn();
  const mockOnMakeOffer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when vehicle is null', () => {
    const { container } = render(
      <PriceHistoryModal
        vehicle={null}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal header and vehicle information', () => {
    render(
      <PriceHistoryModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('price-history-modal')).toBeDefined();
    expect(screen.getByText(/Qiymət Tarixçəsi & Bazar Dinamikası/i)).toBeDefined();
    expect(screen.getByText(/BMW 530i M Sport/i)).toBeDefined();
    expect(screen.getByText(/WBA5A7C50JB192841/i)).toBeDefined();
  });

  it('renders the price metrics correctly', () => {
    render(
      <PriceHistoryModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    // Current price formatted
    expect(screen.getAllByText(/68,500 ₼/i).length).toBeGreaterThan(0);
    // Audit table header
    expect(screen.getByText(/Qiymət Dəyişiklikləri Jurnalı/i)).toBeDefined();
  });

  it('handles timeframe switching', () => {
    render(
      <PriceHistoryModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const timeframeContainer = screen.getByTestId('timeframe-selector');
    expect(timeframeContainer).toBeDefined();

    const month1Btn = screen.getByText('1 Ay');
    fireEvent.click(month1Btn);

    const month3Btn = screen.getByText('3 Ay');
    fireEvent.click(month3Btn);
  });

  it('interacts with interactive chart points and updates inspector', () => {
    render(
      <PriceHistoryModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const point = screen.getByTestId('chart-point-0');
    expect(point).toBeDefined();

    fireEvent.click(point);

    const inspectorCard = screen.getByTestId('selected-point-card');
    expect(inspectorCard).toBeDefined();
  });

  it('supports offer simulation and preset percentage buttons', () => {
    render(
      <PriceHistoryModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
        onMakeOffer={mockOnMakeOffer}
      />
    );

    // Click preset -4% button
    const presetBtn = screen.getByText('-4%');
    fireEvent.click(presetBtn);

    // Check slider interaction
    const slider = screen.getByTestId('offer-slider') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '65000' } });
    expect(slider.value).toBe('65000');

    // Click send offer
    const toastSpy = vi.spyOn(toastManager, 'add');
    const sendBtn = screen.getByTestId('send-offer-btn');
    fireEvent.click(sendBtn);

    expect(mockOnMakeOffer).toHaveBeenCalledWith(mockVehicle, 65000);
    expect(toastSpy).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <PriceHistoryModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const closeBtn = screen.getByTestId('price-history-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls window.print when print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <PriceHistoryModal
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const printBtn = screen.getByText('Çap et');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('supports English and Russian localization', () => {
    const { rerender } = render(
      <PriceHistoryModal
        vehicle={mockVehicle}
        currency="USD"
        lang="en"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Price History & Market Dynamics/i)).toBeDefined();
    expect(screen.getByText(/Price Change Audit Log/i)).toBeDefined();

    rerender(
      <PriceHistoryModal
        vehicle={mockVehicle}
        currency="EUR"
        lang="ru"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/История цен и динамика рынка/i)).toBeDefined();
    expect(screen.getByText(/Журнал изменений цен/i)).toBeDefined();
  });
});
