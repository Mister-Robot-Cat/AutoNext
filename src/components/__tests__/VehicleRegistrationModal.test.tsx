import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VehicleRegistrationModal } from '../VehicleRegistrationModal';
import { Vehicle } from '../../types/vehicle';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

const mockVehicle: Vehicle = {
  ...MOCK_VEHICLES[0],
  vin: 'JTMAB3FV9ND123456',
  engineVolumeLiters: 2.5,
  fuelType: 'petrol',
};

describe('VehicleRegistrationModal', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <VehicleRegistrationModal
        isOpen={false}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );
    expect(screen.queryByTestId('vehicle-registration-modal')).toBeNull();
  });

  it('renders modal header and default calculator tab when open', () => {
    render(
      <VehicleRegistrationModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    expect(screen.getByTestId('vehicle-registration-modal')).toBeInTheDocument();
    expect(screen.getByText(/BDYP Qeydiyyat & Texpasport/i)).toBeInTheDocument();
    expect(screen.getByText(/JTMAB3FV9ND123456/i)).toBeInTheDocument();
    expect(screen.getByTestId('tab-calculator-content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <VehicleRegistrationModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    fireEvent.click(screen.getByTestId('close-registration-modal-btn'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches between tabs cleanly', () => {
    render(
      <VehicleRegistrationModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    // Switch to Plate Tab
    fireEvent.click(screen.getByTestId('tab-plate'));
    expect(screen.getByTestId('tab-plate-content')).toBeInTheDocument();

    // Switch to Checklist Tab
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByTestId('tab-checklist-content')).toBeInTheDocument();

    // Switch to Booking Tab
    fireEvent.click(screen.getByTestId('tab-booking'));
    expect(screen.getByTestId('tab-booking-content')).toBeInTheDocument();

    // Switch back to Calculator Tab
    fireEvent.click(screen.getByTestId('tab-calculator'));
    expect(screen.getByTestId('tab-calculator-content')).toBeInTheDocument();
  });

  it('updates duties when changing plate options and urgent switch in calculator tab', () => {
    render(
      <VehicleRegistrationModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    // Default option is new_standard (35 AZN plate + 30 texpasport + 35 engine + 10 check + 11 notary + 2 bank = 123 AZN)
    expect(screen.getByText(/123 AZN/i)).toBeInTheDocument();

    // Select "keep_current" option
    const keepCurrentRadio = screen.getByLabelText(/Mövcud nömrəni saxlamaq/i);
    fireEvent.click(keepCurrentRadio);

    // Total should decrease by 35 AZN (123 - 35 = 88 AZN)
    expect(screen.getByText(/88 AZN/i)).toBeInTheDocument();

    // Toggle urgent processing (+20 AZN)
    const urgentToggleBtn = screen.getByText(/ASAN Təcili Rəsmiləşdirmə/i).closest('div')?.parentElement?.querySelector('button');
    if (urgentToggleBtn) {
      fireEvent.click(urgentToggleBtn);
      // Total should be 88 + 20 = 108 AZN
      expect(screen.getByText(/108 AZN/i)).toBeInTheDocument();
    }
  });

  it('customizes license plate and classifies tiers in plate tab', () => {
    render(
      <VehicleRegistrationModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    fireEvent.click(screen.getByTestId('tab-plate'));

    const lettersInput = screen.getByTestId('plate-letters-input');
    const numbersInput = screen.getByTestId('plate-numbers-input');

    // Change to mirror numbers "010"
    fireEvent.change(numbersInput, { target: { value: '010' } });
    expect(screen.getByText(/Güzgülü Nömrə/i)).toBeInTheDocument();
    expect(screen.getByText(/\+500 AZN/i)).toBeInTheDocument();

    // Click a preset button
    const presetBtn = screen.getByRole('button', { name: /77-XX-777/i });
    fireEvent.click(presetBtn);

    expect(screen.getByText(/Elit Qoşa Hərf & Qızıl Seriya/i)).toBeInTheDocument();
    expect(screen.getByText(/\+5000 AZN/i)).toBeInTheDocument();
  });

  it('toggles document checklist items and tracks progress in checklist tab', () => {
    render(
      <VehicleRegistrationModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    fireEvent.click(screen.getByTestId('tab-checklist'));

    // Initially 4/6 items checked = 67%
    expect(screen.getByText(/4 \/ 6/i)).toBeInTheDocument();

    // Check the remaining items
    const tallyItem = screen.getByText(/BDYP Texniki Müayinə və Qaz-Analiz Aktı/i);
    fireEvent.click(tallyItem);

    const receiptItem = screen.getByText(/Dövlət Rüsumunun Ödəniş Qəbzi/i);
    fireEvent.click(receiptItem);

    // Now all 6/6 items checked = 100%
    expect(screen.getByText(/6 \/ 6/i)).toBeInTheDocument();
    expect(screen.getByText(/Bütün zəruri sənədlər hazırdır!/i)).toBeInTheDocument();
  });

  it('submits booking form and generates confirmation voucher', () => {
    render(
      <VehicleRegistrationModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onCloseMock}
      />
    );

    fireEvent.click(screen.getByTestId('tab-booking'));

    const buyerNameInput = screen.getByTestId('buyer-name-input');
    fireEvent.change(buyerNameInput, { target: { value: 'Murad Həsənov' } });

    const buyerFinInput = screen.getByTestId('buyer-fin-input');
    fireEvent.change(buyerFinInput, { target: { value: '5ABC123' } });

    fireEvent.submit(screen.getByTestId('booking-form'));

    // Should display confirmed voucher
    expect(screen.getByText(/Elektron Növbə Talonu/i)).toBeInTheDocument();
    expect(screen.getByText(/Murad Həsənov/i)).toBeInTheDocument();
    expect(screen.getByText(/5ABC123/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Talonu Çap Et/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Məlumatı Kopyala/i })).toBeInTheDocument();

    // Test print
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    fireEvent.click(screen.getByRole('button', { name: /Talonu Çap Et/i }));
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();

    // Reset to booking form
    fireEvent.click(screen.getByRole('button', { name: /Yeni Növbə Götür/i }));
    expect(screen.getByTestId('booking-form')).toBeInTheDocument();
  });
});
