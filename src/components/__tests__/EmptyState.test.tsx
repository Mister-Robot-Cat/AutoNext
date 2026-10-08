import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from '../EmptyState';
import { Search } from 'lucide-react';

describe('EmptyState Component', () => {
  it('renders title and description correctly', () => {
    render(
      <EmptyState
        icon={Search}
        title="No items found"
        description="Try adjusting your filters"
      />
    );

    expect(screen.getByText('No items found')).toBeDefined();
    expect(screen.getByText('Try adjusting your filters')).toBeDefined();
  });

  it('renders action button when actionLabel and onAction are provided', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        icon={Search}
        title="No items found"
        description="Try adjusting your filters"
        actionLabel="Clear Filters"
        onAction={handleAction}
      />
    );

    const button = screen.getByText('Clear Filters');
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button if onAction is missing', () => {
    render(
      <EmptyState
        icon={Search}
        title="No items found"
        description="Try adjusting your filters"
        actionLabel="Clear Filters"
      />
    );

    expect(screen.queryByText('Clear Filters')).toBeNull();
  });
});
