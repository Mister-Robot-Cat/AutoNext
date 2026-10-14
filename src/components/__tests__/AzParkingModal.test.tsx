import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AzParkingModal } from '../AzParkingModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('AzParkingModal Component', () => {
  const mockOnClose = vi.fn();
  const sampleVehicle = MOCK_VEHICLES[0];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AzParkingModal
        isOpen={false}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders header, title, and default radar tab when open', () => {
    render(
      <AzParkingModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/AYNA AzParking Dövlət Parklanma Radarı/i)).toBeInTheDocument();
    expect(screen.getByTestId('tab-content-radar')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <AzParkingModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const closeBtn = screen.getByTestId('az-parking-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('filters parking lots via search input', () => {
    render(
      <AzParkingModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByTestId('radar-search-input');
    fireEvent.change(searchInput, { target: { value: 'Nizami' } });

    expect(screen.getByText(/Fəvvarələr Meydanı & Nizami/i)).toBeInTheDocument();
  });

  it('switches between tabs cleanly', () => {
    render(
      <AzParkingModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    // Switch to Calculator tab
    const calcTab = screen.getByTestId('tab-calculator');
    fireEvent.click(calcTab);
    expect(screen.getByTestId('tab-content-calculator')).toBeInTheDocument();

    // Switch to Resident tab
    const resTab = screen.getByTestId('tab-resident');
    fireEvent.click(resTab);
    expect(screen.getByTestId('tab-content-resident')).toBeInTheDocument();

    // Switch to Rules tab
    const rulesTab = screen.getByTestId('tab-rules');
    fireEvent.click(rulesTab);
    expect(screen.getByTestId('tab-content-rules')).toBeInTheDocument();
  });

  it('updates duration and calculation when clicking duration presets', () => {
    render(
      <AzParkingModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('tab-calculator'));

    // Click 15 min free preset
    fireEvent.click(screen.getByTestId('duration-btn-15'));
    expect(screen.getAllByText(/0.00 AZN/i)[0]).toBeInTheDocument();

    // Click 120 min preset
    fireEvent.click(screen.getByTestId('duration-btn-120'));
    // In Zone 1 (1.00 AZN/hr), 2 hours = 2.00 AZN
    expect(screen.getByText(/2.00 AZN/i)).toBeInTheDocument();
  });

  it('toggles Sunday exemption and zeroes fee', () => {
    render(
      <AzParkingModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('tab-calculator'));
    fireEvent.click(screen.getByTestId('duration-btn-60'));

    const sundayCheckbox = screen.getByTestId('sunday-checkbox');
    fireEvent.click(sundayCheckbox);

    expect(screen.getAllByText(/0.00 AZN/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Bazar günləri şəhər üzrə dövlət parklanma yerləri tamamilə pulsuzdur/i)).toBeInTheDocument();
  });

  it('starts a live parking session and switches to session tab with active countdown', () => {
    render(
      <AzParkingModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('tab-calculator'));
    const startBtn = screen.getByTestId('start-session-btn');
    fireEvent.click(startBtn);

    expect(screen.getByTestId('tab-content-session')).toBeInTheDocument();
    expect(screen.getByText(/Aktiv Parklanma Seansı/i)).toBeInTheDocument();

    // Extend session
    const extendBtn = screen.getByTestId('extend-15-btn');
    fireEvent.click(extendBtn);

    // Stop session
    const stopBtn = screen.getByTestId('stop-session-btn');
    fireEvent.click(stopBtn);

    // Automatically transitions to receipt tab
    expect(screen.getByTestId('tab-content-receipt')).toBeInTheDocument();
    expect(screen.getByText(/AzParking Dövlət Sistemi/i)).toBeInTheDocument();
  });

  it('checks resident permit eligibility and displays confirmation result', () => {
    render(
      <AzParkingModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('tab-resident'));
    const submitBtn = screen.getByTestId('check-resident-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByTestId('resident-check-result')).toBeInTheDocument();
    expect(screen.getByText(/Təbrik edirik! Sakin Talonu Üçün Hüququnuz Təsdiqləndi/i)).toBeInTheDocument();
  });
});
