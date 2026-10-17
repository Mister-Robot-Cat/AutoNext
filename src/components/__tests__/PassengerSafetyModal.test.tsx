import '@testing-library/jest-dom/vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PassengerSafetyModal } from '../PassengerSafetyModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle = {
  id: 'v-100',
  make: 'Toyota',
  model: 'Land Cruiser 250',
  year: 2025,
  vin: 'JTMAB3FV80D110482',
  fuelType: 'hybrid',
  bodyType: 'suv',
} as unknown as Vehicle;

describe('PassengerSafetyModal Component', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(
      <PassengerSafetyModal isOpen={false} onClose={vi.fn()} currency="AZN" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders Tab 1 (Emergency Safety Kit Auditor) by default and triggers 50 AZN fine when aerosol spray is selected', () => {
    render(
      <PassengerSafetyModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
        currency="AZN"
      />
    );

    expect(screen.getByTestId('passenger-safety-modal')).toBeInTheDocument();
    expect(screen.getByTestId('kit-fine-amount')).toHaveTextContent('0 ₼');

    // Select non-compliant 400ml aerosol spray
    fireEvent.click(screen.getByTestId('extinguisher-AEROSOL_SPRAY_400ML'));
    expect(screen.getByTestId('kit-fine-amount')).toHaveTextContent('50 ₼');
  });

  it('switches to Tab 2 (Child Restraint System & Passenger Auditor) and detects front seat <12 yr violation and airbag hazard', () => {
    render(
      <PassengerSafetyModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByTestId('tab-child-crs'));

    // Initially compliant in rear ISOFIX seat with CRS
    expect(screen.getByTestId('child-fine-total')).toHaveTextContent('0 ₼');

    // Move child to front passenger seat and uncheck CRS
    fireEvent.click(screen.getByTestId('seat-pos-front'));
    fireEvent.click(screen.getByTestId('toggle-has-crs'));

    expect(screen.getByTestId('child-fine-total')).toHaveTextContent('60 ₼');
    expect(screen.getByTestId('child-penalty-points')).toHaveTextContent('3 Cərimə Balı');

    // Enable rear-facing seat while front airbag is active -> critical hazard banner
    fireEvent.click(screen.getByTestId('toggle-rear-facing'));
    expect(screen.getByTestId('airbag-hazard-banner')).toBeInTheDocument();
  });

  it('switches to Tab 3 (Cargo Overhang, Towing & FHN Supply Centers) and updates bundle cost', () => {
    render(
      <PassengerSafetyModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByTestId('tab-cargo-centers'));

    // Default bundle: OP-2 (28) + First Aid (22) + Triangle (15) = 65 AZN
    expect(screen.getByTestId('bundle-total-cost')).toHaveTextContent('65 ₼');

    // Add ISOFIX child seat (240 AZN)
    fireEvent.click(screen.getByTestId('bundle-isofix-checkbox'));
    expect(screen.getByTestId('bundle-total-cost')).toHaveTextContent('305 ₼');

    // Switch to Zabrat center
    fireEvent.click(screen.getByTestId('safety-center-center-baku-zabrat'));
    // Zabrat: OP-2 (26) + First Aid (20) + Triangle (14) + ISOFIX (215) = 275 AZN
    expect(screen.getByTestId('bundle-total-cost')).toHaveTextContent('275 ₼');
  });

  it('switches to Tab 4 (Official BDYP-TEH Certificate), generates a custom certificate, and searches registry', () => {
    render(
      <PassengerSafetyModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={mockVehicle}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByTestId('tab-safety-certificate'));

    fireEvent.change(screen.getByTestId('cert-plate-input'), {
      target: { value: '10-AA-777' },
    });
    fireEvent.change(screen.getByTestId('cert-vin-input'), {
      target: { value: 'JT111111111199887' },
    });
    fireEvent.click(screen.getByTestId('generate-safety-cert-btn'));

    expect(screen.getByTestId('active-cert-number')).toHaveTextContent('BDYP-TEH-2026-99887');

    // Search registry for pre-verified BYD certificate
    fireEvent.change(screen.getByTestId('registry-search-input'), {
      target: { value: '77-EV-090' },
    });
    fireEvent.click(screen.getByTestId('registry-search-btn'));

    expect(screen.getByTestId('registry-search-result')).toHaveTextContent('BDYP-TEH-2026-88319');
  });
});
