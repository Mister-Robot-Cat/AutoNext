import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ForensicPlateComplianceModal } from '../ForensicPlateComplianceModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('ForensicPlateComplianceModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <ForensicPlateComplianceModal
        isOpen={false}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
      />
    );
    expect(screen.queryByTestId('forensic-plate-modal')).not.toBeInTheDocument();
  });

  it('renders Tab 1 (Engine & VIN Forensics) and detects undeclared engine swap (IXM 342.2-1 150 AZN) and tampered VIN (CM 320)', () => {
    render(
      <ForensicPlateComplianceModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
      />
    );

    expect(screen.getByTestId('forensic-plate-modal')).toBeInTheDocument();
    expect(screen.getByTestId('engine-vin-verdict-card')).toHaveTextContent(
      'MERO Qeydiyyatına Tam Uyğundur'
    );

    // Click undeclared swapped engine preset
    fireEvent.click(screen.getByTestId('preset-undeclared-swap'));
    expect(screen.getByTestId('engine-fine-amount')).toHaveTextContent('150 ₼');
    expect(screen.getByTestId('engine-duty-amount')).toHaveTextContent('50 ₼');

    // Toggle DGK customs declaration checkbox to clear the 150 AZN fine
    fireEvent.click(screen.getByTestId('checkbox-dgk-declaration'));
    expect(screen.getByTestId('engine-fine-amount')).toHaveTextContent('0 ₼');

    // Click tampered / welded VIN preset
    fireEvent.click(screen.getByTestId('preset-tampered-vin'));
    expect(screen.getByTestId('engine-vin-verdict-card')).toHaveTextContent(
      'Kriminal Bloklama (CM 320)'
    );
  });

  it('switches to Tab 2 (DQN Readability & IXM 342.7) and compares 40 AZN dirty plate vs 500-800 AZN anti-radar/curtain frame', () => {
    render(
      <ForensicPlateComplianceModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByTestId('tab-plate-rfid'));

    // Click dirty/faded 40 AZN preset
    fireEvent.click(screen.getByTestId('preset-plate-dirty'));
    expect(screen.getByTestId('plate-fine-range')).toHaveTextContent('40 ₼');

    // Click anti-radar / magnetic curtain 500-800 AZN preset
    fireEvent.click(screen.getByTestId('preset-plate-antiradar'));
    expect(screen.getByTestId('plate-fine-range')).toHaveTextContent('500–800 ₼');
    expect(screen.getByTestId('plate-audit-verdict-card')).toHaveTextContent('4 Cərimə Balı');
  });

  it('switches to Tab 3 (SRS Obmanka & Fluid Stand), Tab 4 (MERO Centers), and Tab 5 (BDYP-EKS-2026 Certificate)', () => {
    render(
      <ForensicPlateComplianceModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
      />
    );

    // Tab 3: SRS & Fluid
    fireEvent.click(screen.getByTestId('tab-srs-fluid'));
    fireEvent.click(screen.getByTestId('preset-srs-obmanka'));
    expect(screen.getByTestId('srs-fluid-verdict-card')).toHaveTextContent(
      'SAXTA AIRBAG ("Obmanka" 2.2 Ω Rezistor) Aşkarlandı!'
    );
    expect(screen.getByTestId('forensic-service-total')).toHaveTextContent('72 ₼');

    // Tab 4: Accredited Centers
    fireEvent.click(screen.getByTestId('tab-forensic-centers'));
    fireEvent.click(screen.getByTestId('filter-city-Sumqayıt'));
    expect(
      screen.getByText(/Sumqayıt Regional Qeydiyyat-İmtahan/i)
    ).toBeInTheDocument();

    // Tab 5: Certificate Generation & Lookup
    fireEvent.click(screen.getByTestId('tab-forensic-certificate'));
    fireEvent.change(screen.getByTestId('cert-plate-input'), {
      target: { value: '10-OO-100' },
    });
    fireEvent.click(screen.getByTestId('generate-forensic-cert-btn'));
    expect(screen.getByTestId('forensic-certificate-card')).toHaveTextContent('10-OO-100');

    // Lookup existing sample certificate
    fireEvent.change(screen.getByTestId('forensic-lookup-input'), {
      target: { value: '77-EK-505' },
    });
    fireEvent.click(screen.getByTestId('forensic-lookup-btn'));
    expect(screen.getByTestId('forensic-certificate-card')).toHaveTextContent(
      'BDYP-EKS-2026-51304'
    );
  });
});
