import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdrComplianceModal } from '../AdrComplianceModal';

describe('AdrComplianceModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
    initialPlate: '99-JH-120',
    initialVehicleModel: 'Mercedes-Benz Actros 1845 ADR (FL)',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<AdrComplianceModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, vehicle plate, and default Kemler plate tab when open', () => {
    render(<AdrComplianceModal {...defaultProps} />);

    expect(
      screen.getByText(/FHN & BDYP ADR Təhlükəli Yüklərin Daşınması Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByText('99-JH-120')).toBeInTheDocument();
    expect(screen.getByText('Mercedes-Benz Actros 1845 ADR (FL)')).toBeInTheDocument();
    expect(
      screen.getByText(/1\. BMT Maddəsi & Narıncı Kemler Lövhəsi/i)
    ).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<AdrComplianceModal {...defaultProps} />);

    const closeBtn = screen.getByRole('button', { name: /bağla/i });
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 4 navigation tabs', () => {
    render(<AdrComplianceModal {...defaultProps} />);

    // 1. Equipment Tab
    const equipmentTabBtn = screen.getByRole('button', {
      name: /2\. Sistern & Təchizat/i,
    });
    fireEvent.click(equipmentTabBtn);
    expect(
      screen.getByText(/Nəqliyyat Kateqoriyası & Texniki Standartlar/i)
    ).toBeInTheDocument();

    // 2. Corridor & Permit Tab
    const corridorTabBtn = screen.getByRole('button', {
      name: /3\. Tranzit Marşrut & FHN E-İcazə/i,
    });
    fireEvent.click(corridorTabBtn);
    expect(
      screen.getByText(/Azərbaycan Magistral Tranzit Dəhlizləri/i)
    ).toBeInTheDocument();

    // 3. Certificate & Registry Tab
    const certTabBtn = screen.getByRole('button', {
      name: /4\. Rəsmi "Xüsusi İcazə" & Reyestr/i,
    });
    fireEvent.click(certTabBtn);
    expect(
      screen.getByText(/TƏHLÜKƏLİ YÜKLƏRİN DAŞINMASINA XÜSUSİ İCAZƏ VƏRƏQƏSİ/i)
    ).toBeInTheDocument();

    // Return to Kemler Tab
    const kemlerTabBtn = screen.getByRole('button', {
      name: /1\. BMT Maddəsi & Narıncı Kemler Lövhəsi/i,
    });
    fireEvent.click(kemlerTabBtn);
    expect(
      screen.getByText(/Daşınan Təhlükəli Yükün \(BMT \/ UN\) Seçimi/i)
    ).toBeInTheDocument();
  });

  it('changes selected substance and updates Kemler display', () => {
    render(<AdrComplianceModal {...defaultProps} />);

    const select = screen.getByRole('combobox');
    // Change to Diesel (UN 1202)
    fireEvent.change(select, { target: { value: '1202' } });

    expect(screen.getByText(/Dizel Yanacağı/i)).toBeInTheDocument();
  });

  it('toggles equipment checklist and triggers full auto-complete in equipment tab', () => {
    render(<AdrComplianceModal {...defaultProps} />);

    // Switch to Equipment tab
    const equipmentTabBtn = screen.getByRole('button', {
      name: /2\. Sistern & Təchizat/i,
    });
    fireEvent.click(equipmentTabBtn);

    // Click auto-complete button
    const completeBtn = screen.getByText(/Hamısını təmin et \(100%\)/i);
    fireEvent.click(completeBtn);

    expect(screen.getByText(/100 \/ 100/i)).toBeInTheDocument();
  });

  it('submits permit form, creates new permit, and copies permit code', () => {
    render(<AdrComplianceModal {...defaultProps} />);

    // Switch to Corridor tab
    const corridorTabBtn = screen.getByRole('button', {
      name: /3\. Tranzit Marşrut & FHN E-İcazə/i,
    });
    fireEvent.click(corridorTabBtn);

    // Submit form
    const submitBtn = screen.getByRole('button', {
      name: /FHN E-İcazə Sertifikatını Təsdiqlə və Çap Et/i,
    });
    fireEvent.click(submitBtn);

    // Should switch to Certificate tab automatically
    expect(
      screen.getByText(/TƏHLÜKƏLİ YÜKLƏRİN DAŞINMASINA XÜSUSİ İCAZƏ VƏRƏQƏSİ/i)
    ).toBeInTheDocument();

    // Check copy button
    const copyBtn = screen.getByRole('button', { name: /İcazə Nömrəsini Kopyala/i });
    fireEvent.click(copyBtn);
    expect(screen.getByText(/Kopyalandı!/i)).toBeInTheDocument();
  });
});
