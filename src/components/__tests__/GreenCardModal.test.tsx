import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GreenCardModal } from '../GreenCardModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('GreenCardModal Component', () => {
  const mockVehicle = MOCK_VEHICLES[0];
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <GreenCardModal
        isOpen={false}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default tab (calculator) when open', () => {
    render(
      <GreenCardModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    expect(screen.getByTestId('green-card-modal')).toBeInTheDocument();
    expect(screen.getByText('İSB Beynəlxalq Yaşıl Kart & Sərhəd Keçid Portalı')).toBeInTheDocument();
    expect(screen.getByTestId('tab-calculator')).toBeInTheDocument();
    expect(screen.getByTestId('tab-radar')).toBeInTheDocument();
    expect(screen.getByTestId('tab-checklist')).toBeInTheDocument();
    expect(screen.getByTestId('tab-policy')).toBeInTheDocument();
    expect(screen.getByTestId('tab-declaration')).toBeInTheDocument();

    expect(screen.getByTestId('buy-policy-btn')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <GreenCardModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('green-card-modal-close-btn'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all 5 tabs cleanly', () => {
    render(
      <GreenCardModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    // Switch to Radar Tab
    fireEvent.click(screen.getByTestId('tab-radar'));
    expect(screen.getByText('Bütün Keçid Məntəqələri (7)')).toBeInTheDocument();
    expect(screen.getAllByText(/Qırmızı Körpü/i).length).toBeGreaterThan(0);

    // Switch to Checklist Tab
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByText('Sərhəd Keçid Hazırlıq İndeksi')).toBeInTheDocument();
    expect(screen.getByTestId('checklist-item-passport')).toBeInTheDocument();

    // Switch to Policy Tab
    fireEvent.click(screen.getByTestId('tab-policy'));
    expect(screen.getByText(/GREEN CARD \/ CARTE VERTE \/ YAŞIL KART/i)).toBeInTheDocument();

    // Switch to Declaration Tab
    fireEvent.click(screen.getByTestId('tab-declaration'));
    expect(screen.getByText(/Nəqliyyat Vasitəsinin Müvəqqəti Aparılması/i)).toBeInTheDocument();

    // Switch back to Calculator Tab
    fireEvent.click(screen.getByTestId('tab-calculator'));
    expect(screen.getByText('1. Nəqliyyat Vasitəsinin Növü')).toBeInTheDocument();
  });

  it('updates pricing when selecting different vehicle categories and zones', () => {
    render(
      <GreenCardModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    // Initial default: passenger, zone_3_georgia_turkey, 1_month -> 45 AZN
    expect(screen.getAllByText('45 ₼').length).toBeGreaterThan(0);

    // Click on 15_days duration
    const dur15DaysBtn = screen.getByText('15 gün');
    fireEvent.click(dur15DaysBtn);
    expect(screen.getAllByText('25 ₼').length).toBeGreaterThan(0);

    // Select motorcycle category
    const motoBtn = screen.getByText('Motosiklet');
    fireEvent.click(motoBtn);
    expect(screen.getAllByText('13 ₼').length).toBeGreaterThan(0);
  });

  it('filters border checkpoints by country in radar tab', () => {
    render(
      <GreenCardModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-radar'));

    // Filter by Russia
    const russiaFilter = screen.getByRole('button', { name: /Rusiya/i });
    fireEvent.click(russiaFilter);
    expect(screen.getAllByText(/Samur Gömrük Postu/i).length).toBeGreaterThan(0);
    const samurCard = screen.getByText('Samur Gömrük Postu (Yaraq-Qazmalar)');
    fireEvent.click(samurCard);
    expect(screen.queryByText(/Qırmızı Körpü/i)).toBeNull();

    // Filter by Turkey
    const turkeyFilter = screen.getByRole('button', { name: /Türkiyə/i });
    fireEvent.click(turkeyFilter);
    expect(screen.getAllByText(/Sədərək Gömrük Postu/i).length).toBeGreaterThan(0);
  });

  it('toggles checklist items and updates readiness percentage', () => {
    render(
      <GreenCardModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-checklist'));

    const passportItem = screen.getByTestId('checklist-item-passport');
    // Initially checked -> toggle to uncheck
    fireEvent.click(passportItem);

    expect(screen.getByText('Çatışmayan Sənəd Var')).toBeInTheDocument();
    expect(screen.getByText(/Məcburi çatışmayan/i)).toBeInTheDocument();

    // Toggle back
    fireEvent.click(passportItem);
  });

  it('simulates purchasing a policy and switches to the policy tab', () => {
    render(
      <GreenCardModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    // Click buy policy button
    const buyBtn = screen.getByTestId('buy-policy-btn');
    fireEvent.click(buyBtn);

    // Should switch to policy tab and display the certificate
    expect(screen.getByText(/GREEN CARD \/ CARTE VERTE \/ YAŞIL KART/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Council of Bureaux/i).length).toBeGreaterThan(0);
  });

  it('updates and submits DGK customs transit declaration', () => {
    render(
      <GreenCardModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-declaration'));
    const submitBtn = screen.getByTestId('submit-declaration-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/AZƏRBAYCAN RESPUBLİKASI DÖVLƏT GÖMRÜK KOMİTƏSİ/i)).toBeInTheDocument();
    expect(screen.getByText(/Nəqliyyat Vasitəsinin Müvəqqəti Aparılması/i)).toBeInTheDocument();
  });
});
