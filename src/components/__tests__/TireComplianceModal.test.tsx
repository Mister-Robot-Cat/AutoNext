import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TireComplianceModal } from '../TireComplianceModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('TireComplianceModal component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    vehicle: MOCK_VEHICLES[0],
    currency: 'AZN' as const,
    lang: 'az' as const,
  };

  it('does not render when isOpen is false', () => {
    render(<TireComplianceModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('tire-compliance-modal')).not.toBeInTheDocument();
  });

  it('renders Tread Depth Auditor tab by default and updates verdict when tread drops below 1.6mm', () => {
    render(<TireComplianceModal {...defaultProps} />);
    expect(screen.getByTestId('tire-compliance-modal')).toBeInTheDocument();
    expect(screen.getByTestId('tread-auditor-panel')).toBeInTheDocument();

    // Initially compliant with 0 AZN fine
    expect(screen.getByTestId('tread-fine-badge')).toHaveTextContent('Cərimə Yoxdur (0 ₼)');

    // Lower Front Left tread slider to 1.1 mm (below 1.6 mm limit)
    const flSlider = screen.getByTestId('slider-tread-fl');
    fireEvent.change(flSlider, { target: { value: '1.1' } });

    expect(screen.getByTestId('min-measured-tread')).toHaveTextContent('1.1 mm');
    expect(screen.getByTestId('tread-fine-badge')).toHaveTextContent('Cərimə: 50 ₼');
    expect(screen.getByTestId('tread-verdict-title')).toHaveTextContent('İXM Maddə 342.1.5');
  });

  it('switches to Tire & Rim Size Equivalence tab and calculates diameter and speedometer deviation', () => {
    render(<TireComplianceModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-size-calculator'));
    expect(screen.getByTestId('size-calculator-panel')).toBeInTheDocument();

    // Increase target rim diameter by +3 inches to trigger >3% constructive violation
    const targetRimInput = screen.getByTestId('input-target-rim');
    fireEvent.change(targetRimInput, { target: { value: '22' } });

    expect(screen.getByTestId('equivalence-summary')).toHaveTextContent('342.2-1');
  });

  it('switches to Mountain Pass Winter Radar tab and evaluates corridor readiness', () => {
    render(<TireComplianceModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-mountain-radar'));
    expect(screen.getByTestId('mountain-radar-panel')).toBeInTheDocument();

    const corridorSelect = screen.getByTestId('select-mountain-corridor');
    fireEvent.change(corridorSelect, { target: { value: 'murovdag-kelbecer-r19' } });

    expect(screen.getByTestId('mountain-readiness-card')).toBeInTheDocument();
    expect(screen.getByTestId('mountain-readiness-score')).toHaveTextContent('/100');
  });

  it('switches to Tire Service, 3D Alignment & Tire Hotel tab and updates total budget', () => {
    render(<TireComplianceModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-service-calculator'));
    expect(screen.getByTestId('service-calculator-panel')).toBeInTheDocument();

    const initialCostText = screen.getByTestId('total-tire-service-cost').textContent;

    // Enable 6-month Tire Hotel (+90 AZN)
    fireEvent.click(screen.getByTestId('checkbox-tire-hotel'));
    const updatedCostText = screen.getByTestId('total-tire-service-cost').textContent;
    expect(updatedCostText).not.toBe(initialCostText);

    // Filter centers by city
    fireEvent.change(screen.getByTestId('select-tire-center-city'), {
      target: { value: 'Sumqayıt' },
    });
    expect(
      screen.getByText(/Sumqayıt Lazer Balans & 3D Razval Mərkəzi/i)
    ).toBeInTheDocument();
  });

  it('switches to Electronic Certificate tab, updates plate number, and searches registry', () => {
    render(<TireComplianceModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-e-certificate'));
    expect(screen.getByTestId('e-certificate-panel')).toBeInTheDocument();

    const plateInput = screen.getByTestId('input-cert-plate');
    fireEvent.change(plateInput, { target: { value: '90-XX-900' } });
    expect(screen.getByTestId('generated-tire-cert-number')).toHaveTextContent(
      /BDYP-SHIN-2026-\d{5}/
    );

    const searchInput = screen.getByTestId('input-tire-registry-search');
    fireEvent.change(searchInput, { target: { value: '77-BX-404' } });
    expect(screen.getByTestId('registry-search-result')).toHaveTextContent('BMW 530e');
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(<TireComplianceModal {...defaultProps} onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId('close-tire-modal-btn'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
