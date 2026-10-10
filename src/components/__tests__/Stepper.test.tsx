import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Stepper } from '../Stepper';

const mockSteps = [
  { id: 'step1', title: 'Personal Info', description: 'Enter details' },
  { id: 'step2', title: 'Address', description: 'Enter location' },
  { id: 'step3', title: 'Review' },
];

describe('Stepper', () => {
  it('renders all step titles', () => {
    render(<Stepper steps={mockSteps} currentStep={0} />);
    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('renders step descriptions if provided', () => {
    render(<Stepper steps={mockSteps} currentStep={0} />);
    expect(screen.getByText('Enter details')).toBeInTheDocument();
    expect(screen.getByText('Enter location')).toBeInTheDocument();
  });

  it('calls onStepClick with correct index when a step is clicked', () => {
    const handleStepClick = vi.fn();
    render(<Stepper steps={mockSteps} currentStep={0} onStepClick={handleStepClick} />);
    
    // In our component, clicking the circle triggers the click
    const step2Circle = screen.getByLabelText('Step 2: Address');
    fireEvent.click(step2Circle);
    
    expect(handleStepClick).toHaveBeenCalledWith(1);
  });

  it('calls onStepClick on keyboard interaction (Enter)', () => {
    const handleStepClick = vi.fn();
    render(<Stepper steps={mockSteps} currentStep={1} onStepClick={handleStepClick} />);
    
    const step1Circle = screen.getByLabelText('Step 1: Personal Info');
    fireEvent.keyDown(step1Circle, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    expect(handleStepClick).toHaveBeenCalledWith(0);
  });

  it('returns null if steps array is empty', () => {
    const { container } = render(<Stepper steps={[]} currentStep={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies aria-current to the current step', () => {
    render(<Stepper steps={mockSteps} currentStep={1} />);
    
    const step1Circle = screen.getByLabelText('Step 1: Personal Info');
    const step2Circle = screen.getByLabelText('Step 2: Address');
    const step3Circle = screen.getByLabelText('Step 3: Review');

    expect(step1Circle).not.toHaveAttribute('aria-current');
    expect(step2Circle).toHaveAttribute('aria-current', 'step');
    expect(step3Circle).not.toHaveAttribute('aria-current');
  });
});
