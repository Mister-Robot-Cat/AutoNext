import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ServicePassportModal } from '../ServicePassportModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'car-test-bmw',
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
  color: 'Mineral Grey',
  interiorColor: 'Cognac',
  interiorMaterial: 'leather',
  city: 'Bakı',
  images: ['https://example.com/bmw.jpg'],
  features: ['M Sport', 'Laserlight'],
  damageReport: [],
  valuation: {
    status: 'good_deal',
    percentageDiff: -3.5,
    avgMarketPriceAzn: 71000,
    minMarketPriceAzn: 67000,
    maxMarketPriceAzn: 75000,
    confidenceScore: 94,
    priceHistoryTrend: [],
  },
  seller: {
    id: 's-1',
    name: 'Improtex Certified Pre-Owned',
    phone: '+994 12 530 01 01',
    type: 'official_dealer',
    rating: 4.9,
    reviewsCount: 150,
    verifiedIdentity: true,
    memberSinceYear: 2018,
    city: 'Bakı',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2024-01-15T12:00:00Z',
  viewsCount: 350,
  description: 'Avtomobil ideal vəziyyətdədir.',
};

describe('ServicePassportModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ServicePassportModal
        isOpen={false}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not render when vehicle is null', () => {
    const { container } = render(
      <ServicePassportModal
        isOpen={true}
        vehicle={null}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with vehicle details and KPI strip', () => {
    render(
      <ServicePassportModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Rəqəmsal Servis Pasportu & Qulluq Planı')).toBeInTheDocument();
    expect(screen.getByText(/WBA5A7C50JB192841/)).toBeInTheDocument();
    expect(screen.getByTestId('schedule-tab-content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <ServicePassportModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByTestId('close-service-passport-modal-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches between tabs properly', () => {
    render(
      <ServicePassportModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    // Initial tab is schedule
    expect(screen.getByTestId('schedule-tab-content')).toBeInTheDocument();

    // Switch to history
    const historyTabBtn = screen.getByTestId('tab-history-btn');
    fireEvent.click(historyTabBtn);
    expect(screen.getByTestId('history-tab-content')).toBeInTheDocument();

    // Switch to comparison
    const comparisonTabBtn = screen.getByTestId('tab-comparison-btn');
    fireEvent.click(comparisonTabBtn);
    expect(screen.getByTestId('comparison-tab-content')).toBeInTheDocument();

    // Switch to certificate
    const certTabBtn = screen.getByTestId('tab-certificate-btn');
    fireEvent.click(certTabBtn);
    expect(screen.getByTestId('certificate-tab-content')).toBeInTheDocument();
  });

  it('allows adjusting simulated mileage and resetting', () => {
    render(
      <ServicePassportModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    const rangeInput = screen.getByTestId('mileage-range-input');
    fireEvent.change(rangeInput, { target: { value: '60000' } });

    expect(screen.getByText('60,000 km')).toBeInTheDocument();
    expect(screen.getByTestId('reset-mileage-btn')).toBeInTheDocument();

    // Reset
    fireEvent.click(screen.getByTestId('reset-mileage-btn'));
    expect(screen.getAllByText('42,000 km').length).toBeGreaterThanOrEqual(1);
  });

  it('filters schedule items by category and urgency', () => {
    render(
      <ServicePassportModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    const brakesCatBtn = screen.getByTestId('category-filter-brakes');
    fireEvent.click(brakesCatBtn);

    // Filter by urgency
    const upcomingBtn = screen.getByTestId('urgency-filter-upcoming');
    fireEvent.click(upcomingBtn);
  });

  it('searches and filters history records', () => {
    render(
      <ServicePassportModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-history-btn'));
    expect(screen.getByTestId('history-tab-content')).toBeInTheDocument();

    const searchInput = screen.getByTestId('history-search-input');
    fireEvent.change(searchInput, { target: { value: 'Improtex' } });

    const workshopSelect = screen.getByTestId('history-workshop-select');
    fireEvent.change(workshopSelect, { target: { value: 'official_dealer' } });

    const stampCheckbox = screen.getByTestId('only-verified-stamps-checkbox');
    fireEvent.click(stampCheckbox);
  });

  it('expands record details in history tab', () => {
    render(
      <ServicePassportModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-history-btn'));

    // Expand first record
    const expandBtn = screen.getByTestId('expand-record-btn-rec-bmw-1');
    fireEvent.click(expandBtn);

    expect(screen.getByText(/Dəyişdirilmiş ehtiyat hissələri/)).toBeInTheDocument();
  });

  it('copies certificate in certificate tab', () => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <ServicePassportModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-certificate-btn'));
    const copyBtn = screen.getByTestId('copy-certificate-btn');
    fireEvent.click(copyBtn);

    expect(screen.getByText('RƏQƏMSAL SERVİS PASPORT ÇIXARIŞI')).toBeInTheDocument();
  });
});
