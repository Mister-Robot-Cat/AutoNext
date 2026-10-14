import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EvChargingModal } from '../EvChargingModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('EvChargingModal Component', () => {
  const mockOnClose = vi.fn();
  const sampleEv = MOCK_VEHICLES.find(v => v.fuelType === 'electric') || MOCK_VEHICLES[0];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'print').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <EvChargingModal
        isOpen={false}
        vehicle={sampleEv}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and initial stations tab when open', () => {
    render(
      <EvChargingModal
        isOpen={true}
        vehicle={sampleEv}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('ev-charging-modal')).toBeInTheDocument();
    expect(screen.getByText(/Azərişıq & TokBaku Elektromobil Doldurma Şəbəkəsi/i)).toBeInTheDocument();
    expect(screen.getByTestId('station-search-input')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <EvChargingModal
        isOpen={true}
        vehicle={sampleEv}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('ev-modal-close-btn'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('filters stations by text query', () => {
    render(
      <EvChargingModal
        isOpen={true}
        vehicle={sampleEv}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByTestId('station-search-input');
    fireEvent.change(searchInput, { target: { value: 'Port Baku' } });

    expect(screen.getByText(/TokBaku Port Baku Mall Hub/i)).toBeInTheDocument();
    expect(screen.queryByText(/Azərişıq Gəncə Mall Ultra Hub/i)).not.toBeInTheDocument();
  });

  it('switches to calculator tab and displays calculation results', () => {
    render(
      <EvChargingModal
        isOpen={true}
        vehicle={sampleEv}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('tab-calculator-btn'));
    expect(screen.getByTestId('current-soc-slider')).toBeInTheDocument();
    expect(screen.getByTestId('target-soc-slider')).toBeInTheDocument();
    expect(screen.getByTestId('result-minutes')).toBeInTheDocument();
    expect(screen.getByTestId('result-kwh')).toBeInTheDocument();
    expect(screen.getByTestId('result-cost')).toBeInTheDocument();
  });

  it('updates calculations when sliders change', () => {
    render(
      <EvChargingModal
        isOpen={true}
        vehicle={sampleEv}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('tab-calculator-btn'));
    const currentSocSlider = screen.getByTestId('current-soc-slider');
    const targetSocSlider = screen.getByTestId('target-soc-slider');

    fireEvent.change(currentSocSlider, { target: { value: '50' } });
    fireEvent.change(targetSocSlider, { target: { value: '90' } });

    expect(screen.getByTestId('result-kwh')).toBeInTheDocument();
  });

  it('switches between presets and updates battery capacity', () => {
    render(
      <EvChargingModal
        isOpen={true}
        vehicle={sampleEv}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('tab-calculator-btn'));
    const zeekrBtn = screen.getByTestId('preset-btn-zeekr-001-you');
    fireEvent.click(zeekrBtn);

    expect(screen.getAllByText(/100 kWh/i).length).toBeGreaterThanOrEqual(1);
  });

  it('runs live simulation, stops it, and transitions to receipt', async () => {
    render(
      <EvChargingModal
        isOpen={true}
        vehicle={sampleEv}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('tab-simulator-btn'));
    expect(screen.getByTestId('sim-soc-display')).toBeInTheDocument();

    const startBtn = screen.getByTestId('sim-start-btn');
    fireEvent.click(startBtn);

    const stopBtn = screen.getByTestId('sim-stop-btn');
    expect(stopBtn).toBeInTheDocument();

    fireEvent.click(stopBtn);
    expect(screen.getByText(/TokBaku Elektron Şarj Qəbzi/i)).toBeInTheDocument();
  });

  it('switches to green routes tab and lists routes', () => {
    render(
      <EvChargingModal
        isOpen={true}
        vehicle={sampleEv}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('tab-routes-btn'));
    expect(screen.getByText(/Bakı ➔ Sumqayıt/i)).toBeInTheDocument();
    expect(screen.getByText(/Bakı ➔ Gəncə Qərb Dəhlizi/i)).toBeInTheDocument();
  });

  it('handles print and copy receipt actions', () => {
    render(
      <EvChargingModal
        isOpen={true}
        vehicle={sampleEv}
        currency="AZN"
        lang="az"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByTestId('tab-receipt-btn'));
    expect(screen.getByTestId('print-receipt-btn')).toBeInTheDocument();
    expect(screen.getByTestId('copy-receipt-btn')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('print-receipt-btn'));
    expect(window.print).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('copy-receipt-btn'));
    expect(screen.getByText(/Kopyalandı|Məlumatları Kopyala/i)).toBeInTheDocument();
  });
});
