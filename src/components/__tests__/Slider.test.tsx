import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Slider } from '../Slider';

describe('Slider Component', () => {
  it('renders correctly with default props', () => {
    render(<Slider data-testid="slider" />);
    const slider = screen.getByTestId('slider');
    
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('type', 'range');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
    expect(slider).toHaveAttribute('step', '1');
  });

  it('respects custom min, max, and step props', () => {
    render(<Slider data-testid="slider" min={10} max={50} step={5} />);
    const slider = screen.getByTestId('slider');
    
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '50');
    expect(slider).toHaveAttribute('step', '5');
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<Slider data-testid="slider" value={10} onChange={handleChange} />);
    const slider = screen.getByTestId('slider');
    
    fireEvent.change(slider, { target: { value: '50' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies disabled state correctly', () => {
    render(<Slider data-testid="slider" disabled />);
    const slider = screen.getByTestId('slider');
    
    expect(slider).toBeDisabled();
    expect(slider).toHaveClass('disabled:cursor-not-allowed');
  });

  it('applies custom className', () => {
    render(<Slider data-testid="slider" className="custom-slider" trackClassName="custom-track" />);
    const slider = screen.getByTestId('slider');
    const container = slider.parentElement;
    
    expect(container).toHaveClass('custom-slider');
    expect(slider).toHaveClass('custom-track');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Slider ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
