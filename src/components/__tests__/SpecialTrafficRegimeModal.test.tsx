import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpecialTrafficRegimeModal } from '../SpecialTrafficRegimeModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('SpecialTrafficRegimeModal Component', () => {
  const defaultProps = {
    isOpen: true,
    vehicle: MOCK_VEHICLES[0],
    currency: 'AZN' as const,
    lang: 'az' as const,
    onClose: vi.fn(),
  };

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <SpecialTrafficRegimeModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal header and defaults to Bus Lane Auditor tab with lawful 1.11 dashed maneuver', () => {
    render(<SpecialTrafficRegimeModal {...defaultProps} />);

    expect(
      screen.getByText(/AYNA & BDYP Xüsusi Hərəkət Rejimi, Avtobus Zolaqları və Bakı Giriş Portalı/i)
    ).toBeInTheDocument();

    expect(screen.getByTestId('bus-lane-verdict-code')).toHaveTextContent(
      'EXEMPT_LAWFUL_DASHED_MANEUVER_YHQ_48'
    );
    expect(screen.getByTestId('bus-lane-payable-fine')).toHaveTextContent('0 ₼');
    expect(screen.getByTestId('bus-lane-penalty-points')).toHaveTextContent('0 Bal');
  });

  it('calculates 100 AZN (50 AZN discounted) fine and 2 points when solid 1.1 line is crossed', () => {
    render(<SpecialTrafficRegimeModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('btn-line-solid'));

    expect(screen.getByTestId('bus-lane-verdict-code')).toHaveTextContent(
      'VIOLATION_SOLID_LINE_CROSSING_IXM_327_1_1'
    );
    expect(screen.getByTestId('bus-lane-base-fine')).toHaveTextContent('100 ₼');
    expect(screen.getByTestId('bus-lane-payable-fine')).toHaveTextContent('50 ₼');
    expect(screen.getByTestId('bus-lane-penalty-points')).toHaveTextContent('2 Bal');

    // Uncheck 50% early discount
    fireEvent.click(screen.getByTestId('checkbox-bus-lane-discount'));
    expect(screen.getByTestId('bus-lane-payable-fine')).toHaveTextContent('100 ₼');
  });

  it('switches to Tab 2 (Corridors Radar) and filters Baku bus lane avenues', () => {
    render(<SpecialTrafficRegimeModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-corridors-radar'));
    expect(screen.getByTestId('corridor-card-AYNA-BZ-01')).toBeInTheDocument();

    const searchInput = screen.getByTestId('input-corridor-search');
    fireEvent.change(searchInput, { target: { value: 'Tbilisi' } });

    expect(screen.getByTestId('corridor-card-AYNA-BZ-03')).toBeInTheDocument();
    expect(screen.queryByTestId('corridor-card-AYNA-BZ-01')).not.toBeInTheDocument();
  });

  it('switches to Tab 3 (Baku Entry & WIM Scale) and evaluates truck daytime restrictions & axle overweight fines', () => {
    render(<SpecialTrafficRegimeModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-entry-and-wim'));
    expect(screen.getByTestId('entry-status-heading')).toHaveTextContent(
      'BAKI ŞƏHƏRİNƏ GİRİŞ İCAZƏLİDİR'
    );

    // Switch to heavy truck (>8t) during daytime without pass
    fireEvent.change(screen.getByTestId('select-entry-vehicle-type'), {
      target: { value: 'heavy_truck_over_8t' },
    });
    expect(screen.getByTestId('entry-status-heading')).toHaveTextContent(
      'GİRİŞ QADAĞANDIR / NORMA AŞILMIŞDIR'
    );
    expect(screen.getByTestId('entry-violation-fine')).toHaveTextContent('100 ₼');

    // Increase single axle load to 13t (>10t limit)
    fireEvent.change(screen.getByTestId('slider-axle-tons'), {
      target: { value: '13' },
    });
    expect(screen.getByTestId('wim-overweight-fine')).toHaveTextContent('600 ₼');
  });

  it('switches to Tab 4 (AYNA E-Entry Pass) and generates a new electronic pass', () => {
    render(<SpecialTrafficRegimeModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-e-entry-pass'));

    // Default pre-populated lookup result
    expect(screen.getByTestId('pass-serial-number')).toHaveTextContent('AYNA-EB-2026-84120');

    // Change plate and generate new pass
    fireEvent.change(screen.getByTestId('input-pass-plate'), {
      target: { value: '77-ZZ-707' },
    });
    fireEvent.click(screen.getByTestId('btn-generate-ayna-pass'));

    expect(screen.getByTestId('ayna-pass-certificate-card')).toHaveTextContent('77-ZZ-707');
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(<SpecialTrafficRegimeModal {...defaultProps} onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId('close-special-traffic-modal-btn'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
