import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpecialSignalModal } from '../SpecialSignalModal';

describe('SpecialSignalModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    initialVehicle: {
      make: 'BMW',
      model: '530i YPX',
      year: 2024,
      vin: 'WBA53AG09NFP10482',
      plateNumber: '99-YP-401',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<SpecialSignalModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default tab (audit) when open', () => {
    render(<SpecialSignalModal {...defaultProps} />);
    expect(
      screen.getByText(/Xüsusi Sayrışan Mayak və Siren \(«Miqalka»\) Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('tab-audit')).toBeInTheDocument();
    expect(screen.getByTestId('tab-simulator')).toBeInTheDocument();
    expect(screen.getByTestId('tab-scenarios')).toBeInTheDocument();
    expect(screen.getByTestId('tab-centers')).toBeInTheDocument();
    expect(screen.getByTestId('tab-permit')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<SpecialSignalModal {...defaultProps} />);
    const closeBtn = screen.getByTestId('close-modal-btn');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();

    const footerCloseBtn = screen.getByTestId('footer-close-btn');
    fireEvent.click(footerCloseBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });

  it('switches cleanly between all navigation tabs', () => {
    render(<SpecialSignalModal {...defaultProps} />);

    // Simulator Tab
    fireEvent.click(screen.getByTestId('tab-simulator'));
    expect(screen.getByTestId('strobe-lightbar-container')).toBeInTheDocument();
    expect(screen.getByTestId('tone-btn-wail')).toBeInTheDocument();

    // Scenarios Tab
    fireEvent.click(screen.getByTestId('tab-scenarios'));
    expect(screen.getByTestId('btn-yield-yes')).toBeInTheDocument();

    // Centers Tab
    fireEvent.click(screen.getByTestId('tab-centers'));
    expect(
      screen.getByText(/DİN & AZS Xüsusi İcazə və Akustika Xidmət Paketləri/i)
    ).toBeInTheDocument();

    // Permit Tab
    fireEvent.click(screen.getByTestId('tab-permit'));
    expect(screen.getByTestId('official-din-permit-card')).toBeInTheDocument();

    // Back to Audit Tab
    fireEvent.click(screen.getByTestId('tab-audit'));
    expect(screen.getByTestId('input-vehicle-plate')).toBeInTheDocument();
  });

  it('applies illegal civilian preset and updates audit sanctions to 800 AZN + confiscation', () => {
    render(<SpecialSignalModal {...defaultProps} />);

    // Click civilian illegal preset
    const illegalPreset = screen.getByTestId('preset-civilian_illegal_strobe');
    fireEvent.click(illegalPreset);

    // Verify prohibited status
    expect(screen.getByTestId('badge-prohibited')).toBeInTheDocument();
    expect(screen.getByTestId('fine-amount')).toHaveTextContent('800 ₼');
    expect(screen.getByTestId('confiscation-risk')).toHaveTextContent('Məcburi Müsadirə');
  });

  it('interacts with strobe color and siren tone buttons in simulator tab', () => {
    render(<SpecialSignalModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-simulator'));

    // Switch strobe colors
    fireEvent.click(screen.getByTestId('color-btn-amber'));
    fireEvent.click(screen.getByTestId('color-btn-blue'));

    // Trigger synthetic siren tones
    fireEvent.click(screen.getByTestId('tone-btn-wail'));
    fireEvent.click(screen.getByTestId('tone-btn-yelp'));
    fireEvent.click(screen.getByTestId('tone-btn-off'));
  });

  it('switches traffic scenarios and toggles yielding penalty calculation', () => {
    render(<SpecialSignalModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-scenarios'));

    // When yielded = true
    fireEvent.click(screen.getByTestId('btn-yield-yes'));
    expect(screen.getByTestId('scenario-fine')).toHaveTextContent('0 ₼');
    expect(screen.getByTestId('scenario-points')).toHaveTextContent('0 Bal');

    // When yielded = false (violating İXM 327.3)
    fireEvent.click(screen.getByTestId('btn-yield-no'));
    expect(screen.getByTestId('scenario-fine')).toHaveTextContent('100 ₼');
    expect(screen.getByTestId('scenario-points')).toHaveTextContent('3 Bal');
  });

  it('books an appointment at accredited testing laboratory', () => {
    render(<SpecialSignalModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-centers'));

    const bookBtn = screen.getByTestId('btn-book-lab_din_mero_khirdalan');
    fireEvent.click(bookBtn);

    expect(screen.getByText(/baxış və sınaq növbəsi təsdiqləndi/i)).toBeInTheDocument();
  });

  it('generates new official DİN permit and transitions to permit tab', () => {
    render(<SpecialSignalModal {...defaultProps} />);

    // Click generate permit from audit tab
    const genBtn = screen.getByTestId('btn-generate-permit');
    fireEvent.click(genBtn);

    // Should switch to permit tab and display certificate
    expect(screen.getByTestId('official-din-permit-card')).toBeInTheDocument();
    expect(
      screen.getByText(/XÜSUSİ SƏS VƏ SAYRIŞAN İŞIQ SİQNALI İCAZƏ VƏRƏQƏSİ/i)
    ).toBeInTheDocument();
  });
});
