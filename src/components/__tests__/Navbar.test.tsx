import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '../Navbar';
import { Currency, Language, Vehicle } from '../../types/vehicle';

describe('Navbar Component', () => {
  const defaultProps = {
    currency: 'AZN' as Currency,
    setCurrency: vi.fn(),
    lang: 'en' as Language,
    setLang: vi.fn(),
    comparedVehicles: [] as Vehicle[],
    favoritesCount: 0,
    isFavoritesFilterActive: false,
    onToggleFavoritesFilter: vi.fn(),
    onOpenCompare: vi.fn(),
    onOpenCalculator: vi.fn(),
    onOpenAiAdvisor: vi.fn(),
    onOpenCreateListing: vi.fn(),
  };

  it('renders the brand logo and text correctly', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByText('Auto')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('PRO')).toBeInTheDocument();
  });

  it('calls setLang when a language is selected', () => {
    render(<Navbar {...defaultProps} />);
    const azButton = screen.getByText('az');
    fireEvent.click(azButton);
    expect(defaultProps.setLang).toHaveBeenCalledWith('az');
  });

  it('calls setCurrency when a currency is selected', () => {
    render(<Navbar {...defaultProps} />);
    const usdButton = screen.getByText('$');
    fireEvent.click(usdButton);
    expect(defaultProps.setCurrency).toHaveBeenCalledWith('USD');
  });

  it('displays compared vehicles count if there are compared vehicles', () => {
    const mockVehicle = {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      price: 25000,
      currency: 'AZN',
      mileage: 50000,
      engineVolume: 2.5,
      power: 203,
      city: 'Baku',
      views: 100,
      postedAt: '2023-10-01',
      images: ['image1.jpg'],
      isDealer: false,
      hasDamage: false,
      isVerified: true,
      condition: 'Excellent',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      bodyType: 'Sedan',
      color: 'Black'
    } as unknown as Vehicle;

    render(<Navbar {...defaultProps} comparedVehicles={[mockVehicle]} />);
    // Check if the badge "1" is rendered
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays favorites count if there are favorites', () => {
    render(<Navbar {...defaultProps} favoritesCount={3} />);
    // Check if the badge "3" is rendered
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls appropriate callbacks when feature buttons are clicked', () => {
    render(<Navbar {...defaultProps} />);
    
    // Calculator button (en) -> 'Loan Calculator'
    const calculatorBtn = screen.getByText('Loan Calculator');
    fireEvent.click(calculatorBtn);
    expect(defaultProps.onOpenCalculator).toHaveBeenCalled();

    // AI Advisor
    const aiAdvisorBtn = screen.getByText('AI Advisor');
    fireEvent.click(aiAdvisorBtn);
    expect(defaultProps.onOpenAiAdvisor).toHaveBeenCalled();

    // Compare
    const compareBtn = screen.getByText('Compare');
    fireEvent.click(compareBtn);
    expect(defaultProps.onOpenCompare).toHaveBeenCalled();

    // Post Ad (en) -> '+ Post a Car'
    const postAdBtn = screen.getByText('+ Post a Car');
    fireEvent.click(postAdBtn);
    expect(defaultProps.onOpenCreateListing).toHaveBeenCalled();

    // Favorites
    const favoritesBtn = screen.getByText('Seçilmişlər');
    fireEvent.click(favoritesBtn);
    expect(defaultProps.onToggleFavoritesFilter).toHaveBeenCalled();
  });
});
