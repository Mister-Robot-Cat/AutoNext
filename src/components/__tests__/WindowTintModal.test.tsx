import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { WindowTintModal } from '../WindowTintModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'car-1',
  title: 'Toyota Camry 2.5 Hybrid',
  vin: 'JTMBA3FV8MD123456',
  plateNumber: '99-XX-777',
  make: 'Toyota',
  model: 'Camry',
  year: 2022,
  priceAzn: 54000,
  mileageKm: 45000,
  engineVolumeLiters: 2.5,
  fuelType: 'hybrid',
  transmission: 'automatic',
  drivetrain: 'fwd',
  powerHp: 218,
  fuelConsumptionLPer100Km: 4.5,
  bodyType: 'sedan',
  color: 'White Pearl',
  interiorColor: 'Black',
  interiorMaterial: 'leather',
  city: 'Baku',
  images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb'],
  features: ['Sunroof', 'Leather'],
  damageReport: [],
  valuation: {
    status: 'good_deal',
    percentageDiff: -2,
    avgMarketPriceAzn: 55000,
    minMarketPriceAzn: 50000,
    maxMarketPriceAzn: 60000,
    confidenceScore: 94,
    priceHistoryTrend: [],
  },
  seller: {
    id: 's-1',
    name: 'Tural Məmmədov',
    phone: '+994 50 123 45 67',
    type: 'private',
    rating: 4.9,
    reviewsCount: 38,
    verifiedIdentity: true,
    memberSinceYear: 2021,
    city: 'Baku',
  },
  isVerified: true,
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2026-09-15T10:00:00Z',
  viewsCount: 350,
  description: 'Zavod detalları ilə ideal vəziyyətdə.',
};

describe('WindowTintModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(
      <WindowTintModal
        isOpen={false}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByTestId('window-tint-modal')).not.toBeInTheDocument();
  });

  it('renders modal header, vehicle details, and default visualizer tab when open', () => {
    render(
      <WindowTintModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('window-tint-modal')).toBeInTheDocument();
    expect(screen.getByText(/BDYP Şüşələrin Qanuni Tündləşdirilməsi/i)).toBeInTheDocument();
    expect(screen.getByText(/99-XX-777/i)).toBeInTheDocument();
    expect(screen.getByTestId('tab-visualizer-btn')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <WindowTintModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={handleClose}
      />
    );

    fireEvent.click(screen.getByTestId('window-tint-close-btn'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches between tabs cleanly', () => {
    render(
      <WindowTintModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    // Switch to Calculator tab
    fireEvent.click(screen.getByTestId('tab-calculator-btn'));
    expect(screen.getByText(/1. Müraciət Edən Şəxs:/i)).toBeInTheDocument();

    // Switch to Regulations tab
    fireEvent.click(screen.getByTestId('tab-regulations-btn'));
    expect(screen.getByText(/İXM Maddə 342.2-2/i)).toBeInTheDocument();

    // Switch to Certificate tab
    fireEvent.click(screen.getByTestId('tab-certificate-btn'));
    expect(screen.getByText(/Aktiv E-İcazə Tapılmadı/i)).toBeInTheDocument();
  });

  it('applies illegal preset and detects fine violation status', () => {
    render(
      <WindowTintModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('preset-btn-illegal_front_tint'));

    expect(screen.getByTestId('compliance-verdict-banner')).toHaveTextContent(/DİQQƏT: Qanunvericiliyin Pozulması/i);
    expect(screen.getByTestId('cta-get-permit-btn')).toBeInTheDocument();
  });

  it('updates calculator prices when changing applicant and coverage options', () => {
    render(
      <WindowTintModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-calculator-btn'));

    // Default individual rear_side_only: 50 + 2 = 52 ₼
    expect(screen.getByTestId('permit-total-price')).toHaveTextContent('52 ₼');

    // Switch to all rear: 100 + 2 = 102 ₼
    fireEvent.click(screen.getByTestId('coverage-all-rear-btn'));
    expect(screen.getByTestId('permit-total-price')).toHaveTextContent('102 ₼');

    // Switch to corporate entity: 200 + 2 = 202 ₼
    fireEvent.click(screen.getByTestId('applicant-entity-btn'));
    expect(screen.getByTestId('permit-total-price')).toHaveTextContent('202 ₼');
  });

  it('submits permit form, generates electronic permit certificate, and allows copying', async () => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(
      <WindowTintModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-calculator-btn'));
    fireEvent.click(screen.getByTestId('issue-permit-submit-btn'));

    // Should switch to certificate tab
    await waitFor(() => {
      expect(screen.getByTestId('tint-permit-certificate-view')).toBeInTheDocument();
    });

    expect(screen.getByText(/Baş Dövlət Yol Polisi İdarəsi \(BDYP\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/99-XX-777/i).length).toBeGreaterThanOrEqual(1);

    // Copy permit number
    const copyBtn = screen.getByTestId('copy-permit-btn');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
