import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DriverLicenseModal } from '../DriverLicenseModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('DriverLicenseModal component', () => {
  it('renders category & trailer towing (B vs BE) audit tab and detects BE requirement on heavy caravan preset', () => {
    render(
      <DriverLicenseModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
        lang="az"
      />
    );

    expect(screen.getByTestId('driver-license-modal')).toBeInTheDocument();
    expect(screen.getByTestId('required-category-badge')).toHaveTextContent('B');

    // Select 1,600 kg Caravan Trailer preset -> should require BE
    fireEvent.click(screen.getByTestId('trailer-preset-1600'));
    expect(screen.getByTestId('required-category-badge')).toHaveTextContent('BE');
    expect(screen.getByTestId('audit-fine-amount')).toHaveTextContent('200 ₼');

    // Toggle BE category on driver's license -> should become compliant
    fireEvent.click(screen.getByTestId('toggle-driver-cat-BE'));
    expect(screen.getByTestId('audit-fine-amount')).toHaveTextContent('0 AZN');
  });

  it('calculates state duties in ASAN & BDYP fees tab and switches service types', () => {
    render(
      <DriverLicenseModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-license-fees'));
    expect(screen.getByTestId('total-license-fee')).toHaveTextContent('34 ₼'); // 30 AZN card + 4 AZN ASAN fee

    // Switch to First-Time License Issuance (20 exam + 30 card + 40 medical + 4 ASAN = 94 AZN)
    fireEvent.click(screen.getByTestId('service-type-first_time_issuance'));
    expect(screen.getByTestId('total-license-fee')).toHaveTextContent('94 ₼');
  });

  it('simulates 10-question BDYP theoretical exam and verifies 9/10 pass threshold', () => {
    render(
      <DriverLicenseModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-license-exam'));
    expect(screen.getByTestId('exam-correct-count')).toHaveTextContent('0 / 10');

    // Click auto-fill all correct answers demo button
    fireEvent.click(screen.getByTestId('exam-autofill-correct-btn'));
    expect(screen.getByTestId('exam-correct-count')).toHaveTextContent('10 / 10');
    expect(screen.getByTestId('exam-status-label')).toHaveTextContent('İmtahan Uğurla Keçildi');
  });

  it('filters BDYP MERO & ASAN centers and generates electronic license extract', () => {
    render(
      <DriverLicenseModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-license-centers'));
    fireEvent.click(screen.getByTestId('filter-center-city-Gəncə'));
    expect(screen.getByTestId('license-center-card-center-ganja-mero')).toBeInTheDocument();

    // Open E-Extract tab and update holder name
    fireEvent.click(screen.getByTestId('tab-license-extract'));
    const nameInput = screen.getByTestId('extract-fullname-input');
    fireEvent.change(nameInput, { target: { value: 'QULİYEV ORXAN NİZAMİ OĞLU' } });
    fireEvent.click(screen.getByTestId('refresh-extract-btn'));

    expect(screen.getByTestId('extract-holder-name')).toHaveTextContent(
      'QULİYEV ORXAN NİZAMİ OĞLU'
    );
  });
});
