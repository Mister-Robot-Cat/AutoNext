import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InspectionModal } from '../InspectionModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'car-test-1',
  title: 'Toyota Camry 2.5 Hybrid',
  vin: 'JTMBA3FV8MD019284',
  make: 'Toyota',
  model: 'Camry',
  year: 2022,
  priceAzn: 54000,
  mileageKm: 38000,
  engineVolumeLiters: 2.5,
  fuelType: 'hybrid',
  transmission: 'variator',
  drivetrain: 'fwd',
  powerHp: 218,
  fuelConsumptionLPer100Km: 4.8,
  bodyType: 'sedan',
  color: 'Ağ',
  interiorColor: 'Qara',
  interiorMaterial: 'leather',
  city: 'Bakı',
  images: ['/cars/camry1.jpg'],
  features: ['LED'],
  damageReport: [],
  valuation: {
    status: 'fair_price',
    percentageDiff: 0,
    avgMarketPriceAzn: 54000,
    minMarketPriceAzn: 52000,
    maxMarketPriceAzn: 56000,
    confidenceScore: 95,
    priceHistoryTrend: [],
  },
  seller: {
    id: 's-1',
    name: 'Toyota Bakı',
    phone: '+994 50 123 45 67',
    type: 'official_dealer',
    rating: 4.9,
    reviewsCount: 42,
    verifiedIdentity: true,
    memberSinceYear: 2018,
    city: 'Bakı',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2026-10-01',
  viewsCount: 310,
  description: 'Test car',
};

const mockHighMileageDamagedVehicle: Vehicle = {
  ...mockVehicle,
  id: 'car-test-2',
  year: 2015,
  mileageKm: 220000,
  priceAzn: 25000,
  fuelType: 'petrol',
  damageReport: [
    { partId: 'front_left_door', partName: 'Sürücü qapısı', severity: 'cosmetic_paint' },
    { partId: 'hood', partName: 'Kapot', severity: 'repaired' },
  ],
};

describe('InspectionModal Component', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <InspectionModal
        isOpen={false}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );
    expect(screen.queryByTestId('inspection-modal')).not.toBeInTheDocument();
  });

  it('does not render when vehicle is null', () => {
    render(
      <InspectionModal
        isOpen={true}
        vehicle={null}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );
    expect(screen.queryByTestId('inspection-modal')).not.toBeInTheDocument();
  });

  it('renders modal header, vehicle details and KPI overview when open', () => {
    render(
      <InspectionModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );

    expect(screen.getByTestId('inspection-modal')).toBeInTheDocument();
    expect(screen.getByText(/150-Nöqtəli Diaqnostika/i)).toBeInTheDocument();
    expect(screen.getByText(/JTMBA3FV8MD019284/i)).toBeInTheDocument();
    expect(screen.getByText(/\/ 100 Bal/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <InspectionModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );

    const closeBtn = screen.getByTestId('inspection-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches between tabs properly', () => {
    render(
      <InspectionModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );

    // Switch to OBD-II tab
    const obdTab = screen.getByTestId('inspection-tab-obd2');
    fireEvent.click(obdTab);
    expect(screen.getByText(/ECU Mühərrik və Transmissiya Blokunun Diaqnostikası/i)).toBeInTheDocument();

    // Switch to Paint tab
    const paintTab = screen.getByTestId('inspection-tab-paint');
    fireEvent.click(paintTab);
    expect(screen.getByText(/Mikrometr Göstəricisi:/i)).toBeInTheDocument();

    // Switch to Checklist tab
    const checklistTab = screen.getByTestId('inspection-tab-checklist');
    fireEvent.click(checklistTab);
    expect(screen.getByTestId('inspection-search-input')).toBeInTheDocument();

    // Switch to Certificate tab
    const certTab = screen.getByTestId('inspection-tab-certificate');
    fireEvent.click(certTab);
    expect(screen.getByText(/AutoNext MasterLab Diaqnostika Aktı/i)).toBeInTheDocument();
  });

  it('displays DTC codes and handles clearing them in OBD-II tab', () => {
    render(
      <InspectionModal
        isOpen={true}
        vehicle={mockHighMileageDamagedVehicle}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );

    // Switch to OBD tab
    fireEvent.click(screen.getByTestId('inspection-tab-obd2'));

    // Should have Clear DTC button since it is a high mileage vehicle
    const clearBtn = screen.getByTestId('clear-dtc-btn');
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);

    // Now it should show clean ECU message
    expect(screen.getByText(/ECU Yaddaşında Xəta Yoxdur/i)).toBeInTheDocument();
  });

  it('filters checklist items by keyword search', () => {
    render(
      <InspectionModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );

    // Switch to checklist tab
    fireEvent.click(screen.getByTestId('inspection-tab-checklist'));

    const searchInput = screen.getByTestId('inspection-search-input');
    fireEvent.change(searchInput, { target: { value: 'Kompressiya' } });

    expect(screen.getByText(/Silindrlərin Kompressiya Balansı/i)).toBeInTheDocument();
    expect(screen.queryByText(/Odometer \(Yürüş\) Əsillik Təsdiqi/i)).not.toBeInTheDocument();
  });

  it('allows interactive toggling of item status in checklist', () => {
    render(
      <InspectionModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByTestId('inspection-tab-checklist'));

    // Toggle eng_compression to fail
    const toggleFailBtn = screen.getByTestId('toggle-fail-eng_compression');
    fireEvent.click(toggleFailBtn);

    // Score should be updated (decreased)
    expect(screen.getByTestId('toggle-fail-eng_compression')).toBeInTheDocument();
  });
});
