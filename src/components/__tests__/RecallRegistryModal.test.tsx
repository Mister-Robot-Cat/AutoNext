import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RecallRegistryModal } from '../RecallRegistryModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'car-bmw-530i',
  title: 'BMW 530i M Sport (G30 LCI)',
  vin: 'WBA5A7C50JB192841',
  make: 'BMW',
  model: '530i',
  generation: 'G30 Facelift',
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
  images: ['https://example.com/bmw.jpg'],
  features: ['M Sport Package'],
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
    name: 'Improtex Motors',
    phone: '+994 12 530 00 55',
    type: 'official_dealer',
    rating: 4.9,
    reviewsCount: 312,
    verifiedIdentity: true,
    memberSinceYear: 2018,
    city: 'Bakı',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2024-01-15T12:00:00Z',
  viewsCount: 350,
  description: 'BMW 530i M Sport',
};

describe('RecallRegistryModal', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <RecallRegistryModal
        isOpen={false}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with vehicle details and safety score KPI when open', () => {
    render(
      <RecallRegistryModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    expect(screen.getByTestId('recall-registry-modal')).toBeInTheDocument();
    expect(screen.getByText(/2021 BMW 530i/i)).toBeInTheDocument();
    expect(screen.getByText(/WBA5A7C50JB192841/i)).toBeInTheDocument();
    expect(screen.getByText(/Təhlükəsizlik İndeksi/i)).toBeInTheDocument();
    expect(screen.getByText(/Açıq Kampaniyalar/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <RecallRegistryModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    const closeBtn = screen.getByTestId('recall-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    const footerClose = screen.getByTestId('recall-modal-footer-close');
    fireEvent.click(footerClose);
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });

  it('switches between all navigation tabs cleanly', () => {
    render(
      <RecallRegistryModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    // Switch to Booking Tab
    fireEvent.click(screen.getByTestId('tab-booking'));
    expect(screen.getByTestId('recall-booking-form')).toBeInTheDocument();

    // Switch to History Tab
    fireEvent.click(screen.getByTestId('tab-history'));
    expect(screen.getByText(/İcra Edilib/i)).toBeInTheDocument();

    // Switch to Certificate Tab
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('recall-certificate-frame')).toBeInTheDocument();
    expect(screen.getByText(/Dövlət Yol Polisi və İstehsalçı Reyestri Akkreditasiyası/i)).toBeInTheDocument();

    // Switch back to Campaigns Tab
    fireEvent.click(screen.getByTestId('tab-campaigns'));
    expect(screen.getByTestId('recall-search-input')).toBeInTheDocument();
  });

  it('filters active campaigns by search input', () => {
    render(
      <RecallRegistryModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    const searchInput = screen.getByTestId('recall-search-input');
    fireEvent.change(searchInput, { target: { value: 'İnteqrasiya' } });

    expect(screen.getByText(/İnteqrasiya Olunmuş Əyləc Sistemi/i)).toBeInTheDocument();

    // Search for non-existing term
    fireEvent.change(searchInput, { target: { value: 'NonExistentTermXYZ' } });
    expect(screen.getByText(/Seçilmiş filtrlərə uyğun geri çağırış kampaniyası tapılmadı/i)).toBeInTheDocument();
  });

  it('navigates to booking tab with pre-selected campaign when book button is clicked', () => {
    render(
      <RecallRegistryModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    // BMW mock vehicle has open IBS recall with id rc-bmw-1
    const bookBtn = screen.getByTestId('book-remedy-btn-rc-bmw-1');
    fireEvent.click(bookBtn);

    expect(screen.getByTestId('recall-booking-form')).toBeInTheDocument();
    const campaignSelect = screen.getByTestId('booking-campaign-select') as HTMLSelectElement;
    expect(campaignSelect.value).toBe('rc-bmw-1');
  });

  it('submits booking form and displays confirmation card with details', () => {
    render(
      <RecallRegistryModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    fireEvent.click(screen.getByTestId('tab-booking'));

    const nameInput = screen.getByTestId('booking-owner-name-input');
    fireEvent.change(nameInput, { target: { value: 'Nijat Huseynov' } });

    const phoneInput = screen.getByTestId('booking-owner-phone-input');
    fireEvent.change(phoneInput, { target: { value: '+994 55 999 88 77' } });

    const submitBtn = screen.getByTestId('submit-booking-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByTestId('booking-confirmation-card')).toBeInTheDocument();
    expect(screen.getByText(/Nijat Huseynov/i)).toBeInTheDocument();
    expect(screen.getByText(/APT-RECALL-/i)).toBeInTheDocument();
  });

  it('copies certificate code and triggers print in certificate tab', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <RecallRegistryModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    fireEvent.click(screen.getByTestId('tab-certificate'));

    const copyBtn = screen.getByTestId('copy-cert-code-btn');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    const printBtn = screen.getByTestId('print-certificate-btn');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    printSpy.mockRestore();
  });
});
