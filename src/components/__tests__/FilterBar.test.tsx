import '@testing-library/jest-dom/vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FilterBar } from '../FilterBar';
import { DEFAULT_FILTER_STATE } from '../../hooks/useVehicleFilter';
import { FilterState } from '../../types/vehicle';

describe('FilterBar Component', () => {
  const defaultProps = {
    makes: ['Toyota', 'BMW', 'Porsche'],
    models: ['Camry', 'X5'],
    cities: ['Baku', 'Ganja'],
    totalResults: 42,
    lang: 'en' as const,
  };

  const FilterBarWrapper = ({ initialFilters = DEFAULT_FILTER_STATE }: { initialFilters?: FilterState }) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    return <FilterBar {...defaultProps} filters={filters} setFilters={setFilters} />;
  };

  it('renders search input with correct placeholder', () => {
    render(<FilterBarWrapper />);
    const searchInput = screen.getByPlaceholderText(/Search make, model/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('updates search query on typing', () => {
    render(<FilterBarWrapper />);
    const searchInput = screen.getByPlaceholderText(/Search make, model/i) as HTMLInputElement;
    
    fireEvent.change(searchInput, { target: { value: 'BMW' } });
    expect(searchInput.value).toBe('BMW');
  });

  it('renders all make options and handles make selection', () => {
    render(<FilterBarWrapper />);
    
    const makesDropdown = screen.getByText('All makes');
    expect(makesDropdown).toBeInTheDocument();
    
    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    // Select Make
    fireEvent.change(selects[0], { target: { value: 'BMW' } });
    expect(selects[0].value).toBe('BMW');
    
    // Selecting make should clear model
    expect(selects[1].value).toBe('');
  });

  it('disables model dropdown when no make is selected', () => {
    render(<FilterBarWrapper />);
    const selects = screen.getAllByRole('combobox');
    expect(selects[1]).toBeDisabled();
  });

  it('enables model dropdown when make is selected', () => {
    render(<FilterBarWrapper initialFilters={{ ...DEFAULT_FILTER_STATE, make: 'BMW' }} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects[1]).not.toBeDisabled();
  });

  it('toggles great deal filter on click', () => {
    render(<FilterBarWrapper />);
    const greatDealBtn = screen.getByText(/Great deals only/i).closest('button')!;
    
    // Initially not active (doesn't have the active emerald class)
    expect(greatDealBtn.className).not.toContain('text-emerald-400');
    
    fireEvent.click(greatDealBtn);
    
    // Should have active emerald class after click
    expect(greatDealBtn.className).toContain('text-emerald-400');
  });

  it('toggles verified only filter on click', () => {
    render(<FilterBarWrapper />);
    const verifiedBtn = screen.getByText(/Verified only/i).closest('button')!;
    
    expect(verifiedBtn.className).not.toContain('text-blue-400');
    fireEvent.click(verifiedBtn);
    expect(verifiedBtn.className).toContain('text-blue-400');
  });

  it('toggles credit available filter on click', () => {
    render(<FilterBarWrapper />);
    const creditBtn = screen.getByText(/Credit available/i).closest('button')!;
    
    expect(creditBtn.className).not.toContain('text-purple-400');
    fireEvent.click(creditBtn);
    expect(creditBtn.className).toContain('text-purple-400');
  });

  it('handles resetting filters', () => {
    render(<FilterBarWrapper initialFilters={{ ...DEFAULT_FILTER_STATE, searchQuery: 'dirty state' }} />);
    const searchInput = screen.getByPlaceholderText(/Search make, model/i) as HTMLInputElement;
    expect(searchInput.value).toBe('dirty state');

    const resetBtn = screen.getByText(/Reset filters/i).closest('button')!;
    fireEvent.click(resetBtn);
    
    expect(searchInput.value).toBe('');
  });

  it('displays the correct total results count', () => {
    render(<FilterBarWrapper />);
    // Our wrapper uses defaultProps which sets totalResults to 42
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('changes body type on quick selector click', () => {
    render(<FilterBarWrapper />);
    const sedanBtn = screen.getByText('Sedan').closest('button')!;
    
    fireEvent.click(sedanBtn);
    
    // Should have active background color after click
    expect(sedanBtn.className).toContain('bg-blue-600');
  });
});
