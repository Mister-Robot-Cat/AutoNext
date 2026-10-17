import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmissionsComplianceModal } from '../EmissionsComplianceModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('EmissionsComplianceModal component', () => {
  const sampleVehicle = MOCK_VEHICLES[0];

  it('does not render when isOpen is false', () => {
    render(
      <EmissionsComplianceModal
        isOpen={false}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByTestId('emissions-compliance-modal')).toBeNull();
  });

  it('renders Tab 1 (Gas Analyzer & Təmiz Hava Stand) and updates fine verdict when preset scenario is clicked', () => {
    render(
      <EmissionsComplianceModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('emissions-compliance-modal')).toBeDefined();
    expect(screen.getByTestId('individual-fine-amount').textContent).toContain('0 ₼');

    // Click cut catalyst preset -> triggers İXM 342.5 50 AZN fine
    fireEvent.click(screen.getByTestId('preset-cut-catalyst-btn'));
    expect(screen.getByTestId('individual-fine-amount').textContent).toContain('50');

    // Click clean OEM preset -> back to 0 AZN fine
    fireEvent.click(screen.getByTestId('preset-clean-oem-btn'));
    expect(screen.getByTestId('individual-fine-amount').textContent).toContain('0 ₼');
  });

  it('switches to Tab 2 (Catalyst, DPF & OBD-II Auditor) and calculates resale penalty & repair cost', () => {
    render(
      <EmissionsComplianceModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-catalyst-dpf'));
    expect(screen.getByTestId('catalyst-integrity-verdict')).toBeDefined();

    // Select removed_bypass catalyst status and P0420 fault code
    fireEvent.click(screen.getByTestId('catalyst-status-removed_bypass'));
    fireEvent.click(screen.getByTestId('obd-code-P0420'));

    expect(screen.getByTestId('resale-penalty-amount').textContent).toContain('-');
    expect(screen.getByTestId('catalyst-repair-cost').textContent).not.toBe('0 ₼');
  });

  it('switches to Tab 3 (CO2 Footprint & Euro-4/5/6 Class Calculator) and updates metrics', () => {
    render(
      <EmissionsComplianceModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-carbon-euro'));
    expect(screen.getByTestId('carbon-footprint-summary')).toBeDefined();

    fireEvent.change(screen.getByTestId('carbon-fuel-type-select'), {
      target: { value: 'electric' },
    });
    expect(screen.getByTestId('co2-grams-per-km').textContent).toBe('0 q/km');
  });

  it('switches to Tab 4 (ETSN & BDYP Accredited Laboratories) and filters by city', () => {
    render(
      <EmissionsComplianceModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-eco-centers'));
    expect(screen.getByTestId('eco-center-card-eco-center-1')).toBeDefined();

    fireEvent.click(screen.getByTestId('filter-eco-city-Gəncə'));
    expect(screen.getByTestId('eco-center-card-eco-center-6')).toBeDefined();
    expect(screen.queryByTestId('eco-center-card-eco-center-1')).toBeNull();
  });

  it('switches to Tab 5 (BDYP-EKO-2026 Certificate & Unified Registry) and looks up certificate', () => {
    render(
      <EmissionsComplianceModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-eco-certificate'));
    expect(screen.getByTestId('eco-certificate-number').textContent).toMatch(
      /^BDYP-EKO-2026-\d{5}$/
    );

    const searchInput = screen.getByTestId('eco-registry-search-input');
    fireEvent.change(searchInput, { target: { value: '99-XX-777' } });
    fireEvent.click(screen.getByTestId('eco-registry-search-btn'));

    expect(screen.getByTestId('eco-registry-search-result').textContent).toContain(
      'BDYP-EKO-2026-84920'
    );
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <EmissionsComplianceModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={onCloseMock}
      />
    );

    fireEvent.click(screen.getByTestId('close-emissions-modal-btn'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
