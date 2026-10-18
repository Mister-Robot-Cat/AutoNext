import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BodyworkAdvertisingModal } from '../BodyworkAdvertisingModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('BodyworkAdvertisingModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <BodyworkAdvertisingModal
        isOpen={false}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
      />
    );
    expect(screen.queryByTestId('bodywork-advertising-modal')).not.toBeInTheDocument();
  });

  it('renders Tab 1 (Color & Vinyl Wrap YHQ Art. 27) and detects >30% undeclared matte wrap (150 AZN) vs prohibited operative livery (800 AZN)', () => {
    render(
      <BodyworkAdvertisingModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
      />
    );

    expect(screen.getByTestId('bodywork-advertising-modal')).toBeInTheDocument();
    expect(screen.getByTestId('color-wrap-verdict-card')).toHaveTextContent(
      'YHQ Maddə 27 — Rəng & Kuzov Tam Qanunidir'
    );

    // Click undeclared full matte wrap preset (>30%, 25 days)
    fireEvent.click(screen.getByTestId('preset-wrap-undeclared-matte'));
    expect(screen.getByTestId('wrap-fine-amount')).toHaveTextContent('150 ₼');
    expect(screen.getByTestId('wrap-duty-amount')).toHaveTextContent('50 ₼');

    // Endorse in Texpasport to clear the 150 AZN fine
    fireEvent.click(screen.getByTestId('checkbox-wrap-texpasport'));
    expect(screen.getByTestId('wrap-fine-amount')).toHaveTextContent('0 ₼');

    // Click prohibited operative police/ambulance livery preset (IXM 342.9 800 AZN)
    fireEvent.click(screen.getByTestId('preset-wrap-operative-illegal'));
    expect(screen.getByTestId('wrap-fine-amount')).toHaveTextContent('800 ₼');
  });

  it('switches to Tab 2 (Advertising & ADRA IXM 342.1.8) and evaluates compliant door branding vs >50% unregistered wrap', () => {
    render(
      <BodyworkAdvertisingModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByTestId('tab-advertising-adra'));

    fireEvent.click(screen.getByTestId('preset-ad-compliant-doors'));
    expect(screen.getByTestId('ad-driver-fine')).toHaveTextContent('0 ₼');

    fireEvent.click(screen.getByTestId('preset-ad-over50-unregistered'));
    expect(screen.getByTestId('ad-driver-fine')).toHaveTextContent('50 ₼');
    expect(screen.getByTestId('ad-official-fine')).toHaveTextContent('150 ₼');
  });

  it('switches to Tab 3 (Farkop & Kenguryatnik), Tab 4 (MERO/ADRA Centers), and Tab 5 (BDYP-KUZ-2026 Certificate)', () => {
    render(
      <BodyworkAdvertisingModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
      />
    );

    // Tab 3: Farkop & Kenguryatnik
    fireEvent.click(screen.getByTestId('tab-farkop-hardware'));
    fireEvent.click(screen.getByTestId('preset-hardware-kenguryatnik'));
    expect(screen.getByTestId('hardware-verdict-card')).toHaveTextContent('150 ₼');
    expect(screen.getByTestId('bodywork-service-total')).toHaveTextContent('105 ₼');

    // Tab 4: Centers
    fireEvent.click(screen.getByTestId('tab-bodywork-centers'));
    fireEvent.click(screen.getByTestId('filter-bodywork-city-Xırdalan'));
    expect(
      screen.getByText(/Xırdalan Kuzov və Qoşqu Avadanlığı Laboratoriyası/i)
    ).toBeInTheDocument();

    // Tab 5: Certificate Generation & Lookup
    fireEvent.click(screen.getByTestId('tab-bodywork-certificate'));
    fireEvent.change(screen.getByTestId('bodywork-cert-plate-input'), {
      target: { value: '10-MM-500' },
    });
    fireEvent.click(screen.getByTestId('generate-bodywork-cert-btn'));
    expect(screen.getByTestId('bodywork-certificate-card')).toHaveTextContent('10-MM-500');

    // Lookup existing sample certificate
    fireEvent.change(screen.getByTestId('bodywork-lookup-input'), {
      target: { value: '77-AD-404' },
    });
    fireEvent.click(screen.getByTestId('bodywork-lookup-btn'));
    expect(screen.getByTestId('bodywork-certificate-card')).toHaveTextContent(
      'BDYP-KUZ-2026-63108'
    );
  });
});
