import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { Tooltip } from '../Tooltip';
import React from 'react';

describe('Tooltip Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders children correctly', () => {
    render(
      <Tooltip content="Test Tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter after delay', () => {
    render(
      <Tooltip content="Test Tooltip" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    // Initially not visible due to delay
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Test Tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Test Tooltip" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    
    // Show tooltip
    fireEvent.mouseEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Hide tooltip
    fireEvent.mouseLeave(trigger);
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Test Tooltip" delay={200}>
        <button>Focus me</button>
      </Tooltip>
    );

    fireEvent.focus(screen.getByText('Focus me'));
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('applies correct position classes', () => {
    render(
      <Tooltip content="Left Tooltip" position="left" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Hover me'));
    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('right-full');
  });
});
