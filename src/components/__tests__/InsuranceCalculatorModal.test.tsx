import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InsuranceCalculatorModal } from '../InsuranceCalculatorModal';
import { Vehicle } from '../../types/vehicle';

describe('InsuranceCalculatorModal Component', () => {
  const mockVehicle: Vehicle = {
    id: 'car-ins-1',
    title: 'BMW 530e iPerformance',
    vin: 'WBA5A7C50JB192841',
    make: 'BMW',
    model: '530e',
    year: 2022,
    priceAzn: 54000,
    mileageKm: 38000,
    engineVolumeLiters: 2.0,
    fuelType: 'hybrid',
    transmission: 'automatic',
    drivetrain: 'rwd',
    powerHp: 292,
    fuelConsumptionLPer100Km: 2.1,
    bodyType: 'sedan',
    color: 'Göy Metallik',
    interiorColor: 'Qara',
    interiorMaterial: 'leather',
    city: 'Bakı',
    images: ['/cars/bmw530e.jpg'],
    features: ['M Sport', 'Lyuk', 'Harman Kardon'],
    damageReport: [],
    valuation: {
      status: 'fair_price',
      percentageDiff: 0,
      avgMarketPriceAzn: 54000,
      minMarketPriceAzn: 52000,
      maxMarketPriceAzn: 56000,
      confidenceScore: 92,
      priceHistoryTrend: []
    },
    seller: {
      id: 's1',
      name: 'Baku Prestige Motors',
      phone: '+994 50 111 22 33',
      type: 'official_dealer',
      rating: 4.9,
      reviewsCount: 88,
      verifiedIdentity: true,
      memberSinceYear: 2019,
      city: 'Bakı'
    },
    hasCustomsCleared: true,
    isCreditAvailable: true,
    isBarterAvailable: true,
    publishedDate: '2026-10-05',
    viewsCount: 310,
    description: 'Rəsmi servisdə qulluq olunub.'
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <InsuranceCalculatorModal
        isOpen={false}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, vehicle title, VIN, and navigation tabs when open', () => {
    render(
      <InsuranceCalculatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('insurance-calculator-modal')).toBeInTheDocument();
    expect(screen.getByText('İcbari & KASKO Sığorta Kalkulyatoru')).toBeInTheDocument();
    expect(screen.getByText(/BMW 530e/i)).toBeInTheDocument();
    expect(screen.getByText('WBA5A7C50JB192841')).toBeInTheDocument();
    expect(screen.getByTestId('insurance-tab-calculator')).toBeInTheDocument();
    expect(screen.getByTestId('insurance-tab-compulsory')).toBeInTheDocument();
    expect(screen.getByTestId('insurance-tab-kasko')).toBeInTheDocument();
    expect(screen.getByTestId('insurance-tab-guide')).toBeInTheDocument();
    expect(screen.getByTestId('insurance-tab-policy')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <InsuranceCalculatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const closeBtn = screen.getByTestId('insurance-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches between tabs properly', () => {
    render(
      <InsuranceCalculatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    // Initial is calculator
    expect(screen.getByTestId('tab-calculator-content')).toBeInTheDocument();

    // Switch to compulsory
    fireEvent.click(screen.getByTestId('insurance-tab-compulsory'));
    expect(screen.getByTestId('tab-compulsory-content')).toBeInTheDocument();
    expect(screen.getByText('İcbari Sığorta Qanuni Tarif Formulu')).toBeInTheDocument();

    // Switch to kasko
    fireEvent.click(screen.getByTestId('insurance-tab-kasko'));
    expect(screen.getByTestId('tab-kasko-content')).toBeInTheDocument();
    expect(screen.getByText('5 Aparıcı Sığorta Şirkətinin KASKO Təklifləri')).toBeInTheDocument();

    // Switch to guide
    fireEvent.click(screen.getByTestId('insurance-tab-guide'));
    expect(screen.getByTestId('tab-guide-content')).toBeInTheDocument();
    expect(screen.getByText('Yol-Nəqliyyat Hadisəsi Zamanı Təcili Addımlar')).toBeInTheDocument();

    // Switch to policy
    fireEvent.click(screen.getByTestId('insurance-tab-policy'));
    expect(screen.getByTestId('tab-policy-content')).toBeInTheDocument();
    expect(screen.getByText('Rəsmi Elektron Sığorta Müraciəti')).toBeInTheDocument();
  });

  it('adjusts Bonus-Malus slider and updates badge in calculator tab', () => {
    render(
      <InsuranceCalculatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const bmSliders = screen.getAllByRole('slider');
    // First range is car price, second is BM
    const bmSlider = bmSliders[1];
    fireEvent.change(bmSlider, { target: { value: '18' } });

    expect(screen.getAllByText(/BM 18 \(Güzəştli\)/i).length).toBeGreaterThan(0);
  });

  it('updates franchise selection', () => {
    render(
      <InsuranceCalculatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const f1000Btn = screen.getByText('1000 ₼');
    fireEvent.click(f1000Btn);
    expect(f1000Btn).toHaveClass('bg-sky-600');
  });

  it('toggles add-on checkboxes', () => {
    render(
      <InsuranceCalculatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const replacementCarCheckbox = screen.getByLabelText(/Əvəzedici Avtomobil Təminatı/i);
    expect(replacementCarCheckbox).not.toBeChecked();
    fireEvent.click(replacementCarCheckbox);
    expect(replacementCarCheckbox).toBeChecked();
  });

  it('switches to policy application and generates digital certificate', () => {
    render(
      <InsuranceCalculatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    // Go to policy tab
    fireEvent.click(screen.getByTestId('insurance-tab-policy'));

    // Submit application
    const submitBtn = screen.getByTestId('submit-insurance-application-btn');
    fireEvent.click(submitBtn);

    // Certificate view should now be displayed
    expect(screen.getByTestId('issued-certificate-view')).toBeInTheDocument();
    expect(screen.getByText('RƏSMİ ELEKTRON SIĞORTA ŞƏHADƏTNAMƏSİ')).toBeInTheDocument();
    expect(screen.getByText('STATUS: QÜVVƏDƏDİR')).toBeInTheDocument();
    expect(screen.getByText(/SİMA Rəqəmsal İmza Şifrəsi:/i)).toBeInTheDocument();
  });

  it('handles certificate copy and print actions', () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true,
      writable: true
    });
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <InsuranceCalculatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    // Go to policy tab and submit
    fireEvent.click(screen.getByTestId('insurance-tab-policy'));
    fireEvent.click(screen.getByTestId('submit-insurance-application-btn'));

    // Click Copy button
    const copyBtn = screen.getByTestId('copy-insurance-cert-btn');
    fireEvent.click(copyBtn);
    expect(mockWriteText).toHaveBeenCalled();

    // Click Print button
    const printBtn = screen.getByTestId('print-insurance-cert-btn');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });
});
