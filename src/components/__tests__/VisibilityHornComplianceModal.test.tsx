import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VisibilityHornComplianceModal } from '../VisibilityHornComplianceModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('VisibilityHornComplianceModal Component', () => {
  const mockVehicle = MOCK_VEHICLES[0];
  const mockOnClose = vi.fn();

  it('does not render when isOpen is false', () => {
    render(
      <VisibilityHornComplianceModal
        isOpen={false}
        vehicle={mockVehicle}
        currency="AZN"
        onClose={mockOnClose}
      />
    );
    expect(screen.queryByTestId('visibility-horn-modal')).not.toBeInTheDocument();
  });

  it('renders Tab 1 (Windshield, Wipers & Visibility) and detects Zone-A crack & IXM 96.1.4 wiper failure', () => {
    render(
      <VisibilityHornComplianceModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('visibility-horn-modal')).toBeInTheDocument();
    expect(screen.getByTestId('windshield-fine-amount')).toHaveTextContent('0 AZN');

    // Select Driver Sweep Zone A
    fireEvent.click(screen.getByTestId('zone-btn-driver_sweep_a'));
    expect(screen.getByTestId('windshield-fine-amount')).toHaveTextContent('50 AZN');

    // Toggle driver wiper off during precipitation -> IXM 96.1.4 prohibition
    fireEvent.click(screen.getByTestId('toggle-driver-wiper'));
    expect(screen.getByTestId('windshield-verdict-card')).toHaveTextContent(
      'İSTİSMAR QADAĞANDIR (İXM Maddə 96.1.4)'
    );
  });

  it('switches to Tab 2 (Acoustic Horn & Tachograph) and calculates FIFA polyphonic & SGU siren fines', () => {
    render(
      <VisibilityHornComplianceModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('tab-horn'));
    expect(screen.getByTestId('horn-total-fine')).toHaveTextContent('0 AZN');

    // Select FIFA polyphonic horn -> 150 AZN (IXM 342.2-1)
    fireEvent.click(screen.getByTestId('horn-type-fifa_polyphonic'));
    expect(screen.getByTestId('horn-total-fine')).toHaveTextContent('150 AZN');

    // Select SGU police siren -> 800 AZN + Confiscation (IXM 342.9)
    fireEvent.click(screen.getByTestId('horn-type-sgu_police_siren'));
    expect(screen.getByTestId('horn-total-fine')).toHaveTextContent('800 AZN');
    expect(screen.getByTestId('horn-verdict-card')).toHaveTextContent('Müsadirə');

    // Toggle unnecessary residential honking (+30 AZN -> 830 AZN)
    fireEvent.click(screen.getByTestId('toggle-unnecessary-honking'));
    expect(screen.getByTestId('horn-total-fine')).toHaveTextContent('830 AZN');
  });

  it('switches to Tab 3 (Repair Packages), Tab 4 (Accredited Centers), and Tab 5 (BDYP-GOR-2026 Certificate)', () => {
    render(
      <VisibilityHornComplianceModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        onClose={mockOnClose}
      />
    );

    // Tab 3: Packages
    fireEvent.click(screen.getByTestId('tab-packages'));
    expect(screen.getByTestId('packages-total-cost')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('repair-pkg-pkg-oem-windshield'));

    // Tab 4: Accredited Centers
    fireEvent.click(screen.getByTestId('tab-centers'));
    fireEvent.click(screen.getByTestId('center-city-Sumqayıt'));
    fireEvent.click(screen.getByTestId('book-center-vis-sumgayit'));
    expect(screen.getByTestId('visibility-booking-confirmation')).toHaveTextContent(
      'GOR-QEYD-2026-'
    );

    // Tab 5: Certificate & Registry Lookup
    fireEvent.click(screen.getByTestId('tab-certificate'));
    fireEvent.change(screen.getByTestId('cert-plate-input'), {
      target: { value: '10-AA-700' },
    });
    fireEvent.click(screen.getByTestId('generate-visibility-cert-btn'));
    expect(screen.getByTestId('visibility-certificate-card')).toHaveTextContent(
      '10-AA-700'
    );

    fireEvent.change(screen.getByTestId('visibility-registry-search'), {
      target: { value: 'BDYP-GOR-2026-84920' },
    });
    expect(screen.getByTestId('registry-search-result')).toHaveTextContent(
      '99-XX-777'
    );
  });
});
