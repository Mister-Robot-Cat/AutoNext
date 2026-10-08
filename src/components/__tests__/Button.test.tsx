import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles clicks', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('shows loader and disables button when isLoading is true', () => {
    const { container } = render(<Button isLoading>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders left and right icons', () => {
    render(
      <Button 
        leftIcon={<span data-testid="left-icon">L</span>} 
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        Click me
      </Button>
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    expect(container.firstChild).toHaveClass('bg-red-500/10');
    expect(container.firstChild).toHaveClass('text-red-500');
  });

  it('applies size classes correctly', () => {
    const { container } = render(<Button size="sm">Small</Button>);
    expect(container.firstChild).toHaveClass('h-8');
    expect(container.firstChild).toHaveClass('px-3');
    expect(container.firstChild).toHaveClass('text-xs');
  });
});
