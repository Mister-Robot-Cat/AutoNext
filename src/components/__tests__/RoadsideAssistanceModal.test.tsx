import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoadsideAssistanceModal } from '../RoadsideAssistanceModal';
import { Vehicle } from '../../types/vehicle';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('RoadsideAssistanceModal', () => {
  const mockVehicle: Vehicle = {
    ...MOCK_VEHICLES[0],
    plateNumber: '90-MJ-318',
  };

  const defaultProps = {
    isOpen: true,
    vehicle: mockVehicle,
    currency: 'AZN' as const,
    lang: 'az' as const,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<RoadsideAssistanceModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with vehicle plate and default request tab', () => {
    render(<RoadsideAssistanceModal {...defaultProps} />);
    expect(screen.getByTestId('roadside-assistance-modal')).toBeInTheDocument();
    expect(screen.getByText(/156 Evakuasiya & Təcili Yol Köməyi/i)).toBeInTheDocument();
    expect(screen.getByTestId('roadside-request-tab')).toBeInTheDocument();
    expect(screen.getByText('90-MJ-318')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<RoadsideAssistanceModal {...defaultProps} />);
    const closeBtn = screen.getByTestId('roadside-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches between tabs properly', () => {
    render(<RoadsideAssistanceModal {...defaultProps} />);

    // Switch to Tracking tab
    const trackingTab = screen.getByTestId('tab-tracking-btn');
    fireEvent.click(trackingTab);
    expect(screen.getByTestId('roadside-tracking-tab')).toBeInTheDocument();

    // Switch to Tariffs tab
    const tariffsTab = screen.getByTestId('tab-tariffs-btn');
    fireEvent.click(tariffsTab);
    expect(screen.getByTestId('roadside-tariffs-tab')).toBeInTheDocument();

    // Switch to Voucher tab
    const voucherTab = screen.getByTestId('tab-voucher-btn');
    fireEvent.click(voucherTab);
    expect(screen.getByTestId('roadside-voucher-tab')).toBeInTheDocument();

    // Switch back to Request tab
    const requestTab = screen.getByTestId('tab-request-btn');
    fireEvent.click(requestTab);
    expect(screen.getByTestId('roadside-request-tab')).toBeInTheDocument();
  });

  it('allows selecting different services and updates selection', () => {
    render(<RoadsideAssistanceModal {...defaultProps} />);

    const batteryCard = screen.getByTestId('service-card-battery_jumpstart');
    fireEvent.click(batteryCard);
    expect(batteryCard).toHaveClass('bg-amber-500/10');

    const mudCard = screen.getByTestId('service-card-snow_mud_extraction');
    fireEvent.click(mudCard);
    expect(mudCard).toHaveClass('bg-amber-500/10');
  });

  it('allows changing district and location details', () => {
    render(<RoadsideAssistanceModal {...defaultProps} />);

    const districtSelect = screen.getByTestId('district-select');
    fireEvent.change(districtSelect, { target: { value: 'loc_khazar' } });
    expect(districtSelect).toHaveValue('loc_khazar');

    const locationInput = screen.getByTestId('location-details-input');
    fireEvent.change(locationInput, { target: { value: 'Mərdəkan dendroparkı yaxınlığı' } });
    expect(locationInput).toHaveValue('Mərdəkan dendroparkı yaxınlığı');
  });

  it('allows toggling night surge surcharge', () => {
    render(<RoadsideAssistanceModal {...defaultProps} />);

    const nightToggle = screen.getByTestId('night-surge-toggle');
    const initialState = (nightToggle as HTMLInputElement).checked;

    fireEvent.click(nightToggle);
    expect((nightToggle as HTMLInputElement).checked).toBe(!initialState);
  });

  it('places an assistance order and switches to tracking tab with success banner', () => {
    render(<RoadsideAssistanceModal {...defaultProps} />);

    const orderBtn = screen.getByTestId('submit-assistance-order-btn');
    fireEvent.click(orderBtn);

    // Should switch to tracking tab
    expect(screen.getByTestId('roadside-tracking-tab')).toBeInTheDocument();
    expect(screen.getByTestId('order-success-banner')).toBeInTheDocument();
  });

  it('allows advancing simulation and cancelling order in tracking tab', () => {
    render(<RoadsideAssistanceModal {...defaultProps} />);

    // Switch to tracking tab
    fireEvent.click(screen.getByTestId('tab-tracking-btn'));

    const advanceBtn = screen.getByTestId('advance-simulation-btn');
    fireEvent.click(advanceBtn);
    expect(advanceBtn).toBeInTheDocument();

    const cancelBtn = screen.getByTestId('cancel-order-btn');
    fireEvent.click(cancelBtn);
    expect(screen.getByText('Ləğv Edildi')).toBeInTheDocument();
  });

  it('allows copying voucher on voucher tab', () => {
    render(<RoadsideAssistanceModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-voucher-btn'));
    const copyBtn = screen.getByTestId('copy-voucher-btn');
    fireEvent.click(copyBtn);
    expect(screen.getByTestId('copy-voucher-btn')).toBeInTheDocument();
  });
});
