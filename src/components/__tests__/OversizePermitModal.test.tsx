import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OversizePermitModal } from '../OversizePermitModal';

describe('OversizePermitModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
    initialPlate: '99-JH-840',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<OversizePermitModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default tab (audit) when open', () => {
    render(<OversizePermitModal {...defaultProps} />);

    expect(
      screen.getByText(/AAYDA & BDYP İriqabaritli və Ağırçəkili Yük İcazəsi/i)
    ).toBeInTheDocument();
    expect(screen.getByText('NK Qərar № 104')).toBeInTheDocument();
    expect(screen.getByText(/Nəqliyyat və Yük Parametrləri/i)).toBeInTheDocument();
    expect(screen.getByText(/Caterpillar 336 Ekskavator Lowbed Platformada/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<OversizePermitModal {...defaultProps} />);

    const closeBtns = screen.getAllByRole('button', { name: /bağla/i });
    fireEvent.click(closeBtns[0]);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all navigation tabs', () => {
    render(<OversizePermitModal {...defaultProps} />);

    // 1. Corridors tab
    const corridorsTabBtn = screen.getByRole('button', { name: /Magistral & Körpülər/i });
    fireEvent.click(corridorsTabBtn);
    expect(
      screen.getByText(/Azərbaycan Magistral Tranzit Dəhlizləri və Körpü Qabaritləri/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/M-1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/M-2/i).length).toBeGreaterThan(0);

    // 2. Escort tab
    const escortTabBtn = screen.getByRole('button', { name: /Müşayiət \(Pilot\/DYP\)/i });
    fireEvent.click(escortTabBtn);
    expect(screen.getByText(/Tələb Olunan Müşayiət Rejimi/i)).toBeInTheDocument();
    expect(screen.getByText(/Hərəkət Zaman Rejimi & Pəncərəsi/i)).toBeInTheDocument();

    // 3. Voucher tab
    const voucherTabBtn = screen.getByRole('button', { name: /Xüsusi İcazə Sənədi/i });
    fireEvent.click(voucherTabBtn);
    expect(
      screen.getByText(/Elektron Xüsusi Marşrut İcazəsi/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/RƏSMİ ELEKTRON İCAZƏ VƏRƏQƏSİ/i)).toBeInTheDocument();

    // 4. Registry tab
    const registryTabBtn = screen.getByRole('button', { name: /Vahid Reyestr/i });
    fireEvent.click(registryTabBtn);
    expect(
      screen.getByText(/AAYDA İriqabaritli Nəqliyyat İcazələri Reyestri/i)
    ).toBeInTheDocument();
  });

  it('applies standard container preset and updates intermodal status', () => {
    render(<OversizePermitModal {...defaultProps} />);

    const containerPresetBtn = screen.getByRole('button', {
      name: /Standart 40-Futluq ISO Konteyner/i,
    });
    fireEvent.click(containerPresetBtn);

    const intermodalCheckbox = screen.getByRole('checkbox', {
      name: /İntermodal ISO Konteyner/i,
    });
    expect(intermodalCheckbox).toBeChecked();
  });

  it('generates new voucher and transitions to voucher tab when button clicked', () => {
    render(<OversizePermitModal {...defaultProps} />);

    const issueBtn = screen.getByRole('button', {
      name: /Elektron Xüsusi İcazə Vərəqəsi Yarat/i,
    });
    fireEvent.click(issueBtn);

    expect(screen.getByText(/RƏSMİ ELEKTRON İCAZƏ VƏRƏQƏSİ/i)).toBeInTheDocument();
    expect(screen.getByText(/● QÜVVƏDƏDİR/i)).toBeInTheDocument();
  });

  it('copies voucher code and triggers print in voucher tab', () => {
    const originalPrint = window.print;
    window.print = vi.fn();

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<OversizePermitModal {...defaultProps} />);

    const voucherTabBtn = screen.getByRole('button', { name: /Xüsusi İcazə Sənədi/i });
    fireEvent.click(voucherTabBtn);

    const copyBtn = screen.getByRole('button', { name: /Kodu Kopyala/i });
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);

    window.print = originalPrint;
  });

  it('filters active registry permits by search query', () => {
    render(<OversizePermitModal {...defaultProps} />);

    const registryTabBtn = screen.getByRole('button', { name: /Vahid Reyestr/i });
    fireEvent.click(registryTabBtn);

    const searchInput = screen.getByPlaceholderText(/Qeydiyyat nişanı və ya nömrə.../i);
    fireEvent.change(searchInput, { target: { value: '99-JH-840' } });

    expect(screen.getByText('AAYDA-OVS-2026-10492')).toBeInTheDocument();
    expect(screen.queryByText('AAYDA-OVS-2026-28419')).not.toBeInTheDocument();
  });
});
