import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoanAmortizationModal } from '../LoanAmortizationModal';

describe('LoanAmortizationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <LoanAmortizationModal
        isOpen={false}
        onClose={vi.fn()}
        currency="AZN"
        lang="az"
        carPrice={50000}
        downPaymentPercent={20}
        termMonths={36}
        annualInterestRate={14.5}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal header, vehicle details, bank name, and KPI metrics when open', () => {
    render(
      <LoanAmortizationModal
        isOpen={true}
        onClose={vi.fn()}
        currency="AZN"
        lang="az"
        carPrice={60000}
        downPaymentPercent={20}
        termMonths={36}
        annualInterestRate={14}
        bankName="Kapital Bank Avtokredit"
        vehicleTitle="Toyota Camry Hybrid"
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Kredit Amortizasiya Cədvəli & Qrafik')).toBeInTheDocument();
    expect(screen.getByText('Kapital Bank Avtokredit')).toBeInTheDocument();
    expect(screen.getByText(/Toyota Camry Hybrid/)).toBeInTheDocument();

    // Check KPI cards
    expect(screen.getByText('Kredit Məbləği')).toBeInTheDocument();
    expect(screen.getByText('Ümumi Faiz')).toBeInTheDocument();
    expect(screen.getByText('Aylıq Ödəniş')).toBeInTheDocument();
    expect(screen.getByText('Cəmi Ödəniş')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <LoanAmortizationModal
        isOpen={true}
        onClose={handleClose}
        currency="AZN"
        lang="az"
        carPrice={50000}
        downPaymentPercent={20}
        termMonths={36}
        annualInterestRate={14.5}
      />
    );

    const closeBtn = screen.getByLabelText('Close amortization modal');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches between yearly summary matrix and monthly detailed schedule', () => {
    render(
      <LoanAmortizationModal
        isOpen={true}
        onClose={vi.fn()}
        currency="AZN"
        lang="az"
        carPrice={50000}
        downPaymentPercent={20}
        termMonths={24}
        annualInterestRate={12}
      />
    );

    // Initial view is Yearly Matrix
    expect(screen.getByText('İl 1')).toBeInTheDocument();
    expect(screen.getByText('İl 2')).toBeInTheDocument();

    // Switch to Monthly Detailed Schedule
    const monthlyTab = screen.getByText('Aylıq Detallı Cədvəl');
    fireEvent.click(monthlyTab);

    // Check monthly rows
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#12')).toBeInTheDocument();
    expect(screen.getByText('#24')).toBeInTheDocument();

    // Switch back to Yearly Matrix
    const yearlyTab = screen.getByText('İllik Xülasə Matrisi');
    fireEvent.click(yearlyTab);
    expect(screen.getByText('İl 1')).toBeInTheDocument();
  });

  it('filters monthly schedule by selected year', () => {
    render(
      <LoanAmortizationModal
        isOpen={true}
        onClose={vi.fn()}
        currency="AZN"
        lang="az"
        carPrice={50000}
        downPaymentPercent={20}
        termMonths={36}
        annualInterestRate={12}
      />
    );

    // Switch to monthly
    fireEvent.click(screen.getByText('Aylıq Detallı Cədvəl'));

    // Filter by Year 2
    const year2Btn = screen.getByRole('button', { name: 'İl 2' });
    fireEvent.click(year2Btn);

    // Should contain Month #13, but not Month #1 or Month #25
    expect(screen.getByText('#13')).toBeInTheDocument();
    expect(screen.queryByText('#1')).not.toBeInTheDocument();
    expect(screen.queryByText('#25')).not.toBeInTheDocument();

    // Reset to All Years
    const allYearsBtn = screen.getByRole('button', { name: 'Bütün illər' });
    fireEvent.click(allYearsBtn);
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('handles extra monthly payment adjustment and displays savings banner', () => {
    render(
      <LoanAmortizationModal
        isOpen={true}
        onClose={vi.fn()}
        currency="AZN"
        lang="az"
        carPrice={50000}
        downPaymentPercent={20}
        termMonths={36}
        annualInterestRate={15}
      />
    );

    const slider = screen.getByLabelText('Extra monthly payment');
    fireEvent.change(slider, { target: { value: '300' } });

    // Verify savings feedback banner appears
    expect(screen.getByText(/tez bağlanacaq/i)).toBeInTheDocument();
    expect(screen.getByText(/faiz qənaəti/i)).toBeInTheDocument();
  });

  it('handles copying CSV to clipboard', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <LoanAmortizationModal
        isOpen={true}
        onClose={vi.fn()}
        currency="AZN"
        lang="az"
        carPrice={40000}
        downPaymentPercent={25}
        termMonths={12}
        annualInterestRate={10}
      />
    );

    const copyBtn = screen.getByLabelText('Copy CSV');
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
  });

  it('supports English and Russian localization', () => {
    const { rerender } = render(
      <LoanAmortizationModal
        isOpen={true}
        onClose={vi.fn()}
        currency="USD"
        lang="en"
        carPrice={30000}
        downPaymentPercent={20}
        termMonths={24}
        annualInterestRate={9}
      />
    );

    expect(screen.getByText('Loan Amortization Schedule & Matrix')).toBeInTheDocument();
    expect(screen.getByText('Annual Matrix Summary')).toBeInTheDocument();

    rerender(
      <LoanAmortizationModal
        isOpen={true}
        onClose={vi.fn()}
        currency="EUR"
        lang="ru"
        carPrice={30000}
        downPaymentPercent={20}
        termMonths={24}
        annualInterestRate={9}
      />
    );

    expect(screen.getByText('График амортизации автокредита')).toBeInTheDocument();
    expect(screen.getByText('Годовая сводная матрица')).toBeInTheDocument();
  });
});
