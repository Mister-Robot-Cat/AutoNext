import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VinHistoryModal } from '../VinHistoryModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'v1',
  title: 'Toyota Camry 2.5 Hybrid',
  vin: 'JT1B53HK1J1234567',
  make: 'Toyota',
  model: 'Camry',
  year: 2022,
  priceAzn: 45000,
  mileageKm: 35000,
  engineVolumeLiters: 2.5,
  fuelType: 'hybrid',
  transmission: 'automatic',
  drivetrain: 'fwd',
  powerHp: 218,
  fuelConsumptionLPer100Km: 4.5,
  bodyType: 'sedan',
  color: 'White',
  interiorColor: 'Black',
  interiorMaterial: 'leather',
  city: 'Baku',
  images: ['/img1.jpg'],
  features: ['Bluetooth'],
  damageReport: [],
  valuation: {
    status: 'fair_price',
    percentageDiff: 0,
    avgMarketPriceAzn: 45000,
    minMarketPriceAzn: 43000,
    maxMarketPriceAzn: 47000,
    confidenceScore: 90,
    priceHistoryTrend: []
  },
  seller: {
    id: 's1',
    name: 'Toyota Absheron',
    phone: '+994501234567',
    type: 'official_dealer',
    rating: 4.8,
    reviewsCount: 150,
    verifiedIdentity: true,
    memberSinceYear: 2015,
    city: 'Baku'
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2023-10-01',
  viewsCount: 120,
  description: 'Perfect condition'
};

describe('VinHistoryModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when vehicle is null', () => {
    const { container } = render(
      <VinHistoryModal vehicle={null} lang="az" onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when vehicle is provided', () => {
    render(
      <VinHistoryModal vehicle={mockVehicle} lang="az" onClose={mockOnClose} />
    );
    
    // Check if the VIN is displayed
    expect(screen.getByText(/JT1B53HK1J1234567/i)).toBeDefined();
    // Check if the title is displayed
    expect(screen.getByText(/AutoNext VIN Tarixçəsi/i)).toBeDefined();
    // Check if origin country is mapped correctly for Toyota (Yaponiya)
    expect(screen.getByText(/Yaponiya/i)).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <VinHistoryModal vehicle={mockVehicle} lang="az" onClose={mockOnClose} />
    );
    
    // Find close button by searching for the button containing the X icon
    // Since lucide-react doesn't render an aria-label by default, we can select the button next to the print button
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons[buttons.length - 1]; // The X button is the last one
    
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('stops propagation when modal content is clicked', () => {
    const { container } = render(
      <VinHistoryModal vehicle={mockVehicle} lang="az" onClose={mockOnClose} />
    );
    
    // Click the inner modal container
    const modalContent = container.querySelector('.bg-slate-900.border');
    if (modalContent) {
      fireEvent.click(modalContent);
    }
    
    // onClose should not be called because stopPropagation should prevent it
    expect(mockOnClose).not.toHaveBeenCalled();
  });
  
  it('displays the correct mileage', () => {
    render(
      <VinHistoryModal vehicle={mockVehicle} lang="az" onClose={mockOnClose} />
    );
    // 35,000 km
    const elements = screen.getAllByText(/35,000 km/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});
