import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CarCard } from '../CarCard';
import { MOCK_VEHICLES } from '../../data/mockVehicles';
import { Language, Currency } from '../../types/vehicle';

describe('CarCard', () => {
  const mockVehicle = MOCK_VEHICLES[0];
  const defaultProps = {
    vehicle: mockVehicle,
    currency: 'AZN' as Currency,
    lang: 'az' as Language,
    isCompared: false,
    onToggleCompare: vi.fn(),
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders vehicle information correctly', () => {
    render(<CarCard {...defaultProps} />);
    
    // Title
    expect(screen.getByText(mockVehicle.title)).toBeInTheDocument();
    
    // Price formatted in AZN
    expect(screen.getByText('68,500 ₼')).toBeInTheDocument();
    
    // Vehicle specs text pattern (Year • Mileage • City)
    expect(screen.getByText(new RegExp(`${mockVehicle.year}`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockVehicle.mileageKm.toLocaleString()))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockVehicle.city))).toBeInTheDocument();
    
    // Seller name
    expect(screen.getByText(mockVehicle.seller.name)).toBeInTheDocument();
  });

  it('renders VIP and Verified badges if vehicle has them', () => {
    const verifiedVipVehicle = { ...mockVehicle, isFeatured: true, isVerified: true };
    render(<CarCard {...defaultProps} vehicle={verifiedVipVehicle} />);
    
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('calls onSelect when the card is clicked', () => {
    render(<CarCard {...defaultProps} />);
    
    const card = screen.getByText(mockVehicle.title).closest('div.group');
    if (card) {
      fireEvent.click(card);
    }
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockVehicle);
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleCompare when the compare button is clicked', () => {
    render(<CarCard {...defaultProps} />);
    
    // The compare button is a button element with title attribute
    const compareButton = screen.getByTitle('Müqayisəyə əlavə et');
    fireEvent.click(compareButton);
    
    expect(defaultProps.onToggleCompare).toHaveBeenCalledWith(mockVehicle);
    
    // Clicking the compare button should stop propagation, so onSelect should not be called
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it('navigates through images when arrows are clicked', () => {
    // Only render if vehicle has multiple images
    const multiImageVehicle = { ...mockVehicle, images: ['image1.jpg', 'image2.jpg'] };
    render(<CarCard {...defaultProps} vehicle={multiImageVehicle} />);
    
    const image = screen.getByAltText(multiImageVehicle.title) as HTMLImageElement;
    expect(image.src).toContain('image1.jpg');
    
    const buttons = screen.getAllByRole('button');
    // Assuming the arrows are among the buttons (previous, next)
    // We can identify them by their position or icon, but let's find the next button
    // It's in the absolute div with ChevronRight
    const nextBtn = buttons[buttons.length - 1]; 
    fireEvent.click(nextBtn);
    
    expect(image.src).toContain('image2.jpg');
    
    const prevBtn = buttons[buttons.length - 2];
    fireEvent.click(prevBtn);
    
    expect(image.src).toContain('image1.jpg');
  });
});
