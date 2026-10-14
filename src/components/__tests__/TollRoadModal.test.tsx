import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TollRoadModal } from '../TollRoadModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('TollRoadModal Component', () => {
  const mockCar = MOCK_VEHICLES[0];
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <TollRoadModal
        isOpen={false}
        vehicle={mockCar}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(
      <TollRoadModal
        isOpen={true}
        vehicle={mockCar}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );

    expect(screen.getByTestId('toll-road-modal')).toBeInTheDocument();
    expect(screen.getByText(/AAYDA M-1 Ödənişli Avtomobil Yolu & E-Toll/i)).toBeInTheDocument();
    expect(screen.getAllByText(/130 km\/s/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('radar-search-input')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <TollRoadModal
        isOpen={true}
        vehicle={mockCar}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );

    const closeBtn = screen.getByTestId('toll-road-close-btn');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('filters toll plazas via search input', () => {
    render(
      <TollRoadModal
        isOpen={true}
        vehicle={mockCar}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );

    const searchInput = screen.getByTestId('radar-search-input');
    fireEvent.change(searchInput, { target: { value: 'Siyəzən' } });

    expect(screen.getByText(/Siyəzən Qovşağı Məntəqəsi/i)).toBeInTheDocument();
    expect(screen.queryByText(/Yaşma Baş Ödəniş Məntəqəsi/i)).not.toBeInTheDocument();
  });

  it('switches to Trip Calculator tab and allows route selection', () => {
    render(
      <TollRoadModal
        isOpen={true}
        vehicle={mockCar}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );

    const calcTab = screen.getByTestId('tab-calculator');
    fireEvent.click(calcTab);

    expect(screen.getByTestId('entry-plaza-select')).toBeInTheDocument();
    expect(screen.getByTestId('exit-plaza-select')).toBeInTheDocument();
    expect(screen.getByText(/Marşrut Hesabatı/i)).toBeInTheDocument();
  });

  it('generates an electronic transit receipt from calculator and switches to voucher tab', () => {
    render(
      <TollRoadModal
        isOpen={true}
        vehicle={mockCar}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );

    // Switch to calculator
    fireEvent.click(screen.getByTestId('tab-calculator'));

    // Click generate receipt
    const genBtn = screen.getByTestId('generate-toll-receipt-btn');
    fireEvent.click(genBtn);

    // Now in voucher tab
    expect(screen.getByText(/M-1 ÖDƏNİŞLİ AVTOMAGİSTRAL TALONU/i)).toBeInTheDocument();
    expect(screen.getByTestId('copy-toll-receipt-btn')).toBeInTheDocument();
  });

  it('switches to Transponder tab, tops up balance, and simulates gate passage', () => {
    render(
      <TollRoadModal
        isOpen={true}
        vehicle={mockCar}
        currency="AZN"
        lang="az"
        onClose={onClose}
      />
    );

    // Switch to transponder tab
    const transponderTab = screen.getByTestId('tab-transponder');
    fireEvent.click(transponderTab);

    expect(screen.getByText(/AAYDA E-TOLL FASTPASS/i)).toBeInTheDocument();

    // Top up balance +20 AZN
    const topUp20 = screen.getByTestId('top-up-20-btn');
    fireEvent.click(topUp20);

    // Simulate passage
    const simulateBtn = screen.getByTestId('simulate-gate-passage-btn');
    fireEvent.click(simulateBtn);

    expect(screen.getByText(/Turniket Açıqdır/i)).toBeInTheDocument();
  });
});
