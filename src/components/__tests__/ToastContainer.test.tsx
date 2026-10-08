import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToastContainer } from '../ToastContainer';
import * as useToastModule from '../../hooks/useToast';

// Mock the useToast hook
vi.mock('../../hooks/useToast', () => ({
  useToast: vi.fn(),
}));

describe('ToastContainer', () => {
  const mockRemoveToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when there are no toasts', () => {
    vi.mocked(useToastModule.useToast).mockReturnValue({
      toasts: [],
      addToast: vi.fn(),
      removeToast: mockRemoveToast,
    });

    const { container } = render(<ToastContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('renders toasts with correct message and type', () => {
    vi.mocked(useToastModule.useToast).mockReturnValue({
      toasts: [
        { id: '1', message: 'Success message', type: 'success' },
        { id: '2', message: 'Error message', type: 'error' },
      ],
      addToast: vi.fn(),
      removeToast: mockRemoveToast,
    });

    render(<ToastContainer />);
    
    expect(screen.getByText('Success message')).toBeDefined();
    expect(screen.getByText('Error message')).toBeDefined();
    
    // Check if close buttons are rendered
    const closeButtons = screen.getAllByLabelText('Close toast');
    expect(closeButtons).toHaveLength(2);
  });

  it('calls removeToast when close button is clicked', () => {
    vi.mocked(useToastModule.useToast).mockReturnValue({
      toasts: [{ id: 'test-1', message: 'Test message', type: 'info' }],
      addToast: vi.fn(),
      removeToast: mockRemoveToast,
    });

    render(<ToastContainer />);
    
    const closeButton = screen.getByLabelText('Close toast');
    fireEvent.click(closeButton);
    
    expect(mockRemoveToast).toHaveBeenCalledWith('test-1');
  });
});
