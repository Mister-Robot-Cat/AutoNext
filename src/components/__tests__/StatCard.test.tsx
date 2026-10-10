import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
  it('renders title and value correctly', () => {
    render(<StatCard title="Total Users" value="1,234" />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders upward trend information', () => {
    render(
      <StatCard 
        title="Revenue" 
        value="$10k" 
        trend={{ value: 12, direction: 'up', label: 'vs last month' }} 
      />
    );
    expect(screen.getByText('12%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('renders downward trend information', () => {
    render(
      <StatCard 
        title="Bounce Rate" 
        value="45%" 
        trend={{ value: 5, direction: 'down', label: 'vs last week' }} 
      />
    );
    expect(screen.getByText('5%')).toBeInTheDocument();
    expect(screen.getByText('vs last week')).toBeInTheDocument();
    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  it('renders neutral trend information', () => {
    render(
      <StatCard 
        title="Active Sessions" 
        value="300" 
        trend={{ value: 0, direction: 'neutral', label: 'no change' }} 
      />
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('no change')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
  
  it('renders icon when provided', () => {
    render(
      <StatCard 
        title="Users" 
        value="100" 
        icon={<span data-testid="stat-icon">icon-svg</span>} 
      />
    );
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatCard 
        title="Custom" 
        value="0" 
        className="custom-class-123"
      />
    );
    expect(container.firstChild).toHaveClass('custom-class-123');
  });
});
