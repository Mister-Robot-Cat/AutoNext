import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccidentForensicsModal } from '../AccidentForensicsModal';

describe('AccidentForensicsModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
    initialPlate: '90-OX-404',
    initialVehicleModel: 'BMW 530i (G30)'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<AccidentForensicsModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, vehicle plate, and default skid speed tab when open', () => {
    render(<AccidentForensicsModal {...defaultProps} />);
    expect(screen.getByText(/BDYP & Ədliyyə Nazirliyi YNH Məhkəmə Avtotexniki Ekspertizası/i)).toBeInTheDocument();
    expect(screen.getByText('90-OX-404')).toBeInTheDocument();
    expect(screen.getByText(/Tormozlama Başlanğıcında Sürət/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<AccidentForensicsModal {...defaultProps} />);
    const closeBtn = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all navigation tabs cleanly', () => {
    render(<AccidentForensicsModal {...defaultProps} />);

    // Switch to Avoidance tab
    const avoidanceTabBtn = screen.getByRole('button', { name: /Maneə & Texniki İmkan/i });
    fireEvent.click(avoidanceTabBtn);
    expect(screen.getByText(/Piyada \/ Maneə Aşkar Edilmə Zonası/i)).toBeInTheDocument();

    // Switch to Liability tab
    const liabilityTabBtn = screen.getByRole('button', { name: /İXM 327 vs CM 263 Məsuliyyət/i });
    fireEvent.click(liabilityTabBtn);
    expect(screen.getByText(/Hadisənin Ağırlaşdırıcı Şərtləri/i)).toBeInTheDocument();

    // Switch to Insurance tab
    const insuranceTabBtn = screen.getByRole('button', { name: /İSB & KASKO Sığorta/i });
    fireEvent.click(insuranceTabBtn);
    expect(screen.getByText(/Zərər Qiymətləndirilməsi və Təqsir Nisbəti/i)).toBeInTheDocument();

    // Switch to Report tab
    const reportTabBtn = screen.getByRole('button', { name: /Məhkəmə Rəyi \(MEM-YNH\)/i });
    fireEvent.click(reportTabBtn);
    expect(screen.getByText(/MƏHKƏMƏ EKSPERTİZASI MƏRKƏZİ/i)).toBeInTheDocument();
  });

  it('interacts with skid mark slider and recalculates speed in skid speed tab', () => {
    render(<AccidentForensicsModal {...defaultProps} />);
    const skidSlider = screen.getByLabelText(/Qeydə alınmış tormoz izi uzunluğu/i);
    fireEvent.change(skidSlider, { target: { value: '45' } });
    expect(screen.getByText('45.0 metr')).toBeInTheDocument();
  });

  it('applies quick accident presets when clicked', () => {
    render(<AccidentForensicsModal {...defaultProps} />);
    const presetBtn = screen.getByRole('button', { name: /M-1/i });
    fireEvent.click(presetBtn);

    // Plate and skid mark should update to preset values
    expect(screen.getByText('99-ZZ-099')).toBeInTheDocument();
    expect(screen.getByText('58.0 metr')).toBeInTheDocument();
  });

  it('submits and generates report when clicking Yekun Rəy Tərtib Et button', () => {
    render(<AccidentForensicsModal {...defaultProps} />);
    const generateBtn = screen.getByRole('button', { name: /Yekun Rəy Tərtib Et/i });
    fireEvent.click(generateBtn);

    expect(screen.getByText(/MƏHKƏMƏ EKSPERTİZASI MƏRKƏZİ/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rəyi Kopyala/i })).toBeInTheDocument();
  });

  it('handles copy report action in report tab', () => {
    const originalClipboard = navigator.clipboard;
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    render(<AccidentForensicsModal {...defaultProps} />);
    const reportTabBtn = screen.getByRole('button', { name: /Məhkəmə Rəyi \(MEM-YNH\)/i });
    fireEvent.click(reportTabBtn);

    const copyBtn = screen.getByRole('button', { name: /Rəyi Kopyala/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
    Object.assign(navigator, { clipboard: originalClipboard });
  });
});
