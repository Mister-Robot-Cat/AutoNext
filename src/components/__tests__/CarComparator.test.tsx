import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CarComparator } from '../CarComparator';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('CarComparator Component', () => {
  const defaultProps = {
    vehicles: MOCK_VEHICLES.slice(0, 2),
    currency: 'AZN' as const,
    lang: 'az' as const,
    onRemoveVehicle: vi.fn(),
    onClose: vi.fn(),
    onSelectVehicle: vi.fn(),
  };

  it('renders null if no vehicles are provided', () => {
    const { container } = render(<CarComparator {...defaultProps} vehicles={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly with vehicles', () => {
    render(<CarComparator {...defaultProps} />);
    expect(screen.getByText('Avtomobillərin Canlı Müqayisəsi')).toBeInTheDocument();
    
    // Check if both vehicle titles are rendered
    expect(screen.getByText(defaultProps.vehicles[0].title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.vehicles[1].title)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<CarComparator {...defaultProps} />);
    
    // There are multiple buttons, the main close button is the one in the header.
    // It is the first button rendered.
    const closeButtons = screen.getAllByRole('button');
    fireEvent.click(closeButtons[0]);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onRemoveVehicle when a vehicle remove button is clicked', () => {
    render(<CarComparator {...defaultProps} />);
    const removeButtons = screen.getAllByTitle('Müqayisədən çıxar');
    
    expect(removeButtons).toHaveLength(2);
    fireEvent.click(removeButtons[0]);
    expect(defaultProps.onRemoveVehicle).toHaveBeenCalledWith(defaultProps.vehicles[0].id);
  });

  it('calls onSelectVehicle and onClose when "Baxış keçir" is clicked', () => {
    render(<CarComparator {...defaultProps} />);
    const selectButtons = screen.getAllByText('Baxış keçir');
    
    expect(selectButtons).toHaveLength(2);
    fireEvent.click(selectButtons[0]);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(defaultProps.onSelectVehicle).toHaveBeenCalledWith(defaultProps.vehicles[0]);
  });
});
