import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaxiComplianceModal } from '../TaxiComplianceModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('TaxiComplianceModal Component', () => {
  const mockVehicle = MOCK_VEHICLES[0];
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <TaxiComplianceModal
        isOpen={false}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default tab (compliance) when open', () => {
    render(
      <TaxiComplianceModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    expect(screen.getByText('AYNA Taksi Portalı & Buraxılış Vərəqəsi')).toBeInTheDocument();
    expect(screen.getByTestId('tab-compliance-btn')).toBeInTheDocument();
    expect(screen.getByTestId('tab-profit-btn')).toBeInTheDocument();
    expect(screen.getByTestId('tab-pass-btn')).toBeInTheDocument();
    expect(screen.getByTestId('tab-centers-btn')).toBeInTheDocument();
    expect(screen.getByTestId('auto-complete-retrofit-btn')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <TaxiComplianceModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    const closeBtn = screen.getByTestId('taxi-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all navigation tabs', () => {
    render(
      <TaxiComplianceModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    // Switch to Profit tab
    fireEvent.click(screen.getByTestId('tab-profit-btn'));
    expect(screen.getByText('Taksi Aqreqator Şəbəkəsini Seçin')).toBeInTheDocument();
    expect(screen.getByTestId('platform-btn-bolt')).toBeInTheDocument();

    // Switch to Pass tab
    fireEvent.click(screen.getByTestId('tab-pass-btn'));
    expect(screen.getByText('TAKSİ MİNİK AVTOMOBİLİ ÜÇÜN BURAXILIŞ VƏRƏQƏSİ')).toBeInTheDocument();
    expect(screen.getByTestId('submit-pass-btn')).toBeInTheDocument();

    // Switch to Centers tab
    fireEvent.click(screen.getByTestId('tab-centers-btn'));
    expect(screen.getByText('AYNA Təlim və Müayinə Növbəsi Rezervasiyası')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-booking-btn')).toBeInTheDocument();

    // Switch back to Compliance tab
    fireEvent.click(screen.getByTestId('tab-compliance-btn'));
    expect(screen.getByText('Müayinə Edilən Avtomobil')).toBeInTheDocument();
  });

  it('activates all retrofits when clicking auto-complete', () => {
    render(
      <TaxiComplianceModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    const autoBtn = screen.getByTestId('auto-complete-retrofit-btn');
    fireEvent.click(autoBtn);

    // After auto-complete, 0 AZN retrofit cost
    expect(screen.getByText(/0 AZN/)).toBeInTheDocument();
  });

  it('switches ride-hailing platforms and recalculates commissions in profit tab', () => {
    render(
      <TaxiComplianceModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-profit-btn'));

    // Click Yango
    const yangoBtn = screen.getByTestId('platform-btn-yango');
    fireEvent.click(yangoBtn);
    expect(screen.getByText('Yango (Yandex Go)')).toBeInTheDocument();

    // Click Independent
    const indepBtn = screen.getByTestId('platform-btn-independent');
    fireEvent.click(indepBtn);
    expect(screen.getByText('Sərbəst / Fərdi Taksi')).toBeInTheDocument();
  });

  it('submits pass form, creates new pass, and copies code', () => {
    render(
      <TaxiComplianceModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-pass-btn'));

    const submitBtn = screen.getByTestId('submit-pass-btn');
    fireEvent.click(submitBtn);

    const copyBtn = screen.getByTestId('copy-pass-code-btn');
    fireEvent.click(copyBtn);
    expect(copyBtn).toBeInTheDocument();

    const printBtn = screen.getByTestId('print-pass-btn');
    fireEvent.click(printBtn);
    expect(printBtn).toBeInTheDocument();
  });

  it('fills and submits training booking form', () => {
    render(
      <TaxiComplianceModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-centers-btn'));

    const nameInput = screen.getByPlaceholderText('Ad Soyad');
    const finInput = screen.getByPlaceholderText('7ABC89X');
    const phoneInput = screen.getByPlaceholderText('+994 50 123 45 67');

    fireEvent.change(nameInput, { target: { value: 'Kamran Babayev' } });
    fireEvent.change(finInput, { target: { value: '9XYZ123' } });
    fireEvent.change(phoneInput, { target: { value: '+994 55 999 88 77' } });

    const confirmBtn = screen.getByTestId('confirm-booking-btn');
    fireEvent.click(confirmBtn);

    expect(screen.getByText(/Növbə Təsdiqləndi:/)).toBeInTheDocument();
    expect(screen.getByText(/Kamran Babayev/)).toBeInTheDocument();
  });
});
