import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InternationalFreightModal } from '../InternationalFreightModal';

describe('InternationalFreightModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<InternationalFreightModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default calculator tab when open', () => {
    render(<InternationalFreightModal {...defaultProps} />);

    expect(screen.getByTestId('international-freight-modal')).toBeInTheDocument();
    expect(screen.getByText(/Beynəlxalq Avtomobil Yük Daşımaları & E-CMR Portalı/i)).toBeInTheDocument();
    expect(screen.getByText(/Yük və Marşrut Parametrləri/i)).toBeInTheDocument();
    expect(screen.getByTestId('total-freight-amount')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<InternationalFreightModal {...defaultProps} />);

    const closeBtn = screen.getByTestId('modal-close-button');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches between tabs cleanly', () => {
    render(<InternationalFreightModal {...defaultProps} />);

    // Click Corridors Tab
    fireEvent.click(screen.getByTestId('tab-corridors'));
    expect(screen.getByText(/Azərbaycanın Strateji Beynəlxalq Nəqliyyat Dəhlizləri/i)).toBeInTheDocument();

    // Click DİB Quotas Tab
    fireEvent.click(screen.getByTestId('tab-dib_quotas'));
    expect(screen.getByText(/AYNA Dövlət İcazə Blankları \(DİB\) və Beynəlxalq Kvotalar/i)).toBeInTheDocument();

    // Click E-CMR Voucher Tab
    fireEvent.click(screen.getByTestId('tab-ecmr_voucher'));
    expect(screen.getByText(/BMT UNECE Beynəlxalq E-CMR Elektron Yük Qaiməsi/i)).toBeInTheDocument();

    // Click Registry Tab
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByText(/Canlı Beynəlxalq Yük Daşımaları Reyestri/i)).toBeInTheDocument();

    // Click back to Calculator Tab
    fireEvent.click(screen.getByTestId('tab-calculator'));
    expect(screen.getByText(/Yük və Marşrut Parametrləri/i)).toBeInTheDocument();
  });

  it('updates freight calculation when corridor is changed', () => {
    render(<InternationalFreightModal {...defaultProps} />);

    const corridorSelect = screen.getByTestId('corridor-select');
    fireEvent.change(corridorSelect, { target: { value: 'turkey_europe_corridor' } });

    expect(screen.getByText(/Qırmızı Körpü və Sarpi/i)).toBeInTheDocument();
  });

  it('toggles TIR Carnet, ADR, and Reefer surcharge checkboxes', () => {
    render(<InternationalFreightModal {...defaultProps} />);

    const tirCheckbox = screen.getByTestId('tir-carnet-checkbox');
    const adrCheckbox = screen.getByTestId('adr-surcharge-checkbox');
    const reeferCheckbox = screen.getByTestId('reefer-checkbox');

    // Toggle ADR
    fireEvent.click(adrCheckbox);
    expect(adrCheckbox).toBeChecked();

    // Toggle Reefer
    fireEvent.click(reeferCheckbox);
    expect(reeferCheckbox).toBeChecked();

    // Uncheck TIR
    fireEvent.click(tirCheckbox);
    expect(tirCheckbox).not.toBeChecked();
  });

  it('updates SDR calculation when gross weight is changed', () => {
    render(<InternationalFreightModal {...defaultProps} />);

    const weightSlider = screen.getByTestId('gross-weight-slider');
    fireEvent.change(weightSlider, { target: { value: '20000' } });

    expect(screen.getByText(/20,000 kq/i)).toBeInTheDocument();
  });

  it('filters DİB quotas by search query', () => {
    render(<InternationalFreightModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-dib_quotas'));

    const searchInput = screen.getByPlaceholderText(/Ölkə axtarışı.../i);
    fireEvent.change(searchInput, { target: { value: 'Türkiyə' } });

    expect(screen.getByText(/Türkiyə Respublikası/i)).toBeInTheDocument();
    expect(screen.queryByText(/Almaniya Federativ/i)).not.toBeInTheDocument();
  });

  it('generates e-CMR and navigates to e-CMR voucher tab', () => {
    render(<InternationalFreightModal {...defaultProps} />);

    const generateBtn = screen.getByTestId('generate-ecmr-button');
    fireEvent.click(generateBtn);

    expect(screen.getByText(/BMT UNECE Beynəlxalq E-CMR Elektron Yük Qaiməsi/i)).toBeInTheDocument();
    expect(screen.getByTestId('copy-ecmr-button')).toBeInTheDocument();
    expect(screen.getByTestId('print-ecmr-button')).toBeInTheDocument();
  });

  it('handles copying e-CMR and printing in voucher tab', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<InternationalFreightModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-ecmr_voucher'));

    const copyBtn = screen.getByTestId('copy-ecmr-button');
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const printBtn = screen.getByTestId('print-ecmr-button');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('filters active consignments registry via search input', () => {
    render(<InternationalFreightModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-registry'));

    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: 'SOCAR' } });

    expect(screen.getByText(/SOCAR Polymer MMC/i)).toBeInTheDocument();
    expect(screen.queryByText(/AgroDairy MMC/i)).not.toBeInTheDocument();
  });
});
