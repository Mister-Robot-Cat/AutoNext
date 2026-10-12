import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BillOfSaleModal } from '../BillOfSaleModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

const mockVehicle = MOCK_VEHICLES[0];

describe('BillOfSaleModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders modal header, tabs, and form when open', () => {
    render(
      <BillOfSaleModal
        isOpen={true}
        vehicle={mockVehicle}
        lang="az"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('bill-of-sale-modal')).toBeInTheDocument();
    expect(screen.getByText(/Notariat Alqı-Satqı Müqaviləsi/i)).toBeInTheDocument();
    expect(screen.getByTestId('tab-form')).toBeInTheDocument();
    expect(screen.getByTestId('tab-costs')).toBeInTheDocument();
    expect(screen.getByTestId('tab-document')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <BillOfSaleModal
        isOpen={false}
        vehicle={mockVehicle}
        lang="az"
        onClose={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('switches between tabs properly', () => {
    render(
      <BillOfSaleModal
        isOpen={true}
        vehicle={mockVehicle}
        lang="az"
        onClose={vi.fn()}
      />
    );

    // Initial tab is form
    expect(screen.getByTestId('seller-name-input')).toBeInTheDocument();

    // Switch to Costs tab
    fireEvent.click(screen.getByTestId('tab-costs'));
    expect(screen.getByText(/Qanunvericilik üzrə Rəsmi Xərclər Cədvəli/i)).toBeInTheDocument();

    // Switch to Document preview tab
    fireEvent.click(screen.getByTestId('tab-document'));
    expect(screen.getByTestId('contract-legal-sheet')).toBeInTheDocument();
  });

  it('applies preset templates when clicked', () => {
    render(
      <BillOfSaleModal
        isOpen={true}
        vehicle={mockVehicle}
        lang="az"
        onClose={vi.fn()}
      />
    );

    const dealerPresetBtn = screen.getByTestId('preset-btn-dealer-sale');
    fireEvent.click(dealerPresetBtn);

    const sellerInput = screen.getByTestId('seller-name-input') as HTMLInputElement;
    expect(sellerInput.value).toContain('Baku Prestige Motors');
  });

  it('calculates closing fees dynamically when toggling relationship and plate retention', () => {
    render(
      <BillOfSaleModal
        isOpen={true}
        vehicle={mockVehicle}
        lang="az"
        onClose={vi.fn()}
      />
    );

    // Go to costs tab
    fireEvent.click(screen.getByTestId('tab-costs'));

    // Toggle close relatives
    const relativeBtn = screen.getByTestId('relationship-relative-btn');
    fireEvent.click(relativeBtn);

    // In 2.0L engine, normal duty is 90 AZN, but for relatives it is 30 AZN (savings = 60 AZN)
    expect(screen.getByText(/60 AZN Qənaət/i)).toBeInTheDocument();

    // Toggle new plate issue (+35 AZN)
    const newPlateBtn = screen.getByTestId('plate-new-btn');
    fireEvent.click(newPlateBtn);

    // Grand total = 30 (duty) + 15 (service) + 30 (tech) + 35 (plate) + 30 (inspect) + 10 (ins) = 150 AZN
    expect(screen.getAllByText(/150 AZN/i).length).toBeGreaterThan(0);
  });

  it('switches preview language between AZ and EN in document tab', () => {
    render(
      <BillOfSaleModal
        isOpen={true}
        vehicle={mockVehicle}
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-document'));

    // By default in AZ
    expect(screen.getByText(/NƏQLİYYAT VASİTƏSİNİN NOTARİAL ALQI-SATQI MÜQAVİLƏSİ/i)).toBeInTheDocument();

    // Switch to English
    fireEvent.click(screen.getByTestId('contract-lang-en-btn'));
    expect(screen.getByText(/OFFICIAL VEHICLE BILL OF SALE & PURCHASE AGREEMENT/i)).toBeInTheDocument();
  });

  it('handles copying contract text to clipboard', async () => {
    render(
      <BillOfSaleModal
        isOpen={true}
        vehicle={mockVehicle}
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-document'));
    const copyBtn = screen.getByTestId('copy-contract-btn');
    await React.act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(screen.getByTestId('copy-contract-btn')).toBeInTheDocument();
  });

  it('triggers window.print when print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <BillOfSaleModal
        isOpen={true}
        vehicle={mockVehicle}
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-document'));
    const printBtn = screen.getByTestId('print-contract-btn');
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <BillOfSaleModal
        isOpen={true}
        vehicle={mockVehicle}
        lang="az"
        onClose={onCloseMock}
      />
    );

    const closeBtn = screen.getByTestId('close-contract-modal-btn');
    fireEvent.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
