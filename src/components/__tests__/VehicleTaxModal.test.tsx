import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VehicleTaxModal } from '../VehicleTaxModal';

describe('VehicleTaxModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    initialVehicle: {
      makeModel: 'Hyundai Elantra 1.6L',
      vin: 'KMHD84LF7NU123982',
      plate: '99-EL-160',
      engineCc: 1591,
      isElectric: false,
      price: 26000,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<VehicleTaxModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default tab (road_tax) when open', () => {
    render(<VehicleTaxModal {...defaultProps} />);
    expect(screen.getByText('Dövlət Vergi Xidməti (DVX)')).toBeInTheDocument();
    expect(screen.getByText('Avtomobil Vergi Portalı və E-Qaimə Sistemi')).toBeInTheDocument();
    expect(screen.getByTestId('road-tax-section')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<VehicleTaxModal {...defaultProps} />);
    const closeBtn = screen.getByTestId('tax-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all navigation tabs', () => {
    render(<VehicleTaxModal {...defaultProps} />);

    // Switch to Trade-in VAT tab
    fireEvent.click(screen.getByTestId('tab-trade-in-vat'));
    expect(screen.getByTestId('trade-in-vat-section')).toBeInTheDocument();

    // Switch to Fleet Depreciation tab
    fireEvent.click(screen.getByTestId('tab-fleet-depreciation'));
    expect(screen.getByTestId('fleet-depreciation-section')).toBeInTheDocument();

    // Switch to Tax Offices tab
    fireEvent.click(screen.getByTestId('tab-tax-offices'));
    expect(screen.getByTestId('tax-offices-section')).toBeInTheDocument();

    // Switch to E-Invoice tab
    fireEvent.click(screen.getByTestId('tab-e-invoice'));
    expect(screen.getByTestId('e-invoice-section')).toBeInTheDocument();

    // Switch back to Road Tax tab
    fireEvent.click(screen.getByTestId('tab-road-tax'));
    expect(screen.getByTestId('road-tax-section')).toBeInTheDocument();
  });

  it('updates road tax when changing engine displacement and category', () => {
    render(<VehicleTaxModal {...defaultProps} />);

    // Change slider
    const slider = screen.getByTestId('input-engine-cc');
    fireEvent.change(slider, { target: { value: '2500' } });
    expect(screen.getByText('2500 sm³ (2.5 L)')).toBeInTheDocument();

    // Select electric vehicle
    fireEvent.click(screen.getByTestId('category-btn-electric_car'));
    expect(screen.getByText('Elektromobil Yaşıl İqtisadiyyat Güzəşti')).toBeInTheDocument();
    expect(screen.getByText('0.00 AZN')).toBeInTheDocument();

    // Select bus
    fireEvent.click(screen.getByTestId('category-btn-bus'));
    expect(screen.getByTestId('input-seating-capacity')).toBeInTheDocument();

    // Select truck
    fireEvent.click(screen.getByTestId('category-btn-truck'));
    expect(screen.getByTestId('input-payload-tons')).toBeInTheDocument();
  });

  it('applies vehicle presets correctly', () => {
    render(<VehicleTaxModal {...defaultProps} />);

    const presetBtn = screen.getByTestId('preset-btn-preset_sedan_2500');
    fireEvent.click(presetBtn);

    expect(screen.getByText('2487 sm³ (2.5 L)')).toBeInTheDocument();
  });

  it('interacts with trade-in VAT calculator and changes tax regime', () => {
    render(<VehicleTaxModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-trade-in-vat'));

    const purchaseInput = screen.getByTestId('input-purchase-price');
    const sellingInput = screen.getByTestId('input-selling-price');

    fireEvent.change(purchaseInput, { target: { value: '20000' } });
    fireEvent.change(sellingInput, { target: { value: '25000' } });

    // Trade margin = 5000 AZN, 18% VAT = 900 AZN
    expect(screen.getByText('5000.00 AZN')).toBeInTheDocument();
    expect(screen.getByText('900.00 AZN')).toBeInTheDocument();

    // Switch to simplified tax (2% of 25000 = 500 AZN)
    fireEvent.click(screen.getByTestId('regime-simplified'));
    expect(screen.getByText('500.00 AZN')).toBeInTheDocument();
  });

  it('updates corporate fleet depreciation schedule', () => {
    render(<VehicleTaxModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-fleet-depreciation'));

    const assetInput = screen.getByTestId('input-asset-value');
    fireEvent.change(assetInput, { target: { value: '60000' } });

    const methodSelect = screen.getByTestId('select-depreciation-method');
    fireEvent.change(methodSelect, { target: { value: 'declining_balance' } });

    expect(screen.getByText('4-cü il')).toBeInTheDocument();
  });

  it('filters tax offices and toggles ASAN filter', () => {
    render(<VehicleTaxModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-tax-offices'));

    const searchInput = screen.getByTestId('input-office-search');
    fireEvent.change(searchInput, { target: { value: 'Gəncə' } });

    expect(screen.getByText('3 saylı Ərazi Vergilər İdarəsi (Gəncə)')).toBeInTheDocument();
    expect(screen.queryByText('1 saylı Yerli Gəlirlər Baş İdarəsi')).not.toBeInTheDocument();

    // Clear search and check ASAN only
    fireEvent.change(searchInput, { target: { value: '' } });
    const asanCheckbox = screen.getByTestId('checkbox-only-asan');
    fireEvent.click(asanCheckbox);

    expect(screen.getByText('1 saylı Bakı ASAN Xidmət — Vergi Bölməsi')).toBeInTheDocument();
    expect(screen.queryByText('2 saylı Ərazi Vergilər Baş İdarəsi (Sumqayıt)')).not.toBeInTheDocument();
  });

  it('generates a new tax invoice, allows copying code and printing', () => {
    const originalPrint = window.print;
    window.print = vi.fn();

    render(<VehicleTaxModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-e-invoice'));

    // Fill form and submit
    const submitBtn = screen.getByTestId('submit-invoice-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByTestId('invoice-certificate-view')).toBeInTheDocument();

    // Copy code button
    const copyBtn = screen.getByTestId('copy-invoice-code-btn');
    fireEvent.click(copyBtn);

    // Print button
    const printBtn = screen.getByTestId('print-invoice-btn');
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);

    window.print = originalPrint;
  });

  it('filters invoices in the registry', () => {
    render(<VehicleTaxModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-e-invoice'));

    const searchInput = screen.getByTestId('input-invoice-search');
    fireEvent.change(searchInput, { target: { value: 'BMW' } });

    expect(screen.getByText('BMW 530i M Sport')).toBeInTheDocument();
  });
});
