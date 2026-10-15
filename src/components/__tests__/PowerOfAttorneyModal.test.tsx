import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PowerOfAttorneyModal } from '../PowerOfAttorneyModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('PowerOfAttorneyModal Component', () => {
  const mockVehicle = MOCK_VEHICLES[0];
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <PowerOfAttorneyModal
        isOpen={false}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default tab (calculator) when open', () => {
    render(
      <PowerOfAttorneyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    expect(screen.getByTestId('poa-modal')).toBeInTheDocument();
    expect(screen.getByText('Elektron Notariat & Etibarnamə Sistemi')).toBeInTheDocument();
    expect(screen.getByTestId('tab-calculator')).toBeInTheDocument();
    expect(screen.getByTestId('tab-parties')).toBeInTheDocument();
    expect(screen.getByTestId('tab-telemetry')).toBeInTheDocument();
    expect(screen.getByTestId('tab-document')).toBeInTheDocument();
    expect(screen.getByTestId('tab-active-registry')).toBeInTheDocument();

    // Verify initial fee card
    expect(screen.getByTestId('poa-fee-card')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <PowerOfAttorneyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('poa-modal-close-btn'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches between tabs cleanly', () => {
    render(
      <PowerOfAttorneyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    // Switch to parties tab
    fireEvent.click(screen.getByTestId('tab-parties'));
    expect(screen.getByText('Nümunə Persona ilə Tez Doldurma')).toBeInTheDocument();

    // Switch to telemetry tab
    fireEvent.click(screen.getByTestId('tab-telemetry'));
    expect(screen.getByText('DİN BDYP Mərkəzi Serveri ilə Canlı İnteqrasiya')).toBeInTheDocument();

    // Switch to document tab
    fireEvent.click(screen.getByTestId('tab-document'));
    expect(screen.getByTestId('official-poa-document')).toBeInTheDocument();

    // Switch to active registry tab
    fireEvent.click(screen.getByTestId('tab-active-registry'));
    expect(screen.getByTestId('registry-search-input')).toBeInTheDocument();
  });

  it('updates statutory fee calculation when scope and relationship are changed', () => {
    render(
      <PowerOfAttorneyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    // Initial: DRIVING_ONLY (5 duty) + CLOSE_RELATIVE (10 service + 3 asan) = 18 AZN
    expect(screen.getByTestId('poa-total-fee')).toHaveTextContent('18');

    // Switch to Third Party: DRIVING_ONLY (20 duty) + 10 + 3 = 33 AZN
    fireEvent.click(screen.getByTestId('rel-third-party'));
    expect(screen.getByTestId('poa-total-fee')).toHaveTextContent('33');

    // Switch to Full Disposal: FULL_DISPOSAL (40 duty) + 20 + 3 = 63 AZN
    fireEvent.click(screen.getByTestId('scope-full-disposal'));
    expect(screen.getByTestId('poa-total-fee')).toHaveTextContent('63');

    // Switch to Close Relative: FULL_DISPOSAL (15 duty) + 20 + 3 = 38 AZN
    fireEvent.click(screen.getByTestId('rel-close-relative'));
    expect(screen.getByTestId('poa-total-fee')).toHaveTextContent('38');
  });

  it('changes duration and toggles sub-delegation and cross-border options', () => {
    render(
      <PowerOfAttorneyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    // Select 36 months
    fireEvent.click(screen.getByTestId('duration-36m'));

    // Toggle sub-delegation
    const subDelCheckbox = screen.getByTestId('subdelegation-toggle') as HTMLInputElement;
    expect(subDelCheckbox.checked).toBe(false);
    fireEvent.click(subDelCheckbox);
    expect(subDelCheckbox.checked).toBe(true);

    // Toggle cross-border
    const crossBorderCheckbox = screen.getByTestId('crossborder-toggle') as HTMLInputElement;
    expect(crossBorderCheckbox.checked).toBe(false);
    fireEvent.click(crossBorderCheckbox);
    expect(crossBorderCheckbox.checked).toBe(true);
  });

  it('allows selecting different notary offices', () => {
    render(
      <PowerOfAttorneyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    const select = screen.getByTestId('notary-office-select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'notary-baku-1' } });
    expect(select.value).toBe('notary-baku-1');
  });

  it('applies persona presets in parties tab', () => {
    render(
      <PowerOfAttorneyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-parties'));

    // Apply General Power preset
    fireEvent.click(screen.getByTestId('preset-btn-general-power-sale'));

    const grantorFin = screen.getByTestId('grantor-fin-input') as HTMLInputElement;
    expect(grantorFin.value).toBe('1A9F43D');

    const granteeFin = screen.getByTestId('grantee-fin-input') as HTMLInputElement;
    expect(granteeFin.value).toBe('9K5Y28E');
  });

  it('validates FIN code inputs in parties tab', () => {
    render(
      <PowerOfAttorneyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-parties'));

    const finInput = screen.getByTestId('grantor-fin-input');
    fireEvent.change(finInput, { target: { value: '123' } });

    expect(screen.getByText('FİN kod tam 7 simvoldan ibarət olmalıdır')).toBeInTheDocument();
  });

  it('copies document and handles print in document tab', () => {
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(
      <PowerOfAttorneyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-document'));

    const copyBtn = screen.getByTestId('copy-document-btn');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    // Test print button
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const printBtn = screen.getByTestId('print-document-btn');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('filters active records and executes revocation', () => {
    render(
      <PowerOfAttorneyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-active-registry'));

    // Search for 10-AA-100
    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: '10-AA-100' } });

    expect(screen.getByTestId('poa-record-item-poa-rec-001')).toBeInTheDocument();

    // Revoke poa-rec-001
    const openRevokeBtn = screen.getByTestId('open-revoke-btn-poa-rec-001');
    fireEvent.click(openRevokeBtn);

    const reasonInput = screen.getByTestId('revocation-reason-input');
    fireEvent.change(reasonInput, { target: { value: 'Mülkiyyətçi avtomobili satdı' } });

    const confirmRevokeBtn = screen.getByTestId('confirm-revoke-btn-poa-rec-001');
    fireEvent.click(confirmRevokeBtn);

    // Verify revoked status displayed
    expect(screen.getByText(/Mülkiyyətçi avtomobili satdı/)).toBeInTheDocument();
    expect(screen.getByText('BDYP Qara Siyahı İnteqrasiyası: AKTİV')).toBeInTheDocument();
  });
});
