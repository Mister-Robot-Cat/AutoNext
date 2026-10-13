import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TrafficFinesModal } from '../TrafficFinesModal';
import { Vehicle } from '../../types/vehicle';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('TrafficFinesModal', () => {
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
    const { container } = render(<TrafficFinesModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with vehicle plate and default unpaid tab', () => {
    render(<TrafficFinesModal {...defaultProps} />);
    expect(screen.getByTestId('traffic-fines-modal')).toBeInTheDocument();
    expect(screen.getByText(/MMX Radar Cərimələri/i)).toBeInTheDocument();
    expect(screen.getByTestId('fines-plate-search-input')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<TrafficFinesModal {...defaultProps} />);
    const closeBtn = screen.getByTestId('close-fines-modal-btn');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches between tabs properly', () => {
    render(<TrafficFinesModal {...defaultProps} />);

    // Switch to Demerit points tab
    const pointsTab = screen.getByTestId('tab-demerit-points');
    fireEvent.click(pointsTab);
    expect(screen.getByText(/Sürücü Cərimə Balı Şkalası/i)).toBeInTheDocument();

    // Switch to History tab
    const historyTab = screen.getByTestId('tab-fines-history');
    fireEvent.click(historyTab);
    expect(screen.getByText(/Əvvəllər ödənilmiş və bağlanmış/i)).toBeInTheDocument();

    // Switch to Certificate tab
    const certTab = screen.getByTestId('tab-clean-certificate');
    fireEvent.click(certTab);
    expect(screen.getByTestId('tab-clean-certificate')).toBeInTheDocument();

    // Switch back to Unpaid tab
    const unpaidTab = screen.getByTestId('tab-unpaid-fines');
    fireEvent.click(unpaidTab);
    expect(screen.getByTestId('tab-unpaid-fines')).toBeInTheDocument();
  });

  it('allows searching with a different plate number', () => {
    render(<TrafficFinesModal {...defaultProps} />);
    const searchInput = screen.getByTestId('fines-plate-search-input');

    fireEvent.change(searchInput, { target: { value: '99-KB-412' } });
    expect(searchInput).toHaveValue('99-KB-412');
  });

  it('opens and completes the payment simulation for single fine', async () => {
    render(<TrafficFinesModal {...defaultProps} />);

    // Find a pay single fine button
    const paySingleBtn = screen.getAllByRole('button', { name: /AsanPay ilə Ödə/i })[0];
    expect(paySingleBtn).toBeInTheDocument();
    fireEvent.click(paySingleBtn);

    // Verify payment simulator modal opens
    expect(screen.getByTestId('fines-payment-simulator-modal')).toBeInTheDocument();
    expect(screen.getByText(/AsanPay Dövlət Ödəniş Gateway/i)).toBeInTheDocument();

    // Confirm payment
    const confirmBtn = screen.getByTestId('confirm-fines-payment-btn');
    fireEvent.click(confirmBtn);

    // Wait for the timeout inside handleConfirmPayment
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 700));
    });

    expect(screen.queryByTestId('fines-payment-simulator-modal')).not.toBeInTheDocument();
  });

  it('opens payment simulation for pay all button', () => {
    render(<TrafficFinesModal {...defaultProps} />);
    const payAllBtn = screen.getByTestId('pay-all-fines-btn');
    fireEvent.click(payAllBtn);

    expect(screen.getByTestId('fines-payment-simulator-modal')).toBeInTheDocument();
  });
});
