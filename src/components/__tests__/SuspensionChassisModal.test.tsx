import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SuspensionChassisModal } from '../SuspensionChassisModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('SuspensionChassisModal component', () => {
  const sampleVehicle = MOCK_VEHICLES[0]; // Sample car

  it('does not render when isOpen is false', () => {
    render(
      <SuspensionChassisModal
        isOpen={false}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );
    expect(
      screen.queryByTestId('suspension-chassis-modal')
    ).not.toBeInTheDocument();
  });

  it('renders Tab 1 (MAHA EUSAMA & Peredok) by default and handles presets', () => {
    render(
      <SuspensionChassisModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('suspension-chassis-modal')).toBeInTheDocument();
    expect(screen.getByTestId('eusama-tab-content')).toBeInTheDocument();

    // Check default healthy OEM state
    expect(screen.getByTestId('fl-eusama-val')).toBeInTheDocument();
    expect(screen.getByTestId('eusama-fine-azn')).toHaveTextContent('0 ₼');

    // Click illegal Peredok preset
    fireEvent.click(screen.getByTestId('preset-illegal-peredok'));
    expect(screen.getByTestId('eusama-fine-azn')).toHaveTextContent('150 ₼');
    expect(screen.getByTestId('eusama-verdict-banner')).toHaveTextContent(
      /İSTİSMAR QADAĞANDIR/i
    );

    // Click blown shock absorber preset
    fireEvent.click(screen.getByTestId('preset-blown-shock'));
    expect(screen.getByTestId('fl-eusama-val')).toHaveTextContent('16%');

    // Restore OEM healthy preset
    fireEvent.click(screen.getByTestId('preset-oem-healthy'));
    expect(screen.getByTestId('eusama-fine-azn')).toHaveTextContent('0 ₼');
  });

  it('navigates to Tab 2 (Wheel Fasteners & 3D Geometry) and triggers missing lug bolts & stance violations', () => {
    render(
      <SuspensionChassisModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-geometry'));
    expect(screen.getByTestId('geometry-tab-content')).toBeInTheDocument();

    // Test missing lug bolts slider
    const boltsSlider = screen.getByTestId('missing-bolts-slider');
    fireEvent.change(boltsSlider, { target: { value: '2' } });
    expect(screen.getByTestId('missing-bolts-val')).toHaveTextContent('2');
    expect(screen.getByTestId('geometry-fine-azn')).toHaveTextContent('50 ₼');

    // Test welded rim checkbox
    const rimCheckbox = screen.getByTestId('welded-rim-checkbox');
    fireEvent.click(rimCheckbox);
    expect(screen.getByTestId('geometry-verdict-banner')).toHaveTextContent(
      /İSTİSMAR QADAĞANDIR/i
    );

    // Test extreme stance camber
    const camberSlider = screen.getByTestId('front-camber-slider');
    fireEvent.change(camberSlider, { target: { value: '-4.2' } });
    expect(screen.getByTestId('front-camber-val')).toHaveTextContent('-4.2°');

    // Test longeron diagonal distortion slider
    const longeronSlider = screen.getByTestId('longeron-delta-slider');
    fireEvent.change(longeronSlider, { target: { value: '8.5' } });
    expect(screen.getByTestId('frame-geometry-grade')).toHaveTextContent(
      'Ağır Lonjeron Əyriliyi'
    );
  });

  it('navigates to Tab 3 (Repair Packages) and selects service packages to calculate total cost', () => {
    render(
      <SuspensionChassisModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-packages'));
    expect(screen.getByTestId('packages-tab-content')).toBeInTheDocument();

    // Toggle 3D alignment package
    const pkg3d = screen.getByTestId('package-card-pkg-hunter-3d-alignment');
    fireEvent.click(pkg3d);

    expect(screen.getByTestId('service-total-currency')).toBeInTheDocument();
    expect(screen.getByTestId('service-total-azn')).toBeInTheDocument();
  });

  it('navigates to Tab 4 (Accredited Centers) and filters by city', () => {
    render(
      <SuspensionChassisModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-centers'));
    expect(screen.getByTestId('centers-tab-content')).toBeInTheDocument();

    // Click Gəncə city filter
    const ganjaFilter = screen.getByTestId('city-filter-Gəncə');
    fireEvent.click(ganjaFilter);
    expect(screen.getByTestId('center-card-susp-center-6')).toBeInTheDocument();

    // Click All filter
    const allFilter = screen.getByTestId('city-filter-ALL');
    fireEvent.click(allFilter);
  });

  it('navigates to Tab 5 (BDYP-ASQ-2026 Certificate & Registry Lookup) and tests registry search', () => {
    render(
      <SuspensionChassisModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('certificate-tab-content')).toBeInTheDocument();

    // Check generated certificate details
    expect(
      screen.getByTestId('generated-suspension-certificate')
    ).toBeInTheDocument();
    expect(screen.getByTestId('cert-number-text')).toHaveTextContent(
      /BDYP-ASQ-2026-/
    );

    // Click sample certificate quick lookup button
    const sampleBtn = screen.getByTestId(
      'sample-cert-btn-BDYP-ASQ-2026-88412'
    );
    fireEvent.click(sampleBtn);
    expect(screen.getByTestId('registry-lookup-result')).toBeInTheDocument();
    expect(screen.getByTestId('registry-lookup-result')).toHaveTextContent(
      '10-AA-700'
    );

    // Test copy button
    const copyBtn = screen.getByTestId('copy-cert-btn');
    fireEvent.click(copyBtn);
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <SuspensionChassisModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={onCloseMock}
      />
    );

    const closeBtn = screen.getByTestId('close-suspension-modal-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
