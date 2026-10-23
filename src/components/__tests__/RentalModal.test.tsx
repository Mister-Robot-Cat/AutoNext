import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RentalModal } from '../RentalModal';
import { RENTAL_FLEET_VEHICLES, RENTAL_STATIONS } from '../../data/mockRentalData';

describe('RentalModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default calculator tab when open', () => {
    render(<RentalModal {...defaultProps} />);

    expect(screen.getByText(/Rəsmi Avtomobil İcarəsi və Rent-a-Car Portalı/i)).toBeInTheDocument();
    expect(screen.getByText(/ACRA \/ BDYP/i)).toBeInTheDocument();
    expect(screen.getByText(/İcarə Kalkulyatoru & Park/i)).toBeInTheDocument();
    expect(screen.getByText(/Seçilmiş Model/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<RentalModal {...defaultProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose when close button is clicked', () => {
    render(<RentalModal {...defaultProps} />);

    const closeBtn = screen.getByLabelText('Bağla');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all 4 navigation tabs cleanly', () => {
    render(<RentalModal {...defaultProps} />);

    // Click Eligibility tab
    fireEvent.click(screen.getByText(/Sürücü Şərtləri & Qaydalar/i));
    expect(screen.getByText(/Sürücülük Uyğunluq Auditoru & Şəxsi Parametrlər/i)).toBeInTheDocument();

    // Click Stations tab
    fireEvent.click(screen.getByText(/Təhvil Məntəqələri & Radar/i));
    expect(screen.getByText(/Akkreditə Olunmuş Rəsmi İcarə Şirkətləri/i)).toBeInTheDocument();

    // Click Contract tab
    fireEvent.click(screen.getByText(/Rəsmi E-Müqavilə \(CAR-RNT\)/i));
    expect(screen.getByText(/İcarəçi Məlumatları və Rəsmiləşdirmə/i)).toBeInTheDocument();

    // Back to Calculator tab
    fireEvent.click(screen.getByText(/İcarə Kalkulyatoru & Park/i));
    expect(screen.getByText(/Avtomobil Kateqoriyası/i)).toBeInTheDocument();
  });

  it('filters vehicles by category and selects a different vehicle', () => {
    render(<RentalModal {...defaultProps} />);

    // Filter by 'Biznes' category
    const businessFilter = screen.getByRole('button', { name: 'Biznes' });
    fireEvent.click(businessFilter);

    expect(screen.getByText(/Toyota Camry/i)).toBeInTheDocument();

    // Click Toyota Camry
    const camryCard = screen.getByText(/Toyota Camry/i).closest('div');
    fireEvent.click(camryCard!);

    expect(screen.getAllByText(/Toyota Camry/i).length).toBeGreaterThan(0);
  });

  it('interacts with duration slider and recalculates pricing', () => {
    render(<RentalModal {...defaultProps} />);

    const sliders = screen.getAllByRole('slider');
    const durationSlider = sliders[0]; // first range slider

    fireEvent.change(durationSlider, { target: { value: '7' } });

    expect(screen.getAllByText(/7 gün/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/-10% endirim/i)).toBeInTheDocument();
  });

  it('updates driver eligibility with warnings in Eligibility tab', () => {
    render(<RentalModal {...defaultProps} />);

    // Switch to Eligibility tab
    fireEvent.click(screen.getByText(/Sürücü Şərtləri & Qaydalar/i));

    const sliders = screen.getAllByRole('slider');
    const ageSlider = sliders[0];
    const expSlider = sliders[1];

    // Set age to 19 and experience to 0
    fireEvent.change(ageSlider, { target: { value: '19' } });
    fireEvent.change(expSlider, { target: { value: '0' } });

    // Switch back to calculator tab to inspect eligibility warning
    fireEvent.click(screen.getByText(/İcarə Kalkulyatoru & Park/i));
    expect(screen.getByText(/Sürücü tələblərə cavab vermir/i)).toBeInTheDocument();
  });

  it('filters stations in Stations tab and allows selecting a pickup station', () => {
    render(<RentalModal {...defaultProps} />);

    // Switch to Stations tab
    fireEvent.click(screen.getByText(/Təhvil Məntəqələri & Radar/i));

    const searchInput = screen.getByPlaceholderText(/Məntəqə və ya şəhər axtarın/i);
    fireEvent.change(searchInput, { target: { value: 'Gəncə' } });

    expect(screen.getByText(/Gəncə Beynəlxalq Hava Limanı/i)).toBeInTheDocument();

    // Select this station
    const selectBtn = screen.getByText(/Təhvil Üçün Seç/i);
    fireEvent.click(selectBtn);

    // Automatically transitions back to calculator tab
    expect(screen.getByText(/İcarə Kalkulyatoru & Park/i)).toBeInTheDocument();
  });

  it('generates a formal contract, handles copy, and verifies contract in registry', () => {
    render(<RentalModal {...defaultProps} />);

    // Switch to Contract tab
    fireEvent.click(screen.getByText(/Rəsmi E-Müqavilə \(CAR-RNT\)/i));

    // Fill driver name
    const nameInput = screen.getByDisplayValue(/Kamran Məmmədov/i);
    fireEvent.change(nameInput, { target: { value: 'Tural Əliyev' } });

    // Click "Müqaviləni Yarat"
    const generateBtn = screen.getByText(/Müqaviləni Yarat/i);
    fireEvent.click(generateBtn);

    // Official contract should be rendered
    expect(screen.getByText(/RƏSMİ ELEKTRON AVTOMOBİL İCARƏ MÜQAVİLƏSİ/i)).toBeInTheDocument();
    expect(screen.getByText(/Tural Əliyev/i)).toBeInTheDocument();

    // Copy contract button
    const copyBtn = screen.getByText(/Nömrəni Kopyala/i);
    fireEvent.click(copyBtn);

    // Print button
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const printBtn = screen.getByText(/Çap Et \/ PDF Yüklə/i);
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    // Test unified registry search
    const searchInput = screen.getByPlaceholderText(/Müqavilə nömrəsini daxil edin/i);
    fireEvent.change(searchInput, { target: { value: 'CAR-RNT-2026-8812' } });

    const verifyBtn = screen.getByRole('button', { name: 'Yoxla' });
    fireEvent.click(verifyBtn);

    expect(screen.getByText(/Müqavilə Reyestrdə Təsdiqləndi!/i)).toBeInTheDocument();
    expect(screen.getByText(/Rəşad Qasımov/i)).toBeInTheDocument();
  });
});
