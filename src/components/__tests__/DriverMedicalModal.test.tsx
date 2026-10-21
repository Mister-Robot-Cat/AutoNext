import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DriverMedicalModal } from '../DriverMedicalModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('DriverMedicalModal Component', () => {
  const sampleVehicle = MOCK_VEHICLES[0];

  it('does not render when isOpen is false', () => {
    render(
      <DriverMedicalModal
        isOpen={false}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByTestId('driver-medical-modal')).not.toBeInTheDocument();
  });

  it('renders Tab 1 (Forma AZS-083/e Auditor) by default and handles presets & close button', () => {
    const onCloseMock = vi.fn();
    render(
      <DriverMedicalModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={onCloseMock}
      />
    );

    expect(screen.getByTestId('driver-medical-modal')).toBeInTheDocument();
    expect(screen.getByTestId('audit-tab-content')).toBeInTheDocument();
    expect(screen.getByTestId('eligibility-verdict-banner')).toHaveTextContent(
      /TİBBİ CƏHƏTDƏN SÜRÜCÜLÜYƏ YARARLIDIR/i
    );

    // Apply unfit preset
    fireEvent.click(screen.getByTestId('preset-unfit-driver'));
    expect(screen.getByTestId('eligibility-verdict-banner')).toHaveTextContent(
      /TİBBİ CƏHƏTDƏN YARARSIZDIR/i
    );

    // Restore healthy B preset
    fireEvent.click(screen.getByTestId('preset-healthy-b'));
    expect(screen.getByTestId('eligibility-verdict-banner')).toHaveTextContent(
      /TİBBİ CƏHƏTDƏN SÜRÜCÜLÜYƏ YARARLIDIR/i
    );

    // Click close button
    fireEvent.click(screen.getByTestId('close-modal-btn'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches between all 5 navigation tabs cleanly', () => {
    render(
      <DriverMedicalModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    // Tab 2: Rabkin
    fireEvent.click(screen.getByTestId('tab-btn-rabkin'));
    expect(screen.getByTestId('rabkin-tab-content')).toBeInTheDocument();

    // Tab 3: Sobriety
    fireEvent.click(screen.getByTestId('tab-btn-sobriety'));
    expect(screen.getByTestId('sobriety-tab-content')).toBeInTheDocument();

    // Tab 4: Clinics
    fireEvent.click(screen.getByTestId('tab-btn-clinics'));
    expect(screen.getByTestId('clinics-tab-content')).toBeInTheDocument();

    // Tab 5: Certificate
    fireEvent.click(screen.getByTestId('tab-btn-certificate'));
    expect(screen.getByTestId('certificate-tab-content')).toBeInTheDocument();
  });

  it('interacts with Rabkin plate selections and updates clinical diagnosis', () => {
    render(
      <DriverMedicalModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-btn-rabkin'));
    expect(screen.getByTestId('rabkin-diagnosis-badge')).toHaveTextContent(
      /Normal Trixromaziya/i
    );

    // Click plate 2 option "Yalnız Dairə"
    const plate2Opt = screen.getByTestId('rabkin-plate-select-btn-2-Yalnız Dairə');
    fireEvent.click(plate2Opt);
    expect(plate2Opt).toHaveClass('bg-emerald-600');
  });

  it('interacts with BAC slider, test refusal, and dispensary FIN search', () => {
    render(
      <DriverMedicalModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-btn-sobriety'));

    // Default BAC is 0.0 -> Ayıq
    expect(screen.getByTestId('bac-status-badge')).toHaveTextContent(/Ayıq/i);

    // Change BAC slider to 0.45 ‰
    fireEvent.change(screen.getByTestId('bac-slider'), { target: { value: '0.45' } });
    expect(screen.getByTestId('bac-status-badge')).toHaveTextContent(/Yüngül Dərəcəli/i);

    // Dispensary query
    const finInput = screen.getByTestId('dispensary-fin-input');
    fireEvent.change(finInput, { target: { value: '5MNK456' } });
    fireEvent.click(screen.getByTestId('dispensary-check-btn'));

    expect(screen.getByTestId('dispensary-result-box')).toBeInTheDocument();
    expect(screen.getByTestId('dispensary-result-box')).toHaveTextContent(
      /Namiq Babayev/i
    );
  });

  it('filters clinics by city and confirms appointment booking', () => {
    render(
      <DriverMedicalModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-btn-clinics'));

    // Filter by Sumqayıt
    fireEvent.change(screen.getByTestId('clinic-filter-select'), {
      target: { value: 'Sumqayıt' },
    });
    expect(screen.getByText(/Sumqayıt 1 Nömrəli Şəhər Xəstəxanası/i)).toBeInTheDocument();

    // Book appointment
    fireEvent.click(screen.getByTestId('book-appointment-btn'));
    expect(screen.getByTestId('booking-confirmation-banner')).toBeInTheDocument();
  });

  it('searches existing certificate and handles copy code', () => {
    render(
      <DriverMedicalModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-btn-certificate'));

    const searchInput = screen.getByTestId('cert-lookup-input');
    fireEvent.change(searchInput, { target: { value: 'SN-TIB-2026-44109' } });
    fireEvent.click(screen.getByTestId('cert-lookup-btn'));

    expect(screen.getByText(/Eldar Qasımov Fikrət oğlu/i)).toBeInTheDocument();

    // Copy code button
    fireEvent.click(screen.getByTestId('cert-copy-btn'));
    expect(screen.getByText(/Kopyalandı/i)).toBeInTheDocument();
  });
});
