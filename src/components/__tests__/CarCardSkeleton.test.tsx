import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CarCardSkeleton } from '../CarCardSkeleton';

describe('CarCardSkeleton Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<CarCardSkeleton />);
    
    // Check if the main wrapper with animate-pulse exists
    const skeletonWrapper = container.firstChild as HTMLElement;
    expect(skeletonWrapper).toBeInTheDocument();
    expect(skeletonWrapper.className).toContain('animate-pulse');
  });

  it('contains the correct structural placeholder elements', () => {
    const { container } = render(<CarCardSkeleton />);
    
    // Check for the image gallery skeleton
    const imageSkeleton = container.querySelector('.aspect-\\[16\\/10\\]');
    expect(imageSkeleton).toBeInTheDocument();

    // Check for the price skeleton
    const priceSkeleton = container.querySelector('.h-6.w-24');
    expect(priceSkeleton).toBeInTheDocument();

    // Check for the quick specs grid
    const gridElements = container.querySelectorAll('.grid.grid-cols-2 > div');
    expect(gridElements.length).toBe(2);
    
    // Check for footer elements
    const footerElements = container.querySelectorAll('.mt-4.pt-2');
    expect(footerElements.length).toBe(1);
  });
});
