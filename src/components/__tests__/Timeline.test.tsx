import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Timeline, TimelineItem } from '../Timeline';

describe('Timeline Component', () => {
  it('renders a list of timeline items', () => {
    render(
      <Timeline>
        <TimelineItem title="Step 1" description="First step" time="10:00 AM" />
        <TimelineItem title="Step 2" description="Second step" time="11:00 AM" />
      </Timeline>
    );

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('First step')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();

    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Second step')).toBeInTheDocument();
    expect(screen.getByText('11:00 AM')).toBeInTheDocument();
  });

  it('applies active styling when isActive is true', () => {
    render(
      <Timeline>
        <TimelineItem title="Active Step" isActive data-testid="active-item" />
        <TimelineItem title="Inactive Step" />
      </Timeline>
    );

    const activeTitle = screen.getByText('Active Step');
    expect(activeTitle).toHaveClass('text-gray-900');

    const inactiveTitle = screen.getByText('Inactive Step');
    expect(inactiveTitle).toHaveClass('text-gray-700');
  });

  it('renders custom icons', () => {
    render(
      <Timeline>
        <TimelineItem title="With Icon" icon={<span data-testid="custom-icon">⭐</span>} />
      </Timeline>
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('hides the connector on the last item', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="Step 1" />
        <TimelineItem title="Step 2" />
      </Timeline>
    );

    const connectors = screen.getAllByTestId('timeline-connector');
    expect(connectors).toHaveLength(1); // Only the first item should have a connector
  });
});
