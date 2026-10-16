import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VehicleScrappageModal } from '../VehicleScrappageModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('VehicleScrappageModal component', () => {
  const mockVehicle = MOCK_VEHICLES[0];

  it('does not render when isOpen is false', () => {
    render(
      <VehicleScrappageModal
        isOpen={false}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByTestId('vehicle-scrappage-modal')).not.toBeInTheDocument();
  });

  it('renders voucher & local car catalog tab by default and updates category payouts', () => {
    render(
      <VehicleScrappageModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('vehicle-scrappage-modal')).toBeInTheDocument();
    expect(screen.getByTestId('voucher-payout-amount')).toHaveTextContent('1,500 ₼');
    expect(screen.getByTestId('cash-payout-amount')).toHaveTextContent('1,050 ₼');

    // Switch to heavy truck category N2/N3 (3,000 AZN voucher / 2,100 AZN cash)
    fireEvent.click(screen.getByTestId('category-btn-heavy_truck_n2_n3'));
    expect(screen.getByTestId('voucher-payout-amount')).toHaveTextContent('3,000 ₼');
    expect(screen.getByTestId('cash-payout-amount')).toHaveTextContent('2,100 ₼');

    // Select a different local car (Chevrolet Cobalt LTZ)
    fireEvent.click(screen.getByTestId('local-car-card-local-chevrolet-cobalt'));
    expect(screen.getByTestId('factory-bonus-amount')).toHaveTextContent('+800 ₼');
  });

  it('switches to Utilization Fees tab and calculates DYP & DGK fees dynamically', () => {
    render(
      <VehicleScrappageModal
        isOpen={true}
        vehicle={{ ...mockVehicle, year: 2012, engineVolumeLiters: 2.5, fuelType: 'petrol' }}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-scrappage-fees'));
    expect(screen.getByTestId('scrappage-fees-panel')).toBeInTheDocument();

    // 2012 (14 years old) => 20 AZN DYP fee; 2500cc >= 3 yrs => 1,200 AZN DGK fee
    expect(screen.getByTestId('dyp-inspection-utilization-fee')).toHaveTextContent('20 ₼');
    expect(screen.getByTestId('dgk-customs-utilization-fee')).toHaveTextContent('1,200 ₼');

    // Switch fuel type to Electric (EV) => 0 AZN exempt
    fireEvent.click(screen.getByTestId('fee-fuel-electric'));
    expect(screen.getByTestId('dyp-inspection-utilization-fee')).toHaveTextContent('0 ₼');
    expect(screen.getByTestId('dgk-customs-utilization-fee')).toHaveTextContent('0 ₼');
  });

  it('audits 10-point vehicle completeness and triggers critical ineligibility alert', () => {
    render(
      <VehicleScrappageModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-scrappage-completeness'));
    expect(screen.getByTestId('completeness-score-badge')).toHaveTextContent('100%');

    // Toggle off critical component: engine_block
    fireEvent.click(screen.getByTestId('completeness-item-engine_block'));
    expect(screen.getByTestId('completeness-ineligible-alert')).toBeInTheDocument();
    expect(screen.getByTestId('completeness-score-badge')).toHaveTextContent('82%');
  });

  it('filters Təmiz Şəhər ASC collection centers and confirms queue reservation', () => {
    render(
      <VehicleScrappageModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-scrappage-centers'));
    expect(screen.getByTestId('scrappage-centers-panel')).toBeInTheDocument();

    // Filter by Sumqayıt
    fireEvent.click(screen.getByTestId('filter-center-city-Sumqayıt'));
    expect(screen.getByTestId('collection-center-card-ts-center-sumgayit')).toBeInTheDocument();

    // Book center
    fireEvent.click(screen.getByTestId('book-center-btn-ts-center-sumgayit'));
    expect(screen.getByTestId('center-booking-confirmation')).toBeInTheDocument();
  });

  it('generates official confirmation certificate and verifies sample codes in registry', () => {
    const onClose = vi.fn();
    render(
      <VehicleScrappageModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByTestId('tab-scrappage-certificate'));
    expect(screen.getByTestId('official-scrappage-certificate')).toBeInTheDocument();

    // Click a sample certificate button to verify registry search
    fireEvent.click(screen.getByTestId('sample-cert-btn-TS-UTL-2026-84920'));
    expect(screen.getByTestId('scrappage-registry-search-result')).toHaveTextContent(
      'Reyestrdə Təsdiqləndi'
    );

    // Close modal
    fireEvent.click(screen.getByTestId('close-scrappage-modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
