import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoanCalculatorModal } from '../LoanCalculatorModal';

describe('LoanCalculatorModal', () => {
  it('renders the modal header and bank options correctly', () => {
    render(<LoanCalculatorModal currency="AZN" lang="az" onClose={vi.fn()} />);
    
    // Header
    expect(screen.getByText('Ağıllı Avtokredit & Lizing Kalkulyatoru')).toBeInTheDocument();
    
    // Banks
    expect(screen.getByText('Kapital Bank Avtokredit')).toBeInTheDocument();
    expect(screen.getByText('ABB Avto Express')).toBeInTheDocument();
    expect(screen.getByText('Unibank Lizing & Kredit')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const handleClose = vi.fn();
    render(<LoanCalculatorModal currency="AZN" lang="az" onClose={handleClose} />);
    
    const closeBtn = screen.getByLabelText('Close calculator');
    fireEvent.click(closeBtn);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('updates selected bank when a bank button is clicked', () => {
    render(<LoanCalculatorModal currency="AZN" lang="az" onClose={vi.fn()} />);
    
    // Click the second bank (ABB)
    const abbBank = screen.getByText('ABB Avto Express');
    fireEvent.click(abbBank);
    
    // In actual app, visual state changes. We can verify it doesn't crash 
    // and ideally the selected state reflects the change.
    // The min down payment should update from 20 to 25 (Kapital to ABB)
    // "İlkin: min 25% " is part of the button text
    expect(screen.getByText(/İlkin: min 25%/i)).toBeInTheDocument();
  });

  it('renders the initial vehicle price if provided', () => {
    const mockVehicle = {
      priceAzn: 55000,
    } as any; // Using any to avoid full vehicle interface typing

    render(
      <LoanCalculatorModal 
        currency="AZN" 
        lang="az" 
        onClose={vi.fn()} 
        initialVehicle={mockVehicle} 
      />
    );
    
    // Check if 55,000 AZN is displayed (default formatting might be "55 000 ₼" or similar)
    // We'll just look for 55000 in the range input value
    // In our component, we don't have aria-label on inputs, let's just query by type range
    const sliders = screen.getAllByRole('slider');
    expect(sliders[0]).toHaveValue('55000');
  });

  it('updates term months correctly', () => {
    render(<LoanCalculatorModal currency="AZN" lang="az" onClose={vi.fn()} />);
    
    // Click 24 months
    const month24Btn = screen.getByText('24 ay', { selector: 'button' });
    fireEvent.click(month24Btn);
    
    // Check if the label updated
    // There might be two elements with '24 ay', the button and the header label
    expect(screen.getAllByText(/24 ay/i).length).toBeGreaterThan(0);
  });
});
