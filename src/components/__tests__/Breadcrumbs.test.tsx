import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Breadcrumbs } from '../Breadcrumbs';
import { Settings } from 'lucide-react';

describe('Breadcrumbs', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Vehicles', href: '/vehicles' },
    { label: 'Toyota Camry' },
  ];

  it('renders correctly with items', () => {
    render(<Breadcrumbs items={items} />);
    
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
  });

  it('renders null when items are empty', () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders links for items with href that are not the last item', () => {
    render(<Breadcrumbs items={items} />);
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/');
    expect(links[1]).toHaveAttribute('href', '/vehicles');
  });

  it('renders the last item as plain text with aria-current="page"', () => {
    render(<Breadcrumbs items={items} />);
    
    const lastItem = screen.getByText('Toyota Camry').closest('span');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  it('supports custom separators', () => {
    render(<Breadcrumbs items={items} separator={<span data-testid="custom-sep">/</span>} />);
    
    expect(screen.getAllByTestId('custom-sep')).toHaveLength(2);
  });

  it('renders custom icon if provided', () => {
    const customItems = [
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Profile' },
    ];
    
    const { container } = render(<Breadcrumbs items={customItems} homeIcon={false} />);
    
    // Lucide icons render as svg. Settings icon should be present.
    const svgs = container.querySelectorAll('svg');
    // 1 custom icon + 1 chevron separator = 2 SVGs
    expect(svgs.length).toBe(2);
  });
});
