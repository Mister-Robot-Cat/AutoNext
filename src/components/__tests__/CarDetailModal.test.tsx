import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CarDetailModal } from '../CarDetailModal';
import { Vehicle } from '../../types/vehicle';

// Mock dependencies
vi.mock('../../hooks/useShare', () => ({
  useShare: () => ({
    share: vi.fn(),
    isShared: false
  })
}));

vi.mock('../CarRotationViewer', () => ({
  CarRotationViewer: () => <div data-testid="car-rotation-viewer" />
}));

vi.mock('../PriceDepreciationChart', () => ({
  PriceDepreciationChart: () => <div data-testid="price-depreciation-chart" />
}));

vi.mock('../LightboxViewer', () => ({
  LightboxViewer: ({ onClose }: any) => (
    <div data-testid="lightbox-viewer">
      <button onClick={onClose} data-testid="close-lightbox">Close Lightbox</button>
    </div>
  )
}));

const mockVehicle: Vehicle = {
  id: '123',
  title: 'Toyota Camry XSE',
  vin: 'JT11234567890ABCD',
  make: 'Toyota',
  model: 'Camry',
  year: 2022,
  priceAzn: 45000,
  mileageKm: 15000,
  engineVolumeLiters: 2.5,
  fuelType: 'petrol',
  transmission: 'automatic',
  drivetrain: 'fwd',
  powerHp: 206,
  fuelConsumptionLPer100Km: 7.5,
  bodyType: 'sedan',
  color: 'White',
  interiorColor: 'Black',
  interiorMaterial: 'leather',
  city: 'Baku',
  images: ['img1.jpg', 'img2.jpg'],
  features: ['Bluetooth', 'Backup Camera'],
  damageReport: [
    { partId: 'front_bumper', partName: 'Front Bumper', severity: 'cosmetic_paint', notes: 'Minor scratch' },
    { partId: 'roof', partName: 'Roof', severity: 'none' }
  ],
  valuation: {
    status: 'good_deal',
    percentageDiff: -5,
    avgMarketPriceAzn: 47000,
    minMarketPriceAzn: 42000,
    maxMarketPriceAzn: 50000,
    confidenceScore: 90,
    priceHistoryTrend: []
  },
  seller: {
    id: 's1',
    name: 'Baku Prestige',
    phone: '+994501234567',
    type: 'autocenter',
    rating: 4.8,
    reviewsCount: 120,
    verifiedIdentity: true,
    memberSinceYear: 2015,
    city: 'Baku'
  },
  isVerified: true,
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2023-10-01T10:00:00Z',
  viewsCount: 250,
  description: 'Great condition description.'
};

describe('CarDetailModal', () => {
  let onCloseMock: any;
  let onOpenLoanForCarMock: any;
  let onOpenVinHistoryMock: any;
  let onOpenDealershipMock: any;

  beforeEach(() => {
    onCloseMock = vi.fn();
    onOpenLoanForCarMock = vi.fn();
    onOpenVinHistoryMock = vi.fn();
    onOpenDealershipMock = vi.fn();
  });

  const renderModal = () => render(
    <CarDetailModal
      vehicle={mockVehicle}
      currency="AZN"
      lang="az"
      onClose={onCloseMock}
      onOpenLoanForCar={onOpenLoanForCarMock}
      onOpenVinHistory={onOpenVinHistoryMock}
      onOpenDealership={onOpenDealershipMock}
    />
  );

  it('does not render if vehicle is null', () => {
    const { container } = render(
      <CarDetailModal
        vehicle={null}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
        onOpenLoanForCar={onOpenLoanForCarMock}
        onOpenVinHistory={onOpenVinHistoryMock}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders vehicle details correctly', () => {
    renderModal();
    
    expect(screen.getByText('Toyota Camry XSE')).toBeInTheDocument();
    expect(screen.getByText(/JT11234567890ABCD/)).toBeInTheDocument();
    expect(screen.getByText('Baku Prestige')).toBeInTheDocument();
    expect(screen.getByText('Great condition description.')).toBeInTheDocument();
    expect(screen.getByText('45,000 ₼')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderModal();
    // In our modal header, there's a close button with X icon.
    // It's the button that calls onClose.
    const closeButtons = screen.getAllByRole('button').filter(b => b.classList.contains('bg-slate-800'));
    // Usually the share and close buttons are side by side. We can target it via the X icon or click onClose mock directly.
    // Easiest is to simulate click on the specific button.
    const closeBtn = closeButtons[1]; // Share is [0], Close is [1]
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenLoanForCar when loan shortcut is clicked', () => {
    renderModal();
    const loanBtn = screen.getByText(/Kreditlə aylıq:/);
    fireEvent.click(loanBtn);
    expect(onOpenLoanForCarMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('calls onOpenVinHistory when vin shortcut is clicked', () => {
    renderModal();
    const vinBtn = screen.getByText('VIN Tarixçəsi & Yürüş Hesabatı');
    fireEvent.click(vinBtn);
    expect(onOpenVinHistoryMock).toHaveBeenCalledWith(mockVehicle);
  });

  it('calls onOpenDealership when seller info is clicked', () => {
    renderModal();
    const sellerInfo = screen.getByText('Baku Prestige').closest('div.group');
    if (sellerInfo) {
      fireEvent.click(sellerInfo);
    }
    expect(onOpenDealershipMock).toHaveBeenCalledWith(mockVehicle.seller);
  });

  it('switches between gallery and 360 mode', () => {
    renderModal();
    
    const mode360Btn = screen.getByText('360° Studio Baxışı');
    fireEvent.click(mode360Btn);
    expect(screen.getByTestId('car-rotation-viewer')).toBeInTheDocument();

    const galleryBtn = screen.getByText('Foto Qalereya');
    fireEvent.click(galleryBtn);
    expect(screen.queryByTestId('car-rotation-viewer')).not.toBeInTheDocument();
  });

  it('opens and closes lightbox viewer', () => {
    renderModal();
    
    // Click on the main image
    const mainImg = screen.getByAltText('Toyota Camry XSE');
    fireEvent.click(mainImg);
    
    expect(screen.getByTestId('lightbox-viewer')).toBeInTheDocument();

    // Close lightbox
    const closeLightboxBtn = screen.getByTestId('close-lightbox');
    fireEvent.click(closeLightboxBtn);
    
    expect(screen.queryByTestId('lightbox-viewer')).not.toBeInTheDocument();
  });

  it('shows damage part details when a part is clicked', () => {
    renderModal();
    
    const bumperBtn = screen.getByText('Front Bumper');
    fireEvent.click(bumperBtn);
    
    // Should show details
    expect(screen.getByText('Minor scratch')).toBeInTheDocument();
  });
});
