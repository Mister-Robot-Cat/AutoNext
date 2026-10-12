import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EscrowSimulatorModal } from '../EscrowSimulatorModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'test-car-escrow',
  title: 'Mercedes-Benz E 300 AMG Line',
  vin: 'WDD2130481A987654',
  make: 'Mercedes-Benz',
  model: 'E 300',
  year: 2022,
  priceAzn: 78000,
  mileageKm: 35000,
  engineVolumeLiters: 2.0,
  fuelType: 'petrol',
  transmission: 'automatic',
  drivetrain: 'rwd',
  powerHp: 258,
  fuelConsumptionLPer100Km: 7.3,
  bodyType: 'sedan',
  color: 'Gümüşü Metalik',
  interiorColor: 'Qara Dəri',
  interiorMaterial: 'leather',
  city: 'Bakı',
  images: ['https://example.com/e300.jpg'],
  features: ['Burmester Audio', 'Panoramic Roof'],
  damageReport: [],
  valuation: {
    status: 'great_deal',
    percentageDiff: -5,
    avgMarketPriceAzn: 82000,
    minMarketPriceAzn: 76000,
    maxMarketPriceAzn: 88000,
    confidenceScore: 95,
    priceHistoryTrend: [],
  },
  seller: {
    id: 'seller_1',
    name: 'Baku Prestige Motors QSC',
    phone: '+994 50 123 45 67',
    type: 'official_dealer',
    rating: 4.9,
    reviewsCount: 142,
    verifiedIdentity: true,
    memberSinceYear: 2019,
    city: 'Bakı',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2026-04-01T10:00:00Z',
  viewsCount: 420,
  description: 'Rəsmi diler maşınıdır.',
};

describe('EscrowSimulatorModal Component', () => {
  let onCloseMock: any;

  beforeEach(() => {
    onCloseMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
    window.print = vi.fn();
  });

  it('does not render if isOpen is false or vehicle is null', () => {
    const { container: c1 } = render(
      <EscrowSimulatorModal
        isOpen={false}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );
    expect(c1).toBeEmptyDOMElement();

    const { container: c2 } = render(
      <EscrowSimulatorModal
        isOpen={true}
        vehicle={null}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );
    expect(c2).toBeEmptyDOMElement();
  });

  it('renders modal header, vehicle details, and seller dossier by default', () => {
    render(
      <EscrowSimulatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Satıcı Şəxsiyyət Yoxlanışı & Rəqəmsal Beh/i)).toBeInTheDocument();
    expect(screen.getByText(/Mercedes-Benz E 300 AMG Line/i)).toBeInTheDocument();
    expect(screen.getByText(/Baku Prestige Motors/i)).toBeInTheDocument();
    expect(screen.getByText(/ASAN Login & FİN/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <EscrowSimulatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    const closeBtn = screen.getByLabelText('Close modal');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches between tabs cleanly', () => {
    render(
      <EscrowSimulatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    // Switch to Escrow tab
    const escrowTabBtn = screen.getByRole('button', { name: /Rəqəmsal Beh & Escrow Simulyatoru/i });
    fireEvent.click(escrowTabBtn);
    expect(screen.getByText(/İnteraktiv Escrow Əməliyyat İdarəetmə Paneli/i)).toBeInTheDocument();

    // Switch to Timeline tab
    const timelineTabBtn = screen.getByRole('button', { name: /Əməliyyat Tarixçəsi/i });
    fireEvent.click(timelineTabBtn);
    expect(screen.getByText(/Kriptoqrafik Qeydə Alınmış Əməliyyat Jurnalı/i)).toBeInTheDocument();

    // Switch to Certificate tab
    const certificateTabBtn = screen.getByRole('button', { name: /Rəqəmsal Zəmanət Sənədi/i });
    fireEvent.click(certificateTabBtn);
    expect(screen.getByText(/Rəsmi Rəqəmsal Beh & Escrow Şəhadətnaməsi/i)).toBeInTheDocument();
  });

  it('runs the full interactive simulation lifecycle (lock funds -> pass inspection -> confirm notary)', () => {
    render(
      <EscrowSimulatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    // Go to escrow tab
    const escrowTabBtn = screen.getByRole('button', { name: /Rəqəmsal Beh & Escrow Simulyatoru/i });
    fireEvent.click(escrowTabBtn);

    // 1. Lock funds
    const lockBtn = screen.getByTestId('lock-funds-btn');
    expect(lockBtn).toBeEnabled();
    fireEvent.click(lockBtn);

    // Now inspection buttons should become enabled
    const passInspectionBtn = screen.getByTestId('pass-inspection-btn');
    expect(passInspectionBtn).toBeEnabled();
    expect(lockBtn).toBeDisabled();

    // 2. Pass inspection
    fireEvent.click(passInspectionBtn);

    // 3. Confirm notary transfer
    const confirmNotaryBtn = screen.getByTestId('confirm-notary-btn');
    expect(confirmNotaryBtn).toBeEnabled();
    fireEvent.click(confirmNotaryBtn);

    // Status badge should show completed
    expect(screen.getByText(/Tamamlandı \(Vəsait Satıcıya Ödənildi\)/i)).toBeInTheDocument();
  });

  it('handles inspection failure and refunding flow', () => {
    render(
      <EscrowSimulatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    const escrowTabBtn = screen.getByRole('button', { name: /Rəqəmsal Beh & Escrow Simulyatoru/i });
    fireEvent.click(escrowTabBtn);

    // 1. Lock funds
    fireEvent.click(screen.getByTestId('lock-funds-btn'));

    // 2. Fail inspection
    const failBtn = screen.getByTestId('fail-inspection-btn');
    fireEvent.click(failBtn);

    // Status badge shows inspection failed
    expect(screen.getByText(/Kritik Qüsur \(Geri Qaytarılmalı\)/i)).toBeInTheDocument();

    // 3. Request refund
    const refundBtn = screen.getByTestId('request-refund-btn');
    expect(refundBtn).toBeEnabled();
    fireEvent.click(refundBtn);

    expect(screen.getByText(/Geri Qaytarıldı \(Alıcıya 100% Refund\)/i)).toBeInTheDocument();
  });

  it('supports copy and print on certificate tab', () => {
    render(
      <EscrowSimulatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    // Switch to Certificate tab
    const certificateTabBtn = screen.getByRole('button', { name: /Rəqəmsal Zəmanət Sənədi/i });
    fireEvent.click(certificateTabBtn);

    const copyBtn = screen.getByRole('button', { name: /Kopyala/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalled();
  });

  it('supports English and Russian localization', () => {
    const { rerender } = render(
      <EscrowSimulatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="USD"
        lang="en"
        onClose={onCloseMock}
      />
    );

    expect(screen.getByText(/Seller Identity & Digital Escrow Deposit/i)).toBeInTheDocument();
    expect(screen.getByText(/Seller Identity Dossier/i)).toBeInTheDocument();

    rerender(
      <EscrowSimulatorModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="EUR"
        lang="ru"
        onClose={onCloseMock}
      />
    );

    expect(screen.getByText(/Верификация Продавца & Цифровой Эскроу Задатка/i)).toBeInTheDocument();
    expect(screen.getByText(/Досье Продавца & Доверие/i)).toBeInTheDocument();
  });
});
