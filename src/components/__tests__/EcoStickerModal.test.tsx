import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EcoStickerModal } from '../EcoStickerModal';

describe('EcoStickerModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
    lang: 'az' as const,
    initialVehicle: {
      makeModel: 'Hyundai Ioniq 5 Long Range EV',
      plate: '90-AA-104',
      vin: 'KNAGH414BBA098124',
      year: 2023,
      fuelType: 'Electric',
      engineCc: 0,
      hasCatalystOrDpf: true,
    },
  };

  it('renders modal header, title, and default calculator tab when open', () => {
    render(<EcoStickerModal {...defaultProps} />);

    expect(screen.getByText(/Yaşıl Bakı — Aşağı Emissiyalı Ekoloji Zonalar/i)).toBeInTheDocument();
    expect(screen.getByTestId('tab-calculator')).toBeInTheDocument();
    expect(screen.getByTestId('tab-zones-radar')).toBeInTheDocument();
    expect(screen.getByTestId('tab-stations')).toBeInTheDocument();
    expect(screen.getByTestId('tab-certificate')).toBeInTheDocument();
    expect(screen.getByText(/Nümunə Avtomobil Seçimi/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<EcoStickerModal {...defaultProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(<EcoStickerModal {...defaultProps} onClose={onCloseMock} />);

    const closeBtn = screen.getByLabelText(/close modal/i);
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches between all navigation tabs cleanly', () => {
    render(<EcoStickerModal {...defaultProps} />);

    // Switch to Zones Radar Tab
    fireEvent.click(screen.getByTestId('tab-zones-radar'));
    expect(screen.getByText(/Bakı Ekoloji Hava Keyfiyyəti/i)).toBeInTheDocument();
    expect(screen.getByText(/Səbail Stansiyası/i)).toBeInTheDocument();

    // Switch to Stations Tab
    fireEvent.click(screen.getByTestId('tab-stations'));
    expect(screen.getByText(/ETSN & BDYP Baş Ekoloji Nəzarət Mərkəzi/i)).toBeInTheDocument();

    // Switch to Certificate Tab
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByText(/Rəsmi Ekoloji Uyğunluq Sertifikatı/i)).toBeInTheDocument();
    expect(screen.getByText(/EKOLOJİ STİKER/i)).toBeInTheDocument();

    // Switch back to Calculator
    fireEvent.click(screen.getByTestId('tab-calculator'));
    expect(screen.getByText(/Nümunə Avtomobil Seçimi/i)).toBeInTheDocument();
  });

  it('applies quick vehicle preset when clicked in calculator tab', () => {
    render(<EcoStickerModal {...defaultProps} />);

    // Click VAZ 2107 preset
    const vazPresetBtn = screen.getByText(/90-SO-128/i).closest('button');
    expect(vazPresetBtn).toBeTruthy();
    if (vazPresetBtn) {
      fireEvent.click(vazPresetBtn);
    }

    expect(screen.getByDisplayValue('90-SO-128')).toBeInTheDocument();
  });

  it('allows booking an inspection appointment in stations tab', () => {
    render(<EcoStickerModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-stations'));

    const bookButtons = screen.getAllByText(/Eko-Diaqnostikaya Yazıl/i);
    expect(bookButtons.length).toBeGreaterThan(0);
    fireEvent.click(bookButtons[0]);

    expect(screen.getByText(/Növbə Rezervasiyası Təsdiqləndi!/i)).toBeInTheDocument();
    expect(screen.getByText(/Talon: EKO-APP-/i)).toBeInTheDocument();
  });

  it('supports copying certificate number and printing in certificate tab', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<EcoStickerModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-certificate'));

    const copyBtn = screen.getByText(/Sertifikat Nömrəsini Kopyala/i);
    fireEvent.click(copyBtn);

    const printBtn = screen.getByText(/Sertifikatı Çap Et/i);
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
