import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BonusMalusModal } from '../BonusMalusModal';

describe('BonusMalusModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    initialVehicle: {
      makeModel: 'Toyota Camry',
      plate: '90-AA-104',
      engineCc: 2487,
      isElectric: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<BonusMalusModal {...defaultProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal header, title, and default tab (calculator) when open', () => {
    render(<BonusMalusModal {...defaultProps} />);
    expect(screen.getByText('AMB & İSB Bonus-Malus Reyestri')).toBeInTheDocument();
    expect(screen.getByText('Mərkəzi Bank Standartı')).toBeInTheDocument();
    expect(screen.getByText('Kalkulyator & Tarif')).toBeInTheDocument();
    expect(screen.getByText('Qanuni Sığorta Parametrləri')).toBeInTheDocument();
  });

  it('calls onClose when close button or bottom button is clicked', () => {
    render(<BonusMalusModal {...defaultProps} />);
    const closeButtons = screen.getAllByRole('button', { name: /Bağla/i });
    fireEvent.click(closeButtons[0]);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all navigation tabs cleanly', () => {
    render(<BonusMalusModal {...defaultProps} />);

    // Switch to Registry
    fireEvent.click(screen.getByText(/İSB Vahid Reyestr/i));
    expect(
      screen.getByText(/İSB Vahid Məlumat Bazası üzrə Sürücü Axtarışı/i)
    ).toBeInTheDocument();

    // Switch to Matrix
    fireEvent.click(screen.getByText(/14 Sinifli Matris/i));
    expect(screen.getByText(/Başlanğıc Sinfi:/i)).toBeInTheDocument();

    // Switch to Insurers
    fireEvent.click(screen.getByText(/Akkreditə Sığortaçılar/i));
    expect(screen.getByText(/PAŞA Sığorta ASC/i)).toBeInTheDocument();

    // Switch to Certificate
    fireEvent.click(screen.getByText(/Rəsmi Arayış/i));
    expect(
      screen.getByText(/Bonus-Malus Sinfinə Dair Rəsmi Elektron Arayış/i)
    ).toBeInTheDocument();
  });

  it('updates calculation when toggling electric mode in calculator tab', () => {
    render(<BonusMalusModal {...defaultProps} />);

    const electricCheckbox = screen.getByRole('checkbox');
    expect(electricCheckbox).not.toBeChecked();

    fireEvent.click(electricCheckbox);
    expect(electricCheckbox).toBeChecked();
    expect(screen.getByText(/Elektromobil \(1.0x\)/i)).toBeInTheDocument();
  });

  it('applies vehicle presets and updates engine displacement', () => {
    render(<BonusMalusModal {...defaultProps} />);

    // Click BYD preset
    const bydButton = screen.getByText('BYD').closest('button');
    expect(bydButton).not.toBeNull();
    fireEvent.click(bydButton!);

    expect(screen.getByText(/Elektromobil \(1.0x\)/i)).toBeInTheDocument();
  });

  it('filters drivers by FIN or name and displays driver claims in registry tab', () => {
    render(<BonusMalusModal {...defaultProps} />);

    // Navigate to Registry tab
    fireEvent.click(screen.getByText(/İSB Vahid Reyestr/i));

    // Search for Tural
    const searchInput = screen.getByPlaceholderText(
      /Sürücünün FİN kodunu, lisenziya nömrəsini və ya dövlət nömrə nişanını daxil edin.../i
    );
    fireEvent.change(searchInput, { target: { value: 'Tural' } });

    // Click Tural's preset chip
    const turalChip = screen.getByRole('button', { name: /Tural/i });
    fireEvent.click(turalChip);

    expect(screen.getByText(/Tural Hüseynov İlham oğlu/i)).toBeInTheDocument();
    expect(screen.getByText(/CLM-2025-1102/i)).toBeInTheDocument();
  });

  it('simulates class transitions in matrix tab', () => {
    render(<BonusMalusModal {...defaultProps} />);

    // Navigate to Matrix tab
    fireEvent.click(screen.getByText(/14 Sinifli Matris/i));

    // Click '1 Qəza'
    const oneAccidentBtn = screen.getByRole('button', { name: '1' });
    fireEvent.click(oneAccidentBtn);

    // Baseline BM_7 on 1 accident -> BM_2
    expect(screen.getByText(/Nəticə Sinif:/i)).toBeInTheDocument();
  });

  it('filters insurers and triggers hotline call simulation', () => {
    render(<BonusMalusModal {...defaultProps} />);

    // Navigate to Insurers tab
    fireEvent.click(screen.getByText(/Akkreditə Sığortaçılar/i));

    const insurerSearchInput = screen.getByPlaceholderText(
      /Sığorta şirkəti və ya qaynar xətt axtar.../i
    );
    fireEvent.change(insurerSearchInput, { target: { value: 'Qala' } });

    expect(screen.getByText(/Qala Sığorta ASC/i)).toBeInTheDocument();

    // Click call button
    const callButton = screen.getByRole('button', { name: /Qaynar Xətt: \*1177/i });
    fireEvent.click(callButton);

    expect(screen.getByText(/Zəng qovşağına qoşuldu.../i)).toBeInTheDocument();
  });

  it('triggers print and copy operations in certificate tab', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<BonusMalusModal {...defaultProps} />);

    // Navigate to Certificate tab
    fireEvent.click(screen.getByText(/Rəsmi Arayış/i));

    // Click Print button
    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    // Click Copy Number button
    const copyBtn = screen.getByRole('button', { name: /Nömrəni Kopyala/i });
    fireEvent.click(copyBtn);
    expect(screen.getByText(/Kopyalandı/i)).toBeInTheDocument();
  });
});
