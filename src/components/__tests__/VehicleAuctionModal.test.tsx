import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VehicleAuctionModal } from '../VehicleAuctionModal';

describe('VehicleAuctionModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <VehicleAuctionModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default live tab when open', () => {
    render(<VehicleAuctionModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Dövlət Əmlakı və Müsadirə Olunmuş Nəqliyyat Hərracı/i)).toBeInTheDocument();
    expect(screen.getByText(/e-herrac\.emlak\.gov\.az/i)).toBeInTheDocument();
    expect(screen.getByText(/Canlı Hərrac Zalı/i)).toBeInTheDocument();
    expect(screen.getByText(/Cari Ən Yüksək Təklif/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<VehicleAuctionModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByTitle('Bağla');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all navigation tabs', () => {
    render(<VehicleAuctionModal isOpen={true} onClose={vi.fn()} />);

    // Catalog tab
    const catalogTabBtn = screen.getByText(/Hərrac Kataloqu/i);
    fireEvent.click(catalogTabBtn);
    expect(screen.getByPlaceholderText(/Marka, model və ya LOT nömrəsi/i)).toBeInTheDocument();

    // Calculator tab
    const calcTabBtn = screen.getByText(/Maliyyə & Beh Hesablayıcısı/i);
    fireEvent.click(calcTabBtn);
    expect(screen.getByText(/Dövlət Hərracı Maliyyə & 5% Beh Kalkulyatoru/i)).toBeInTheDocument();

    // Protocol tab
    const protocolTabBtn = screen.getByText(/Hərrac Qalibi Protokolu/i);
    fireEvent.click(protocolTabBtn);
    expect(screen.getByPlaceholderText(/Məsələn: ƏMLAK-HRC-2026-84912/i)).toBeInTheDocument();

    // Sites tab
    const sitesTabBtn = screen.getByText(/Baxış Meydançaları & Qaydalar/i);
    fireEvent.click(sitesTabBtn);
    expect(screen.getByText(/Rəsmi Baxış Meydançaları və Saxlanma Anbarları/i)).toBeInTheDocument();
  });

  it('allows user to place a quick bid in Live Auction tab', async () => {
    render(<VehicleAuctionModal isOpen={true} onClose={vi.fn()} />);

    // Click on +1 Addım quick bid button
    const quickStepBtn = screen.getByText(/\+1 Addım/i);
    fireEvent.click(quickStepBtn);

    // Check that user is recognized as current highest bidder
    await waitFor(() => {
      expect(screen.getByText(/Ən yüksək təklif sizdədir!/i)).toBeInTheDocument();
    });
  });

  it('filters lots by search input in Catalog tab', () => {
    render(<VehicleAuctionModal isOpen={true} onClose={vi.fn()} />);

    // Switch to catalog
    fireEvent.click(screen.getByText(/Hərrac Kataloqu/i));

    const searchInput = screen.getByPlaceholderText(/Marka, model və ya LOT nömrəsi/i);
    fireEvent.change(searchInput, { target: { value: 'BMW' } });

    expect(screen.getByText(/BMW 530i xDrive M Sport/i)).toBeInTheDocument();
  });

  it('calculates financial figures and switches currency in Calculator tab', () => {
    render(<VehicleAuctionModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText(/Maliyyə & Beh Hesablayıcısı/i));

    // Currency switcher
    const usdBtn = screen.getByText('USD');
    fireEvent.click(usdBtn);

    expect(screen.getAllByText(/\$/).length).toBeGreaterThan(0);
  });

  it('verifies existing protocol number in Protocol tab', () => {
    render(<VehicleAuctionModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText(/Hərrac Qalibi Protokolu/i));

    const searchInput = screen.getByPlaceholderText(/Məsələn: ƏMLAK-HRC-2026-84912/i);
    fireEvent.change(searchInput, { target: { value: 'ƏMLAK-HRC-2026-84912' } });

    const verifyBtn = screen.getByText(/Vahid Bazada Yoxla/i);
    fireEvent.click(verifyBtn);

    expect(screen.getByText(/ELEKTRON HƏRRAC QALİBİ QƏRAR PROTOKOLU/i)).toBeInTheDocument();
    expect(screen.getByText(/Rəşad Namiq oğlu Əliyev/i)).toBeInTheDocument();
    expect(screen.getByText(/6BK94Y2/i)).toBeInTheDocument();
  });

  it('displays physical inspection sites and legal basis cards in Sites tab', () => {
    render(<VehicleAuctionModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByText(/Baxış Meydançaları & Qaydalar/i));

    expect(screen.getByText(/Bakı Mərkəzi Əmlak Meydançası/i)).toBeInTheDocument();
    expect(screen.getByText(/Əmlak Xidməti Zabrat Xüsusi Saxlanma Meydançası/i)).toBeInTheDocument();
    expect(screen.getByText(/Hərrac Qanunvericiliyi və Alıcı Zəmanətləri/i)).toBeInTheDocument();
  });
});
