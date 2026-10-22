import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomsTransitModal } from '../CustomsTransitModal';

describe('CustomsTransitModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(<CustomsTransitModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId('customs-transit-modal')).not.toBeInTheDocument();
  });

  it('renders modal header, title, and default tab (calculator) when open', () => {
    render(<CustomsTransitModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId('customs-transit-modal')).toBeInTheDocument();
    expect(
      screen.getByText(/Xarici Qeydiyyatlı Nəqliyyat Vasitələrinin Müvəqqəti İdxal & Tranzit Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('tab-calculator-btn')).toBeInTheDocument();
    expect(screen.getByTestId('tab-regime-btn')).toBeInTheDocument();
    expect(screen.getByTestId('tab-checkpoints-btn')).toBeInTheDocument();
    expect(screen.getByTestId('tab-registry-btn')).toBeInTheDocument();
    expect(screen.getByTestId('tab-permit-btn')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<CustomsTransitModal isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByTestId('close-modal-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches between tabs cleanly', () => {
    render(<CustomsTransitModal isOpen={true} onClose={vi.fn()} />);

    // Switch to 90-Day Regime tab
    fireEvent.click(screen.getByTestId('tab-regime-btn'));
    expect(
      screen.getByText(/Gömrük Məcəlləsi 258 & İXM 499 Cərimə Simulyatoru/i)
    ).toBeInTheDocument();

    // Switch to Checkpoints tab
    fireEvent.click(screen.getByTestId('tab-checkpoints-btn'));
    expect(screen.getByTestId('checkpoint-search-input')).toBeInTheDocument();
    expect(screen.getByText(/Qırmızı Körpü Gömrük Postu/i)).toBeInTheDocument();

    // Switch to Registry tab
    fireEvent.click(screen.getByTestId('tab-registry-btn'));
    expect(screen.getByTestId('permit-search-input')).toBeInTheDocument();

    // Switch to Permit view tab
    fireEvent.click(screen.getByTestId('tab-permit-btn'));
    expect(screen.getByTestId('copy-permit-btn')).toBeInTheDocument();
    expect(screen.getByTestId('print-permit-btn')).toBeInTheDocument();
  });

  it('applies preset and updates calculation params in calculator tab', () => {
    render(<CustomsTransitModal isOpen={true} onClose={vi.fn()} />);

    // Click preset 1 (AR Rezidenti BMW X5)
    const presetBtn = screen.getByTestId('preset-btn-1');
    fireEvent.click(presetBtn);

    // Verify resident status is selected
    const statusSelect = screen.getByTestId('importer-status-select') as HTMLSelectElement;
    expect(statusSelect.value).toBe('resident');
  });

  it('updates regime slider and calculates sanctions in 90-day regime tab', () => {
    render(<CustomsTransitModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-regime-btn'));

    const slider = screen.getByTestId('regime-slider');
    // Set to 110 days (overdue by 20 days -> İXM 499.1: 100 AZN)
    fireEvent.change(slider, { target: { value: '110' } });

    expect(screen.getAllByText(/İXM Maddə 499.1/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/100 ₼/i)).toBeInTheDocument();
  });

  it('filters checkpoints by search query in checkpoints tab', () => {
    render(<CustomsTransitModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-checkpoints-btn'));

    const searchInput = screen.getByTestId('checkpoint-search-input');
    fireEvent.change(searchInput, { target: { value: 'Astara' } });

    expect(screen.getByText(/Astara Gömrük Postu/i)).toBeInTheDocument();
    expect(screen.queryByText(/Samur Gömrük Postu/i)).not.toBeInTheDocument();
  });

  it('filters active permits by search query in registry tab', () => {
    render(<CustomsTransitModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-registry-btn'));

    const permitInput = screen.getByTestId('permit-search-input');
    fireEvent.change(permitInput, { target: { value: 'Camry' } });

    expect(screen.getByText(/Toyota Camry 2.5 Hybrid/i)).toBeInTheDocument();
    expect(screen.queryByText(/Porsche Cayenne GTS/i)).not.toBeInTheDocument();
  });

  it('handles copy and print in permit view tab', () => {
    const originalClipboard = navigator.clipboard;
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<CustomsTransitModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-permit-btn'));

    // Test copy
    const copyBtn = screen.getByTestId('copy-permit-btn');
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    // Test print
    const printBtn = screen.getByTestId('print-permit-btn');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    // Restore
    Object.assign(navigator, { clipboard: originalClipboard });
    printSpy.mockRestore();
  });
});
