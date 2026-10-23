import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LeasingModal } from '../LeasingModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'test-car-1',
  title: 'Toyota Camry 2.5 Hybrid',
  make: 'Toyota',
  model: 'Camry',
  year: 2024,
  priceAzn: 68000,
  mileageKm: 12000,
  engineVolumeLiters: 2.5,
  fuelType: 'hybrid',
  transmission: 'automatic',
  drivetrain: 'fwd',
  powerHp: 208,
  fuelConsumptionLPer100Km: 5.2,
  bodyType: 'sedan',
  color: 'White Pearl',
  interiorColor: 'Black',
  interiorMaterial: 'leather',
  city: 'Baku',
  vin: '4T1B11HK5RU635191',
  plateNumber: '10-OA-519',
  images: ['/cars/camry1.jpg'],
  features: ['Sunroof', 'Leather'],
  damageReport: [],
  valuation: {
    status: 'good_deal',
    percentageDiff: -4,
    avgMarketPriceAzn: 71000,
    minMarketPriceAzn: 65000,
    maxMarketPriceAzn: 75000,
    confidenceScore: 92,
    priceHistoryTrend: [],
  },
  seller: {
    id: 's1',
    name: 'Toyota Absheron Center',
    phone: '+994 50 123 45 67',
    type: 'official_dealer',
    rating: 4.9,
    reviewsCount: 35,
    verifiedIdentity: true,
    memberSinceYear: 2018,
    city: 'Baku',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2024-01-01',
  viewsCount: 120,
  description: 'Full complex condition',
};

describe('LeasingModal Component', () => {
  it('renders modal header, title, and default calculator tab when open', () => {
    render(
      <LeasingModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
        currency="AZN"
      />
    );

    expect(screen.getByText('AMB & ALA Rəsmi Avtomobil Lizinqi Portalı')).toBeInTheDocument();
    expect(screen.getByText('Kalkulyator & Vergi Qənaəti')).toBeInTheDocument();
    expect(screen.getByText('Aylıq Lizinq Ödənişi')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <LeasingModal
        isOpen={false}
        onClose={vi.fn()}
        vehicle={mockVehicle}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <LeasingModal
        isOpen={true}
        onClose={handleClose}
        vehicle={mockVehicle}
      />
    );

    const closeBtn = screen.getByLabelText('Bağla');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 5 navigation tabs', () => {
    render(
      <LeasingModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
      />
    );

    // Tab 2: Schedule
    const scheduleTabBtn = screen.getByText(/Ödəniş Qrafiki/i);
    fireEvent.click(scheduleTabBtn);
    expect(screen.getByText(/Aylıq Lizinq Ödəniş Qrafiki/i)).toBeInTheDocument();
    expect(screen.getByText('Başlanğıc Qalıq')).toBeInTheDocument();

    // Tab 3: Companies
    const companiesTabBtn = screen.getByText(/Lizinq Şirkətləri/i);
    fireEvent.click(companiesTabBtn);
    expect(screen.getByPlaceholderText(/Lizinq şirkətinin adı, VÖEN/i)).toBeInTheDocument();
    expect(screen.getByText('PAŞA Lizinq ASC')).toBeInTheDocument();

    // Tab 4: Registry
    const registryTabBtn = screen.getByText('Müqavilə Reyestri');
    fireEvent.click(registryTabBtn);
    expect(screen.getByPlaceholderText(/Müqavilə nömrəsi, Müştəri adı/i)).toBeInTheDocument();
    expect(screen.getByText(/Caspian Logistics Group MMC/i)).toBeInTheDocument();

    // Tab 5: Certificate
    const certTabBtn = screen.getByText('Elektron Şəhadətnamə');
    fireEvent.click(certTabBtn);
    expect(screen.getByText('RƏSMİ ELEKTRON LİZİNQ ŞƏHADƏTNAMƏSİ')).toBeInTheDocument();
  });

  it('updates calculations when preset vehicle is selected', () => {
    render(
      <LeasingModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const bydPresetBtn = screen.getByText(/BYD Song Plus EV/i);
    fireEvent.click(bydPresetBtn);

    expect(screen.getAllByText('52,000.00 ₼').length).toBeGreaterThanOrEqual(1);
  });

  it('filters leasing companies by search and category in Companies tab', () => {
    render(
      <LeasingModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Switch to companies tab
    fireEvent.click(screen.getByText(/Lizinq Şirkətləri/i));

    const searchInput = screen.getByPlaceholderText(/Lizinq şirkətinin adı, VÖEN/i);
    fireEvent.change(searchInput, { target: { value: 'Prior' } });

    expect(screen.getByText('Prior Leasing ASC')).toBeInTheDocument();
    expect(screen.queryByText('PAŞA Lizinq ASC')).not.toBeInTheDocument();
  });

  it('filters active lease contracts in Registry tab', () => {
    render(
      <LeasingModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Müqavilə Reyestri'));

    const searchInput = screen.getByPlaceholderText(/Müqavilə nömrəsi, Müştəri adı/i);
    fireEvent.change(searchInput, { target: { value: 'AzərTexno' } });

    expect(screen.getByText('AzərTexno Construction MMC')).toBeInTheDocument();
    expect(screen.queryByText('Caspian Logistics Group MMC')).not.toBeInTheDocument();
  });

  it('handles copy and print operations in Certificate tab', () => {
    const originalClipboard = navigator.clipboard;
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const printMock = vi.fn();
    window.print = printMock;

    render(
      <LeasingModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByText('Elektron Şəhadətnamə'));

    const copyBtn = screen.getByText('Kopyala');
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const printBtn = screen.getByText('Çap et');
    fireEvent.click(printBtn);
    expect(printMock).toHaveBeenCalled();

    Object.assign(navigator, { clipboard: originalClipboard });
  });
});
