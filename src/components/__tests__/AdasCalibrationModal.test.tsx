import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdasCalibrationModal } from '../AdasCalibrationModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'v-101',
  title: 'BMW 530i 2021',
  vin: 'WBA53AH07PCH28194',
  plateNumber: '90-OJ-055',
  make: 'BMW',
  model: '530i',
  year: 2021,
  priceAzn: 68000,
  mileageKm: 45000,
  engineVolumeLiters: 2.0,
  fuelType: 'petrol',
  transmission: 'automatic',
  drivetrain: 'rwd',
  powerHp: 252,
  fuelConsumptionLPer100Km: 6.5,
  bodyType: 'sedan',
  color: 'Qara',
  interiorColor: 'Qara',
  interiorMaterial: 'leather',
  city: 'Bakı',
  viewsCount: 120,
  publishedDate: '2026-01-01',
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  description: 'BMW 530i xDrive',
  damageReport: [],
  valuation: {
    status: 'fair_price',
    percentageDiff: 0,
    avgMarketPriceAzn: 68000,
    minMarketPriceAzn: 65000,
    maxMarketPriceAzn: 71000,
    confidenceScore: 95,
    priceHistoryTrend: []
  },
  seller: {
    id: 'seller-1',
    name: 'Elvin',
    phone: '+994 50 123 45 67',
    rating: 4.8,
    reviewsCount: 15,
    type: 'private',
    verifiedIdentity: true,
    memberSinceYear: 2022,
    city: 'Bakı'
  },
  images: ['/cars/bmw.jpg'],
  features: ['ADAS', 'Laser Lights']
} as Vehicle;

describe('AdasCalibrationModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve())
      }
    });
    window.print = vi.fn();
  });

  it('renders modal header, title, and default tab (audit) when open', () => {
    render(
      <AdasCalibrationModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
      />
    );

    expect(screen.getByTestId('adas-calibration-modal')).toBeInTheDocument();
    expect(screen.getByText(/Rəsmi ADAS Sensor & Kamera Kalibrasiyası Portalı/i)).toBeInTheDocument();
    expect(screen.getByTestId('tab-audit')).toBeInTheDocument();
    expect(screen.getByText(/Kalibrasiyanı Zəruri Edən Səbəb və Hadisə/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <AdasCalibrationModal
        isOpen={false}
        onClose={vi.fn()}
        vehicle={mockVehicle}
      />
    );

    expect(screen.queryByTestId('adas-calibration-modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <AdasCalibrationModal
        isOpen={true}
        onClose={handleClose}
        vehicle={mockVehicle}
      />
    );

    const closeBtn = screen.getByTestId('close-modal-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 5 navigation tabs', () => {
    render(
      <AdasCalibrationModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
      />
    );

    // Switch to simulator
    fireEvent.click(screen.getByTestId('tab-simulator'));
    expect(screen.getByText(/Lazer Stendi Telemetriya Tənzimi/i)).toBeInTheDocument();

    // Switch to systems matrix
    fireEvent.click(screen.getByTestId('tab-systems'));
    expect(screen.getByText(/Dövlət Standartına \(AZS \/ UNECE\) Əsasən Tənzimlənən ADAS Modulları/i)).toBeInTheDocument();

    // Switch to centers radar
    fireEvent.click(screen.getByTestId('tab-centers'));
    expect(screen.getByText(/Akkreditə Olunmuş Rəsmi ADAS Mərkəzləri/i)).toBeInTheDocument();

    // Switch to certificate
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('adas-certificate-view')).toBeInTheDocument();
  });

  it('allows selecting different trigger causes and navigating to simulator', () => {
    render(
      <AdasCalibrationModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
      />
    );

    const bumperCard = screen.getByTestId('trigger-bumper_collision');
    fireEvent.click(bumperCard);

    expect(screen.getByText(/Ön Bamper və Radiator Barmaqlığı Zədəsi \/ Təmiri/i)).toBeInTheDocument();

    const gotoSimulatorBtn = screen.getByTestId('goto-simulator-btn');
    fireEvent.click(gotoSimulatorBtn);

    expect(screen.getByText(/Lazer Stendi Telemetriya Tənzimi/i)).toBeInTheDocument();
  });

  it('handles auto-align button in simulator tab', () => {
    render(
      <AdasCalibrationModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-simulator'));

    const autoAlignBtn = screen.getByTestId('auto-align-btn');
    fireEvent.click(autoAlignBtn);

    const statusBadge = screen.getByTestId('simulator-status-badge');
    expect(statusBadge).toHaveTextContent(/Lazer Uyğundur/i);
  });

  it('advances dynamic road test in simulator tab', () => {
    render(
      <AdasCalibrationModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-simulator'));

    const advanceBtn = screen.getByTestId('advance-road-test-btn');
    fireEvent.click(advanceBtn);

    expect(screen.getByText('35%')).toBeInTheDocument();
  });

  it('filters accredited centers and simulates booking a bay', () => {
    render(
      <AdasCalibrationModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-centers'));

    const searchInput = screen.getByTestId('center-search-input');
    fireEvent.change(searchInput, { target: { value: 'Baku ADAS' } });

    expect(screen.getByTestId('center-card-baku-adas-lab')).toBeInTheDocument();

    const bookBtn = screen.getByTestId('book-center-btn-baku-adas-lab');
    fireEvent.click(bookBtn);

    expect(screen.getByText(/✓ Növbə Alındı/i)).toBeInTheDocument();
  });

  it('updates pricing when changing packages in centers tab', () => {
    render(
      <AdasCalibrationModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-centers'));

    const radarPkg = screen.getByTestId('pkg-front_radar_77ghz');
    fireEvent.click(radarPkg);

    const priceDisplay = screen.getByTestId('total-price-display');
    expect(priceDisplay).toBeInTheDocument();
  });

  it('generates certificate from simulator and allows copy and print actions', () => {
    render(
      <AdasCalibrationModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-simulator'));

    // Align properly
    fireEvent.click(screen.getByTestId('auto-align-btn'));

    // Click generate cert
    const generateBtn = screen.getByTestId('generate-cert-btn');
    fireEvent.click(generateBtn);

    expect(screen.getByTestId('adas-certificate-view')).toBeInTheDocument();

    // Copy cert
    const copyBtn = screen.getByTestId('copy-cert-btn');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    // Print cert
    const printBtn = screen.getByTestId('print-cert-btn');
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);
  });
});
