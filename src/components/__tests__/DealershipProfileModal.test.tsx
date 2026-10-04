import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DealershipProfileModal } from '../DealershipProfileModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('DealershipProfileModal', () => {
  const mockSeller = {
    id: 'sel-2',
    name: 'Toyota Abşeron',
    phone: '+994 50 123 45 67',
    whatsapp: '994501234567',
    type: 'official_dealer' as const,
    rating: 4.9,
    reviewsCount: 342,
    verifiedIdentity: true,
    responseTimeMinutes: 10,
    responseRate: 0.99,
    memberSinceYear: 2018,
    city: 'Bakı'
  };

  it('renders nothing when seller is null', () => {
    const { container } = render(
      <DealershipProfileModal 
        seller={null} 
        currency="AZN" 
        lang="az" 
        onClose={vi.fn()} 
        onSelectVehicle={vi.fn()} 
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders seller details correctly', () => {
    render(
      <DealershipProfileModal 
        seller={mockSeller} 
        currency="AZN" 
        lang="az" 
        onClose={vi.fn()} 
        onSelectVehicle={vi.fn()} 
      />
    );

    expect(screen.getByText('Toyota Abşeron')).toBeInTheDocument();
    expect(screen.getByText('Rəsmi Diler')).toBeInTheDocument();
    expect(screen.getByText('Bakı')).toBeInTheDocument();
    
    // Check if phone link is present
    const callButton = screen.getByText('Zəng Et').closest('a');
    expect(callButton).toHaveAttribute('href', 'tel:+994501234567');
    
    // Check if whatsapp link is present
    const waButton = screen.getByText('WhatsApp').closest('a');
    expect(waButton).toHaveAttribute('href', 'https://wa.me/994501234567');
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <DealershipProfileModal 
        seller={mockSeller} 
        currency="AZN" 
        lang="az" 
        onClose={handleClose} 
        onSelectVehicle={vi.fn()} 
      />
    );

    // Close button (X icon)
    // The X icon doesn't have an aria-label, but it's the only button in the header usually, or we can get it by role
    const closeButtons = screen.getAllByRole('button');
    // The first button should be the close button
    fireEvent.click(closeButtons[0]);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('displays the correct number of active listings', () => {
    // Count how many mock vehicles belong to 's1'
    const dealerVehiclesCount = MOCK_VEHICLES.filter(v => v.seller.id === 'sel-2').length;
    
    render(
      <DealershipProfileModal 
        seller={mockSeller} 
        currency="AZN" 
        lang="az" 
        onClose={vi.fn()} 
        onSelectVehicle={vi.fn()} 
      />
    );

    // "Satışdakı Avtomobilləri" header with a badge containing the count
    expect(screen.getAllByText(dealerVehiclesCount.toString()).length).toBeGreaterThan(0);
  });
});
