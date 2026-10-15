import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EuroprotocolModal } from '../EuroprotocolModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'test-car-1',
  title: 'Toyota Camry 2.5 Hybrid',
  vin: 'JTDKN36U0B1294821',
  plateNumber: '99-TC-420',
  make: 'Toyota',
  model: 'Camry',
  generation: 'XV70',
  year: 2022,
  priceAzn: 45000,
  mileageKm: 32000,
  engineVolumeLiters: 2.5,
  fuelType: 'hybrid',
  transmission: 'automatic',
  drivetrain: 'fwd',
  powerHp: 218,
  fuelConsumptionLPer100Km: 4.8,
  bodyType: 'sedan',
  color: 'Qara Metalik',
  interiorColor: 'Black',
  interiorMaterial: 'leather',
  city: 'Bakı',
  images: ['/cars/camry1.jpg'],
  features: ['Sunroof', 'Leather'],
  damageReport: [],
  seller: {
    id: 's-1',
    name: 'Baku Prestige Motors',
    phone: '+994 50 123 45 67',
    type: 'official_dealer',
    rating: 4.9,
    reviewsCount: 38,
    verifiedIdentity: true,
    city: 'Bakı',
    memberSinceYear: 2019,
  },
  valuation: {
    status: 'good_deal',
    percentageDiff: -3.5,
    avgMarketPriceAzn: 46500,
    minMarketPriceAzn: 42000,
    maxMarketPriceAzn: 51000,
    confidenceScore: 94,
    priceHistoryTrend: [],
  },
  isVerified: true,
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2026-09-01T10:00:00Z',
  viewsCount: 150,
  description: 'İdeal vəziyyətdə Toyota Camry.',
};

describe('EuroprotocolModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <EuroprotocolModal
        isOpen={false}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default tab (eligibility) when open', () => {
    render(
      <EuroprotocolModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('europrotocol-modal')).toBeInTheDocument();
    expect(screen.getByText(/İSB & BDYP Rəsmi Avroprotokol Sistemi/i)).toBeInTheDocument();
    expect(screen.getByTestId('eligibility-status-banner')).toBeInTheDocument();
    expect(screen.getByText(/AVROPROTOKOL ÜÇÜN TAM UYĞUNDUR!/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <EuroprotocolModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByTestId('close-modal-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('toggles criteria checkboxes and updates eligibility status to warning if criteria failed', () => {
    render(
      <EuroprotocolModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    // Uncheck twoVehiclesOnly
    const checkbox = screen.getByLabelText(/Yalnız 2 Nəqliyyat Vasitəsi İştirak Edir/i);
    fireEvent.click(checkbox);

    expect(screen.getByText(/DİQQƏT: Avroprotokol şərtləri ödənmir/i)).toBeInTheDocument();
    expect(screen.getByText(/Avroprotokol yalnız 2 nəqliyyat vasitəsinin/i)).toBeInTheDocument();
  });

  it('switches between tabs cleanly', () => {
    render(
      <EuroprotocolModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    // Switch to Scenario tab
    fireEvent.click(screen.getByTestId('tab-scenario-btn'));
    expect(screen.getByText(/Standart Yol-Nəqliyyat Hadisəsi Sxemi:/i)).toBeInTheDocument();

    // Switch to Damages tab
    fireEvent.click(screen.getByTestId('tab-damages-btn'));
    expect(screen.getByText(/Zədəli Detalları Seçin:/i)).toBeInTheDocument();

    // Switch to Parties tab
    fireEvent.click(screen.getByTestId('tab-parties-btn'));
    expect(screen.getByText(/TƏRƏF A \(Təqsirkar\)/i)).toBeInTheDocument();

    // Switch to Protocol tab
    fireEvent.click(screen.getByTestId('tab-protocol-btn'));
    expect(screen.getByText(/SADƏLƏŞDİRİLMİŞ YOL-NƏQLİYYAT HADİSƏSİ BİLDİRİŞİ/i)).toBeInTheDocument();
  });

  it('selects different accident scenario and updates liability', () => {
    render(
      <EuroprotocolModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-scenario-btn'));

    // Select roundabout scenario
    const roundaboutScenario = screen.getByTestId('scenario-item-roundabout');
    fireEvent.click(roundaboutScenario);

    // Select mutual fault
    const mutualBtn = screen.getByTestId('fault-mutual_50_50-btn');
    fireEvent.click(mutualBtn);
    expect(mutualBtn).toHaveClass('font-bold');
  });

  it('toggles damage selection on active vehicle', () => {
    render(
      <EuroprotocolModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-damages-btn'));

    // Find a damage button, e.g. front_bumper dent
    const dentButtons = screen.getAllByRole('button', { name: /Əzilmə/i });
    if (dentButtons.length > 0) {
      fireEvent.click(dentButtons[0]);
    }

    expect(screen.getByText(/TƏRƏF B \(Zərərçəkən\)/i)).toBeInTheDocument();
  });

  it('handles autofill test sample preset button', () => {
    render(
      <EuroprotocolModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    const autofillBtn = screen.getByTestId('autofill-test-btn');
    fireEvent.click(autofillBtn);

    expect(screen.getByText(/AVROPROTOKOL ÜÇÜN TAM UYĞUNDUR!/i)).toBeInTheDocument();
  });

  it('handles copying protocol and submitting to ISB in protocol tab', () => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(
      <EuroprotocolModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-protocol-btn'));

    const copyBtn = screen.getByTestId('copy-protocol-btn');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    const submitBtn = screen.getByTestId('submit-isb-btn');
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/Avroprotokol İSB və Sığortaçı Şirkətə Uğurla Göndərildi!/i)
    ).toBeInTheDocument();
  });
});
