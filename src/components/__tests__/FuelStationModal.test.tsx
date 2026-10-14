import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FuelStationModal } from '../FuelStationModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('FuelStationModal Component', () => {
  const mockOnClose = vi.fn();
  const sampleVehicle = MOCK_VEHICLES[0];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <FuelStationModal
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
      <FuelStationModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/SOCAR & Azpetrol Yanacaq Radarı/i)).toBeInTheDocument();
    expect(screen.getByTestId('station-search-input')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <FuelStationModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const closeBtn = screen.getByTestId('modal-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('filters stations via search input', () => {
    render(
      <FuelStationModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByTestId('station-search-input');
    fireEvent.change(searchInput, { target: { value: 'Babək' } });

    expect(screen.getByText(/Azpetrol — Babək Pr. Flagman/i)).toBeInTheDocument();
  });

  it('filters stations by brand button', () => {
    render(
      <FuelStationModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const brandBtn = screen.getByTestId('filter-brand-azpetrol');
    fireEvent.click(brandBtn);

    expect(screen.getByText(/Azpetrol — Babək Pr. Flagman/i)).toBeInTheDocument();
  });

  it('switches to Trip Calculator tab and allows route selection', () => {
    render(
      <FuelStationModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const calcTabBtn = screen.getByTestId('tab-calculator-btn');
    fireEvent.click(calcTabBtn);

    expect(screen.getByText(/Magistral Marşrut Seçimi/i)).toBeInTheDocument();

    const qubaRouteBtn = screen.getByTestId('route-btn-baku-quba');
    fireEvent.click(qubaRouteBtn);

    expect(screen.getByText(/Bu Səfər Üçün Elektron Çek Al/i)).toBeInTheDocument();
  });

  it('switches to Full Tank tab and generates e-voucher', () => {
    render(
      <FuelStationModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const tankTabBtn = screen.getByTestId('tab-tank-btn');
    fireEvent.click(tankTabBtn);

    expect(screen.getByText(/Çən Göstəriciləri & Yanacaq Seçimi/i)).toBeInTheDocument();

    const generateBtn = screen.getByTestId('generate-tank-voucher-btn');
    fireEvent.click(generateBtn);

    expect(screen.getByTestId('fuel-voucher-receipt')).toBeInTheDocument();
    expect(screen.getByText(/Fiskal Yanacaq Çeki/i)).toBeInTheDocument();
  });

  it('switches to Official Tariffs tab and renders Tarif Şurası table', () => {
    render(
      <FuelStationModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const tariffsTabBtn = screen.getByTestId('tab-tariffs-btn');
    fireEvent.click(tariffsTabBtn);

    expect(screen.getByText(/Azərbaycan Respublikası Tarif \(qiymət\) Şurasının Rəsmi Qərarı/i)).toBeInTheDocument();
    expect(screen.getByText(/Aİ-92 Mütəşəkkil Benzin/i)).toBeInTheDocument();
  });

  it('allows copying voucher code when voucher is displayed', () => {
    render(
      <FuelStationModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    // Switch to tank and generate
    fireEvent.click(screen.getByTestId('tab-tank-btn'));
    fireEvent.click(screen.getByTestId('generate-tank-voucher-btn'));

    const copyBtn = screen.getByTestId('copy-voucher-btn');
    expect(copyBtn).toBeInTheDocument();
    fireEvent.click(copyBtn);
  });
});
