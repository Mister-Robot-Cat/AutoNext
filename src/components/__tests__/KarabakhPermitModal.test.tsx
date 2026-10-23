import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KarabakhPermitModal } from '../KarabakhPermitModal';

describe('KarabakhPermitModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    initialVehicle: {
      makeModel: 'Toyota Land Cruiser Prado',
      vin: 'JTEBU5JR8M5084921',
      plate: '99-XX-700',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<KarabakhPermitModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default tab (apply) when open', () => {
    render(<KarabakhPermitModal {...defaultProps} />);
    expect(screen.getByText('Yolumuz Qarabağa')).toBeInTheDocument();
    expect(screen.getByText('e-yol.az')).toBeInTheDocument();
    expect(screen.getByText('E-İcazə Müraciəti')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<KarabakhPermitModal {...defaultProps} />);
    const closeBtn = screen.getByLabelText('Bağla');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all navigation tabs cleanly', () => {
    render(<KarabakhPermitModal {...defaultProps} />);

    // Click checkpoints tab
    const cpBtn = screen.getByText('NBM Radarı & Postlar');
    fireEvent.click(cpBtn);
    expect(screen.getByPlaceholderText(/Post və ya dəhliz adı/i)).toBeInTheDocument();

    // Click ANAMA tab
    const anamaBtn = screen.getByText('ANAMA Mina Təhlükəsizliyi');
    fireEvent.click(anamaBtn);
    expect(screen.getByText(/ANAMA Qaynar Xətti: 805/i)).toBeInTheDocument();

    // Click registry tab
    const regBtn = screen.getByText('İcazələr Reyestri');
    fireEvent.click(regBtn);
    expect(screen.getByPlaceholderText(/İcazə nömrəsi, DQN/i)).toBeInTheDocument();

    // Click permit view tab
    const viewBtn = screen.getByText('Rəsmi Giriş İcazəsi (Vauçer)');
    fireEvent.click(viewBtn);
    expect(screen.getByText(/RƏSMİ ELEKTRON SƏYAHƏT VƏ GİRİŞ İCAZƏSİ/i)).toBeInTheDocument();
  });

  it('allows selecting a different destination and updates corridor information', () => {
    render(<KarabakhPermitModal {...defaultProps} />);
    const lachinBtn = screen.getByText('Laçın Şəhəri & Zabux');
    fireEvent.click(lachinBtn);
    expect(screen.getByText(/Laçın Şəhəri & Zabux/i)).toBeInTheDocument();
  });

  it('adds and removes a passenger', () => {
    render(<KarabakhPermitModal {...defaultProps} />);
    const nameInput = screen.getByPlaceholderText('Sərnişinin adı və soyadı');
    const finInput = screen.getByPlaceholderText('7-rəqəmli FİN');
    const addBtn = screen.getByText('Əlavə et');

    fireEvent.change(nameInput, { target: { value: 'Tural Məmmədov' } });
    fireEvent.change(finInput, { target: { value: '7K1L2M3' } });
    fireEvent.click(addBtn);

    expect(screen.getByText('Tural Məmmədov')).toBeInTheDocument();
    expect(screen.getByText('FİN: 7K1L2M3')).toBeInTheDocument();

    // Remove passenger
    const removeBtns = screen.getAllByLabelText('Sil');
    fireEvent.click(removeBtns[removeBtns.length - 1]);
    expect(screen.queryByText('Tural Məmmədov')).not.toBeInTheDocument();
  });

  it('toggles ANAMA safety agreement and enables/disables permit submission', () => {
    render(<KarabakhPermitModal {...defaultProps} />);
    const submitBtn = screen.getByRole('button', { name: /Rəsmi E-İcazəni Təsdiqlə & Al/i });
    expect(submitBtn).not.toBeDisabled();

    // Toggle off ANAMA agreement
    const agreementCheckbox = screen.getByText(/ANAMA Mina Təhlükəsizliyi Qaydalarını Oxudum/i);
    fireEvent.click(agreementCheckbox);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/ANAMA Mina Təhlükəsizliyi Qaydaları təlimatı/i)).toBeInTheDocument();

    // Toggle back on
    fireEvent.click(agreementCheckbox);
    expect(submitBtn).not.toBeDisabled();
  });

  it('generates a new permit upon clicking submit and transitions to voucher tab', () => {
    render(<KarabakhPermitModal {...defaultProps} />);
    const submitBtn = screen.getByText('Rəsmi E-İcazəni Təsdiqlə & Al');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/RƏSMİ ELEKTRON SƏYAHƏT VƏ GİRİŞ İCAZƏSİ/i)).toBeInTheDocument();
    expect(screen.getByText(/QARABAG-EYOL-2026-/i)).toBeInTheDocument();
  });

  it('copies permit code and triggers simulation check in permit view', () => {
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<KarabakhPermitModal {...defaultProps} />);
    // Switch to voucher tab
    const viewBtn = screen.getByText('Rəsmi Giriş İcazəsi (Vauçer)');
    fireEvent.click(viewBtn);

    const copyBtn = screen.getByText('İcazə Kodunu Kopyala');
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const simBtn = screen.getByText('NBM Skan Yoxlanışı (Simulyasiya)');
    fireEvent.click(simBtn);
    expect(screen.getByText(/KEÇİDƏ İCAZƏ VERİLDİ/i)).toBeInTheDocument();
  });

  it('filters checkpoints and registry correctly', () => {
    render(<KarabakhPermitModal {...defaultProps} />);

    // Checkpoints tab
    fireEvent.click(screen.getByText('NBM Radarı & Postlar'));
    const cpSearchInput = screen.getByPlaceholderText(/Post və ya dəhliz adı/i);
    fireEvent.change(cpSearchInput, { target: { value: 'Murovdağ' } });
    expect(screen.getByText(/Toğanalı–Kəlbəcər NBM/i)).toBeInTheDocument();

    // Registry tab
    fireEvent.click(screen.getByText('İcazələr Reyestri'));
    const regSearchInput = screen.getByPlaceholderText(/İcazə nömrəsi, DQN/i);
    fireEvent.change(regSearchInput, { target: { value: '99-AA-026' } });
    expect(screen.getByText('99-AA-026')).toBeInTheDocument();
  });
});
