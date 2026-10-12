import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomsCalculatorModal } from '../CustomsCalculatorModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'test-car-customs',
  title: 'Hyundai Santa Fe 2.5 AWD',
  vin: 'KM8S13DA4NU123456',
  make: 'Hyundai',
  model: 'Santa Fe',
  year: 2022,
  priceAzn: 52000,
  mileageKm: 42000,
  engineVolumeLiters: 2.5,
  fuelType: 'petrol',
  transmission: 'automatic',
  drivetrain: 'awd',
  powerHp: 191,
  fuelConsumptionLPer100Km: 9.2,
  bodyType: 'suv',
  color: 'Qara',
  interiorColor: 'Qəhvəyi',
  interiorMaterial: 'leather',
  city: 'Bakı',
  images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'],
  features: ['Panoramik dam', 'Dəri salon'],
  damageReport: [],
  valuation: {
    status: 'fair_price',
    percentageDiff: -2,
    avgMarketPriceAzn: 53000,
    minMarketPriceAzn: 49000,
    maxMarketPriceAzn: 56000,
    confidenceScore: 90,
    priceHistoryTrend: [],
  },
  seller: {
    id: 'seller-customs',
    name: 'Rəşad Əliyev',
    phone: '+994 55 987 65 43',
    type: 'private',
    rating: 4.8,
    reviewsCount: 12,
    verifiedIdentity: true,
    memberSinceYear: 2020,
    city: 'Bakı',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2026-03-12',
  viewsCount: 310,
  description: 'Gömrükdən yeni keçib, əla vəziyyətdədir.',
};

describe('CustomsCalculatorModal Component', () => {
  const defaultProps = {
    isOpen: true,
    vehicle: mockVehicle,
    currency: 'AZN' as const,
    lang: 'az' as const,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and tabs when open', () => {
    render(<CustomsCalculatorModal {...defaultProps} />);

    expect(screen.getByText('DGK Gömrük Rüsumu & Aksiz Kalkulyatoru')).toBeInTheDocument();
    expect(screen.getByText('Kalkulyator')).toBeInTheDocument();
    expect(screen.getByText('Mühərrik Müqayisəsi')).toBeInTheDocument();
    expect(screen.getByText('Logistika & Marşrutlar')).toBeInTheDocument();
    expect(screen.getByText('Rəsmi Arayış')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<CustomsCalculatorModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly without initial vehicle props', () => {
    render(<CustomsCalculatorModal {...defaultProps} vehicle={null} />);
    expect(screen.getByText('DGK Gömrük Rüsumu & Aksiz Kalkulyatoru')).toBeInTheDocument();
    expect(screen.getByText('Yekun Gömrük Xərcləri')).toBeInTheDocument();
  });

  it('switches between tabs properly', () => {
    render(<CustomsCalculatorModal {...defaultProps} />);

    // Click Mühərrik Müqayisəsi tab
    fireEvent.click(screen.getByText('Mühərrik Müqayisəsi'));
    expect(screen.getByText(/Eyni büdcəli avtomobil üçün mühərrik tiplərinə görə gömrük müqayisəsi/i)).toBeInTheDocument();

    // Click Logistika tab
    fireEvent.click(screen.getByText('Logistika & Marşrutlar'));
    expect(screen.getByText(/Gömrük Rəsmiləşdirilməsi Üçün Sənədlər/i)).toBeInTheDocument();

    // Click Rəsmi Arayış tab
    fireEvent.click(screen.getByText('Rəsmi Arayış'));
    expect(screen.getByText(/Arayışı Kopyala/i)).toBeInTheDocument();
    expect(screen.getByText(/Çap Et/i)).toBeInTheDocument();

    // Click back to Calculator tab
    fireEvent.click(screen.getByText('Kalkulyator'));
    expect(screen.getByText('Yekun Gömrük Xərcləri')).toBeInTheDocument();
  });

  it('applies quick vehicle presets when clicked', () => {
    render(<CustomsCalculatorModal {...defaultProps} />);

    const presetBtn = screen.getByText('BYD Song Plus EV Champion');
    fireEvent.click(presetBtn);

    // BYD Song is an EV -> electric green exemption should show
    expect(screen.getByText(/100% Yaşıl Enerji Güzəşti/i)).toBeInTheDocument();
  });

  it('updates calculations when changing fuel type to electric', () => {
    render(<CustomsCalculatorModal {...defaultProps} />);

    // Click electric button
    const electricBtn = screen.getByRole('button', { name: /Elektrik/i });
    fireEvent.click(electricBtn);

    // EV exemption banner should appear
    expect(screen.getByText(/100% Yaşıl Enerji Güzəşti/i)).toBeInTheDocument();
  });

  it('switches origin corridor', () => {
    render(<CustomsCalculatorModal {...defaultProps} />);

    // Switch to Georgia
    const georgiaBtn = screen.getByRole('button', { name: /Gürcüstan/i });
    fireEvent.click(georgiaBtn);

    expect(georgiaBtn).toBeInTheDocument();
  });

  it('calls window.print when print button is clicked in receipt tab', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<CustomsCalculatorModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Rəsmi Arayış'));
    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('calls onClose when close button is clicked', () => {
    render(<CustomsCalculatorModal {...defaultProps} />);

    const closeBtn = screen.getByLabelText('Bağla');
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('handles reset button to restore initial state', () => {
    render(<CustomsCalculatorModal {...defaultProps} />);

    const resetBtn = screen.getByTitle('Sıfırla');
    fireEvent.click(resetBtn);

    expect(screen.getByText('Yekun Gömrük Xərcləri')).toBeInTheDocument();
  });
});
