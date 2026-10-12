import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LienRegistryModal } from '../LienRegistryModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'test-car-lien',
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
  images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800'],
  features: ['M Sport'],
  damageReport: [],
  valuation: {
    status: 'fair_price',
    percentageDiff: 0,
    avgMarketPriceAzn: 68500,
    minMarketPriceAzn: 65000,
    maxMarketPriceAzn: 72000,
    confidenceScore: 90,
    priceHistoryTrend: [],
  },
  seller: {
    id: 'seller-bmw',
    name: 'Elmir Həsənov',
    phone: '+994 50 111 22 33',
    type: 'private',
    rating: 4.9,
    reviewsCount: 8,
    verifiedIdentity: true,
    memberSinceYear: 2021,
    city: 'Bakı',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2026-03-15',
  viewsCount: 150,
  description: 'Təmiz mülkiyyət, sənədlər qaydasındadır.',
};

describe('LienRegistryModal Component', () => {
  const defaultProps = {
    isOpen: true,
    vehicle: mockVehicle,
    lang: 'az' as const,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and initial vehicle verification details', () => {
    render(<LienRegistryModal {...defaultProps} />);

    expect(screen.getByText('DİN & Girov Reyestri Yoxlanışı')).toBeInTheDocument();
    expect(screen.getByText(/TƏMİZ MÜLKİYYƏT/i)).toBeInTheDocument();
    expect(screen.getByText(/DİN \/ İnterpol Axtarış Statusu/i)).toBeInTheDocument();
    expect(screen.getByText(/Təminatlı Əqdlər \(Bank Girov Reyestri\)/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<LienRegistryModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly with null vehicle and default query', () => {
    render(<LienRegistryModal {...defaultProps} vehicle={null} />);
    expect(screen.getByText('DİN & Girov Reyestri Yoxlanışı')).toBeInTheDocument();
    expect(screen.getByText('Reyestrdə Yoxla')).toBeInTheDocument();
  });

  it('toggles between overview and official certificate view', () => {
    render(<LienRegistryModal {...defaultProps} />);

    const certToggleBtn = screen.getByRole('button', { name: /Rəsmi Arayış/i });
    fireEvent.click(certToggleBtn);

    expect(screen.getByText(/Arayışı Kopyala/i)).toBeInTheDocument();
    expect(screen.getByText(/Çap Et/i)).toBeInTheDocument();
    expect(screen.getByText(/AZƏRBAYCAN RESPUBLİKASI DAXİLİ İŞLƏR NAZİRLİYİ/i)).toBeInTheDocument();

    // Toggle back to overview
    fireEvent.click(certToggleBtn);
    expect(screen.getByText(/Təhlükəsizlik Reytinqi/i)).toBeInTheDocument();
  });

  it('handles search form submission with plate number', () => {
    render(<LienRegistryModal {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/VIN kodu və ya Dövlət Nömrəsini daxil edin/i);
    fireEvent.change(searchInput, { target: { value: '77-TC-070' } });

    const submitBtn = screen.getByRole('button', { name: /Reyestrdə Yoxla/i });
    fireEvent.click(submitBtn);

    expect(screen.getAllByText(/Toyota/i).length).toBeGreaterThan(0);
    expect(screen.getByText('77-TC-070')).toBeInTheDocument();
  });

  it('applies quick sample pills to simulate different registry statuses', () => {
    render(<LienRegistryModal {...defaultProps} />);

    // Click Tucson sample (Kapital Bank active lien)
    const tucsonPill = screen.getByText('Tucson (Kapital Bank Girov)');
    fireEvent.click(tucsonPill);

    expect(screen.getByText(/DİQQƏT: BANK GİROVUNDA OLAN AVTOMOBİL/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Kapital Bank ASC/i).length).toBeGreaterThan(0);
  });

  it('detects court enforcement hold when searching for restricted vehicle', () => {
    render(<LienRegistryModal {...defaultProps} />);

    const fordPill = screen.getByText('Ford (Məhkəmə Həbsi)');
    fireEvent.click(fordPill);

    expect(screen.getByText(/TƏHLÜKƏLİ: HƏBS VƏ YA AXTARIŞ QEYDİ VAR/i)).toBeInTheDocument();
  });

  it('calls window.print when print button is clicked in certificate view', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<LienRegistryModal {...defaultProps} />);

    const certToggleBtn = screen.getByRole('button', { name: /Rəsmi Arayış/i });
    fireEvent.click(certToggleBtn);

    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('calls onClose when close button is clicked', () => {
    render(<LienRegistryModal {...defaultProps} />);

    const closeBtn = screen.getByLabelText('Bağla');
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
