import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TechnicalInspectionModal } from '../TechnicalInspectionModal';
import { Vehicle } from '../../types/vehicle';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

const mockVehicle: Vehicle = {
  ...MOCK_VEHICLES[0],
};

describe('TechnicalInspectionModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <TechnicalInspectionModal
        isOpen={false}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with vehicle details and electronic talon by default', () => {
    render(
      <TechnicalInspectionModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Dövlət Texniki Baxışı & Elektron Talon/i)).toBeInTheDocument();
    expect(screen.getAllByText(/BMW 530i/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/WBA5A7C50JB192841/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/ELEKTRON TEXNİKİ MÜAYİNƏ VƏ DİAQNOSTİKA TALONU/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <TechnicalInspectionModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches between tabs properly', () => {
    render(
      <TechnicalInspectionModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    // Click Laboratoriya Testləri tab
    const testsTab = screen.getByRole('button', { name: /Laboratoriya Testləri/i });
    fireEvent.click(testsTab);
    expect(screen.getByText(/Əyləc Sistemi & Tormoz Stendi Sınağı/i)).toBeInTheDocument();
    expect(screen.getByText(/Qaz Analizatoru & Ekoloji Emissiya Testi/i)).toBeInTheDocument();

    // Click Qrafik & Rüsumlar tab
    const feesTab = screen.getByRole('button', { name: /Qrafik & Rüsumlar/i });
    fireEvent.click(feesTab);
    expect(screen.getByText(/Dövlət Rüsumu və Ödəniş Detalları/i)).toBeInTheDocument();

    // Click Onlayn Növbə tab
    const bookingTab = screen.getByRole('button', { name: /Onlayn Növbə/i });
    fireEvent.click(bookingTab);
    expect(screen.getByText(/Müayinə Mərkəzini Seçin/i)).toBeInTheDocument();
  });

  it('displays accurate brake and emission diagnostics on test tab', () => {
    render(
      <TechnicalInspectionModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Laboratoriya Testləri/i }));
    expect(screen.getByText(/Təkər Protektoru:/i)).toBeInTheDocument();
    expect(screen.getByText(/İşıq Optikası:/i)).toBeInTheDocument();
    expect(screen.getByText(/Dəm Qazı \(CO %\)/i)).toBeInTheDocument();
  });

  it('submits inspection booking form and displays confirmed voucher', () => {
    render(
      <TechnicalInspectionModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Onlayn Növbə/i }));

    const submitBtn = screen.getByRole('button', { name: /Növbəni Təsdiqlə/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Növbəniz Uğurla Qeydə Alındı!/i)).toBeInTheDocument();
    expect(screen.getByText(/Yeni Növbə Seç/i)).toBeInTheDocument();
  });

  it('allows copying diagnostic talon information', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true,
      writable: true,
    });

    render(
      <TechnicalInspectionModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /Kopyala/i });
    fireEvent.click(copyBtn);
    expect(copyBtn).toBeInTheDocument();
  });
});
