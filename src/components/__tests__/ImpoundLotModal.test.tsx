import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImpoundLotModal } from '../ImpoundLotModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('ImpoundLotModal', () => {
  const defaultProps = {
    isOpen: true,
    vehicle: MOCK_VEHICLES[0],
    currency: 'AZN' as const,
    lang: 'az' as const,
    onClose: vi.fn(),
  };

  it('does not render when isOpen is false', () => {
    render(<ImpoundLotModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('impound-lot-modal')).not.toBeInTheDocument();
  });

  it('renders search tab by default and finds active impounded vehicles or clean status', () => {
    render(<ImpoundLotModal {...defaultProps} />);
    expect(screen.getByTestId('impound-lot-modal')).toBeInTheDocument();
    expect(screen.getByTestId('impound-search-panel')).toBeInTheDocument();

    // Click preset for 77-XX-777
    fireEvent.click(screen.getByTestId('preset-plate-77-XX-777'));
    expect(screen.getByTestId('impound-record-found')).toBeInTheDocument();
    expect(screen.getByText(/BMW X5 xDrive40i/i)).toBeInTheDocument();
    expect(screen.getByText(/PLOMB-AZ-79204/i)).toBeInTheDocument();

    // Click clean preset 10-ZZ-999
    fireEvent.click(screen.getByTestId('preset-plate-clean'));
    expect(screen.getByTestId('impound-record-clean')).toBeInTheDocument();
  });

  it('loads record into Tariff Council calculator and updates fees dynamically', () => {
    render(<ImpoundLotModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('preset-plate-99-AA-001'));
    fireEvent.click(screen.getByTestId('load-record-to-calculator-btn'));

    expect(screen.getByTestId('impound-calculator-panel')).toBeInTheDocument();
    // 99-AA-001 has 346.2 (40 AZN -> 20 AZN with 50% discount) + 20 AZN towing + 0 AZN storage (2 hours) + 0.5 AZN commission = 40.50 AZN
    expect(screen.getByTestId('calc-total-payable')).toHaveTextContent('40.50 ₼');

    // Change hours to 48 hours (2 days = 2 AZN storage)
    const hoursInput = screen.getByTestId('hours-impounded-input');
    fireEvent.change(hoursInput, { target: { value: '48' } });
    expect(screen.getByTestId('calc-storage-fee')).toHaveTextContent('2 ₼');
    expect(screen.getByTestId('calc-total-payable')).toHaveTextContent('42.50 ₼');

    // Switch weight class to heavy (> 10t -> 60 AZN towing + 2 days * 3 AZN = 6 AZN storage)
    fireEvent.click(screen.getByTestId('weight-class-heavy_over_10t'));
    expect(screen.getByTestId('calc-towing-fee')).toHaveTextContent('60 ₼');
    expect(screen.getByTestId('calc-storage-fee')).toHaveTextContent('6 ₼');

    // Toggle İXM 96.10 exoneration
    fireEvent.click(screen.getByTestId('toggle-exonerated'));
    expect(screen.getByTestId('calc-total-payable')).toHaveTextContent('0 ₼');
  });

  it('audits towing legality under İXM Article 96.2 and transitions to exoneration mode', () => {
    render(<ImpoundLotModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-impound-legality'));
    expect(screen.getByTestId('impound-legality-panel')).toBeInTheDocument();

    // Initially lawful (obstruction = true, driver present = false)
    expect(screen.getByTestId('legality-verdict-title')).toHaveTextContent(/QANUNİ TƏXLİYƏ/i);

    // Check "driver present before tow truck started moving" (İXM 96.2)
    fireEvent.click(screen.getByTestId('audit-driver-present'));
    expect(screen.getByTestId('legality-verdict-title')).toHaveTextContent(/QANUNSUZ EVAKUASİYA/i);

    // Click apply exoneration button
    fireEvent.click(screen.getByTestId('apply-exoneration-btn'));
    expect(screen.getByTestId('impound-calculator-panel')).toBeInTheDocument();
    expect(screen.getByTestId('calc-total-payable')).toHaveTextContent('0 ₼');
  });

  it('filters BDYP & AYNA impound lots by city and selects a lot for release', () => {
    render(<ImpoundLotModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-impound-lots'));
    expect(screen.getByTestId('impound-lots-panel')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('filter-lot-city-Sumqayıt'));
    expect(screen.getByTestId('impound-lot-card-lot-sumgayit-regional')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('select-lot-btn-lot-sumgayit-regional'));
    expect(screen.getByTestId('impound-release-panel')).toBeInTheDocument();
  });

  it('generates and verifies an official E-Buraxılış release pass', () => {
    render(<ImpoundLotModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-impound-release'));
    expect(screen.getByTestId('impound-release-panel')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('release-owner-name-input'), {
      target: { value: 'Hüseynov Elvin Tofiq oğlu' },
    });
    fireEvent.change(screen.getByTestId('release-fin-input'), {
      target: { value: '7XY19A4' },
    });

    fireEvent.click(screen.getByTestId('generate-release-pass-btn'));

    const passNumberText = screen.getByTestId('release-pass-number').textContent || '';
    expect(passNumberText).toMatch(/BDYP-CM-2026-\d{5}/);
    expect(screen.getByTestId('verified-pass-result')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<ImpoundLotModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('close-impound-modal-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
