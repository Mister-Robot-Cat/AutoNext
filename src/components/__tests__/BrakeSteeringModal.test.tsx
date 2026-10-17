import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrakeSteeringModal } from '../BrakeSteeringModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('BrakeSteeringModal component', () => {
  const defaultProps = {
    isOpen: true,
    vehicle: MOCK_VEHICLES[0],
    currency: 'AZN' as const,
    onClose: vi.fn(),
  };

  it('does not render when isOpen is false', () => {
    render(<BrakeSteeringModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('brake-steering-modal')).toBeNull();
  });

  it('renders Roller Brake Stand tab by default with compliant factory telemetry', () => {
    render(<BrakeSteeringModal {...defaultProps} />);
    expect(screen.getByTestId('brake-steering-modal')).toBeDefined();
    expect(screen.getByTestId('overall-roadworthiness-badge').textContent).toContain(
      'İSTİSMARA YARARLIDIR'
    );
    expect(screen.getByTestId('brake-fine-amount').textContent).toContain('0 ₼');
  });

  it('triggers caliper imbalance (>15%) and İXM 342.2 (150 AZN) & 96.1.4 prohibition banner via preset or slider', () => {
    render(<BrakeSteeringModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('preset-imbalance-btn'));

    expect(screen.getByTestId('overall-roadworthiness-badge').textContent).toContain(
      'İSTİSMARI QADAĞANDIR'
    );
    expect(screen.getByTestId('brake-prohibition-banner')).toBeDefined();
    expect(screen.getByTestId('brake-fine-amount').textContent).toContain('150');
  });

  it('switches to Steering Luftometer tab (YHQ Annex 1 Section II) and audits steering play angle (>10°)', () => {
    render(<BrakeSteeringModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-steering_luft'));

    const playSlider = screen.getByTestId('slider-steering-play');
    fireEvent.change(playSlider, { target: { value: '15' } });

    expect(screen.getByTestId('steering-play-degrees-display').textContent).toContain('15°');
    expect(screen.getByTestId('steering-fine-amount').textContent).toContain('150');
  });

  it('simulates real-time stopping distance physics and DOT-4 moisture boiling risk on Tab 3', () => {
    render(<BrakeSteeringModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('preset-mountain-fade-btn'));

    expect(screen.getByTestId('total-stopping-distance')).toBeDefined();
    expect(screen.getByTestId('boiling-point-badge').textContent).toContain('°C');
    expect(screen.getByTestId('obstacle-impact-speed').textContent).toContain('km/saat');
  });

  it('displays accredited BDYP & Bosch roller brake diagnostic centers on Tab 4 and filters by city', () => {
    render(<BrakeSteeringModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-centers'));

    expect(
      screen.getByText(/BDYP Sabunçu Mərkəzi Texniki Müayinə və Tormoz Stendi/i)
    ).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Gəncə' }));
    expect(
      screen.getByText(/Gəncə Regional Авто-Diaqnostika & Tormoz Stendi Mərkəzi/i)
    ).toBeDefined();
  });

  it('generates BDYP-TRM-2026 certificate and verifies registry lookup on Tab 5', () => {
    render(<BrakeSteeringModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-certificate'));

    expect(screen.getByTestId('certificate-number').textContent).toMatch(/^BDYP-TRM-2026-\d{5}$/);

    const lookupInput = screen.getByTestId('registry-lookup-input');
    fireEvent.change(lookupInput, { target: { value: 'BDYP-TRM-2026-84102' } });
    expect(screen.getByTestId('registry-lookup-result').textContent).toContain(
      'Təsdiqlənmiş Protokol Tapıldı'
    );
  });
});
