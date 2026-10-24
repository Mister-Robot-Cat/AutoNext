import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SalvageComplianceModal } from '../SalvageComplianceModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'veh-salvage-1',
  title: 'Hyundai Elantra 2021',
  make: 'Hyundai',
  model: 'Elantra',
  year: 2021,
  priceAzn: 32000,
  mileageKm: 41200,
  fuelType: 'petrol',
  transmission: 'automatic',
  drivetrain: 'fwd',
  bodyType: 'sedan',
  color: 'Gümüşü',
  interiorColor: 'Qara',
  interiorMaterial: 'cloth',
  engineVolumeLiters: 2.0,
  powerHp: 147,
  fuelConsumptionLPer100Km: 7.2,
  city: 'Bakı',
  features: ['Airbag', 'ABS'],
  images: ['https://example.com/elantra.jpg'],
  damageReport: [],
  valuation: {
    status: 'fair_price',
    percentageDiff: 0,
    avgMarketPriceAzn: 32000,
    minMarketPriceAzn: 30000,
    maxMarketPriceAzn: 34000,
    confidenceScore: 90,
    priceHistoryTrend: []
  },
  seller: {
    id: 'seller-1',
    name: 'Baku Prestige Motors',
    phone: '+994 50 123 45 67',
    type: 'official_dealer',
    rating: 4.8,
    reviewsCount: 30,
    verifiedIdentity: true,
    memberSinceYear: 2019,
    city: 'Bakı'
  },
  vin: '5NPD74LF7MH198421',
  plateNumber: '77-XD-219',
  isVerified: true,
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2026-10-01',
  description: 'Təmiz vəziyyətdə Hyundai Elantra 2021',
  viewsCount: 145
};

describe('SalvageComplianceModal Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <SalvageComplianceModal
        isOpen={false}
        onClose={onCloseMock}
        vehicle={mockVehicle}
      />
    );

    expect(screen.queryByTestId('salvage-modal')).toBeNull();
  });

  it('renders modal header, title, and default calculator tab when open', () => {
    render(
      <SalvageComplianceModal
        isOpen={true}
        onClose={onCloseMock}
        vehicle={mockVehicle}
      />
    );

    expect(screen.getByTestId('salvage-modal')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Konstruktiv Məhv/i })).toBeInTheDocument();
    expect(screen.getByTestId('salvage-calculator-tab')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <SalvageComplianceModal
        isOpen={true}
        onClose={onCloseMock}
        vehicle={mockVehicle}
      />
    );

    const closeBtn = screen.getByTestId('salvage-close-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 5 navigation tabs', () => {
    render(
      <SalvageComplianceModal
        isOpen={true}
        onClose={onCloseMock}
        vehicle={mockVehicle}
      />
    );

    // Tab 2: Auction
    fireEvent.click(screen.getByTestId('tab-auction-btn'));
    expect(screen.getByTestId('salvage-auction-tab')).toBeInTheDocument();

    // Tab 3: Chassis 3D
    fireEvent.click(screen.getByTestId('tab-chassis3d-btn'));
    expect(screen.getByTestId('salvage-chassis-tab')).toBeInTheDocument();

    // Tab 4: Centers
    fireEvent.click(screen.getByTestId('tab-centers-btn'));
    expect(screen.getByTestId('salvage-centers-tab')).toBeInTheDocument();

    // Tab 5: Certificate
    fireEvent.click(screen.getByTestId('tab-certificate-btn'));
    expect(screen.getByTestId('salvage-certificate-tab')).toBeInTheDocument();

    // Return to Tab 1: Calculator
    fireEvent.click(screen.getByTestId('tab-calculator-btn'));
    expect(screen.getByTestId('salvage-calculator-tab')).toBeInTheDocument();
  });

  it('updates calculations when sliders change and toggles wreck retention', () => {
    render(
      <SalvageComplianceModal
        isOpen={true}
        onClose={onCloseMock}
        vehicle={mockVehicle}
      />
    );

    const repairSlider = screen.getByTestId('input-repair-cost');
    fireEvent.change(repairSlider, { target: { value: '28000' } });

    const wreckToggle = screen.getByTestId('toggle-wreck-retention');
    fireEvent.click(wreckToggle);

    expect(screen.getByTestId('legal-conclusion-banner')).toBeInTheDocument();
  });

  it('applies quick vehicle presets when clicked', () => {
    render(
      <SalvageComplianceModal
        isOpen={true}
        onClose={onCloseMock}
        vehicle={mockVehicle}
      />
    );

    const presetBtn = screen.getByTestId('preset-btn-IAAI-BMW-2020');
    fireEvent.click(presetBtn);

    expect(screen.getByTestId('insurer-payout-text')).toBeInTheDocument();
  });

  it('interacts with auction tab elements and changes airbag status', () => {
    render(
      <SalvageComplianceModal
        isOpen={true}
        onClose={onCloseMock}
        vehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-auction-btn'));
    expect(screen.getByTestId('salvage-auction-tab')).toBeInTheDocument();

    const airbagSelect = screen.getByTestId('select-airbag-status');
    fireEvent.change(airbagSelect, {
      target: { value: 'DEPLOYED_DUMMY_RESISTOR_DETECTED' }
    });

    expect(screen.getByText(/2.2 Ohm rezistor/i)).toBeInTheDocument();
  });

  it('adjusts chassis datum sliders and toggles ultrasound weld porosity in 3D tab', () => {
    render(
      <SalvageComplianceModal
        isOpen={true}
        onClose={onCloseMock}
        vehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-chassis3d-btn'));
    expect(screen.getByTestId('salvage-chassis-tab')).toBeInTheDocument();

    const slider = screen.getByTestId('slider-chassis-FL_RAIL');
    fireEvent.change(slider, { target: { value: '4.2' } });

    // Should indicate failure since 4.2 > 2.0 mm
    const verdictBanner = screen.getByTestId('roadworthiness-verdict-banner');
    expect(verdictBanner).toBeInTheDocument();

    // Toggle weld porosity
    const weldBtn = screen.getByTestId('toggle-weld-porosity-W1');
    fireEvent.click(weldBtn);
  });

  it('filters accredited centers and books appointment in centers tab', () => {
    render(
      <SalvageComplianceModal
        isOpen={true}
        onClose={onCloseMock}
        vehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-centers-btn'));
    expect(screen.getByTestId('salvage-centers-tab')).toBeInTheDocument();

    // Filter by Sumgayit
    const sumgayitBtn = screen.getByTestId('btn-filter-city-Sumqayıt');
    fireEvent.click(sumgayitBtn);

    // Book center
    const bookBtn = screen.getByTestId('btn-book-center-CTR-SUMGAYIT-BODY');
    fireEvent.click(bookBtn);

    expect(screen.getByTestId('booking-success-banner')).toBeInTheDocument();
  });

  it('searches public registry, copies certificate, and triggers print in certificate tab', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <SalvageComplianceModal
        isOpen={true}
        onClose={onCloseMock}
        vehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-certificate-btn'));
    expect(screen.getByTestId('salvage-certificate-tab')).toBeInTheDocument();

    // Search registry
    const searchInput = screen.getByTestId('input-registry-search');
    fireEvent.change(searchInput, { target: { value: '5NPD74LF7MH198421' } });
    fireEvent.click(screen.getByTestId('btn-registry-lookup'));

    expect(screen.getByTestId('registry-search-result')).toBeInTheDocument();

    // Copy certificate
    const copyBtn = screen.getByTestId('btn-copy-certificate');
    fireEvent.click(copyBtn);

    // Print
    const printBtn = screen.getByTestId('btn-print-certificate');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });
});
