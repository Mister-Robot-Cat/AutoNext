import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TachographWorkRestModal } from '../TachographWorkRestModal';

describe('TachographWorkRestModal component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <TachographWorkRestModal
        isOpen={false}
        onClose={vi.fn()}
        currency="AZN"
      />
    );
    expect(screen.queryByTestId('tachograph-work-rest-modal')).toBeNull();
  });

  it('renders Tab 1 (Work & Rest Regime AETR) by default and updates fines when continuous driving exceeds 4.5h without 45-min break', () => {
    render(
      <TachographWorkRestModal
        isOpen={true}
        onClose={vi.fn()}
        currency="AZN"
      />
    );

    expect(screen.getByTestId('tachograph-work-rest-modal')).toBeInTheDocument();
    expect(screen.getByTestId('panel-work-rest-aetr')).toBeInTheDocument();
    expect(screen.getByTestId('work-rest-driver-fine')).toHaveTextContent('0 ₼');

    // Increase continuous driving to 6.0 hours and reduce break to 15 minutes
    fireEvent.change(screen.getByTestId('continuous-driving-slider'), {
      target: { value: '6' },
    });
    fireEvent.change(screen.getByTestId('break-minutes-slider'), {
      target: { value: '15' },
    });

    expect(screen.getByTestId('work-rest-driver-fine')).toHaveTextContent('80 ₼');
    expect(screen.getByTestId('work-rest-official-fine')).toHaveTextContent('300 ₼');
  });

  it('switches to Tab 2 (Tachograph Seal & 24-Month Calibration) and detects magnetic impulse sensor tampering', () => {
    render(
      <TachographWorkRestModal
        isOpen={true}
        onClose={vi.fn()}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByTestId('tab-tachograph-plomb'));
    expect(screen.getByTestId('panel-tachograph-plomb')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tacho-condition-magnetic_impulse_sensor_bypass'));
    expect(screen.getByTestId('hardware-verdict-title')).toHaveTextContent(
      'KRİTİK: Maqnit / Sensor Saxtakarlığı'
    );
  });

  it('switches to Tab 3 (Waybill & Passenger Manifest) and flags standing passengers and calculates service packages', () => {
    render(
      <TachographWorkRestModal
        isOpen={true}
        onClose={vi.fn()}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByTestId('tab-waybill-manifest'));
    expect(screen.getByTestId('panel-waybill-manifest')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('seated-capacity-input'), {
      target: { value: '18' },
    });
    fireEvent.change(screen.getByTestId('actual-passengers-input'), {
      target: { value: '25' },
    });

    expect(screen.getByTestId('excess-passengers-value')).toHaveTextContent('+7 nəfər');
    expect(screen.getByTestId('tachograph-service-total')).toHaveTextContent('165 ₼');
  });

  it('switches to Tab 4 (Accredited Centers) and Tab 5 (AYNA-TAXO-2026 Certificate lookup & generation)', () => {
    render(
      <TachographWorkRestModal
        isOpen={true}
        onClose={vi.fn()}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByTestId('tab-tachograph-centers'));
    expect(screen.getByTestId('panel-tachograph-centers')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('tacho-city-filter-Gəncə'));
    expect(screen.getByTestId('tacho-center-card-tacho_center_ganja')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-tachograph-certificate'));
    expect(screen.getByTestId('panel-tachograph-certificate')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('tachograph-lookup-input'), {
      target: { value: 'AYNA-TAXO-2026-31055' },
    });
    fireEvent.click(screen.getByTestId('tachograph-lookup-btn'));
    expect(screen.getByTestId('active-tachograph-cert-number')).toHaveTextContent(
      'AYNA-TAXO-2026-31055'
    );
  });
});
