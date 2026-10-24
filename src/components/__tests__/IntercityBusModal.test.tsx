import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntercityBusModal } from '../IntercityBusModal';

describe('IntercityBusModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default routes tab when open', () => {
    render(<IntercityBusModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/AYNA & BBIQ Şəhərlərarası Sərnişin Daşımaları Portalı/i)).toBeInTheDocument();
    expect(screen.getByTestId('routes-tab-content')).toBeInTheDocument();
    expect(screen.getByTestId('route-search-input')).toBeInTheDocument();
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(<IntercityBusModal isOpen={false} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    render(<IntercityBusModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByTestId('intercity-bus-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('filters routes when typing in search input', () => {
    render(<IntercityBusModal isOpen={true} onClose={mockOnClose} />);

    const searchInput = screen.getByTestId('route-search-input');
    fireEvent.change(searchInput, { target: { value: 'Şuşa' } });

    expect(screen.getByText(/Zəfər Yolu Sərnişin/i)).toBeInTheDocument();
    expect(screen.queryByText(/BakuBus Ekspres/i)).not.toBeInTheDocument();
  });

  it('switches between all 6 tabs cleanly', () => {
    render(<IntercityBusModal isOpen={true} onClose={mockOnClose} />);

    // Calculator tab
    fireEvent.click(screen.getByTestId('tab-calculator'));
    expect(screen.getByTestId('calculator-tab-content')).toBeInTheDocument();

    // Seats tab
    fireEvent.click(screen.getByTestId('tab-seats'));
    expect(screen.getByTestId('seats-tab-content')).toBeInTheDocument();

    // Standards tab
    fireEvent.click(screen.getByTestId('tab-standards'));
    expect(screen.getByTestId('standards-tab-content')).toBeInTheDocument();

    // Ticket tab
    fireEvent.click(screen.getByTestId('tab-ticket'));
    expect(screen.getByTestId('ticket-tab-content')).toBeInTheDocument();

    // Registry tab
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByTestId('registry-tab-content')).toBeInTheDocument();

    // Back to routes
    fireEvent.click(screen.getByTestId('tab-routes'));
    expect(screen.getByTestId('routes-tab-content')).toBeInTheDocument();
  });

  it('selects a route from the routes tab and navigates to calculator', () => {
    render(<IntercityBusModal isOpen={true} onClose={mockOnClose} />);

    const selectRouteBtn = screen.getByTestId('select-route-btn-route-baku-sheki');
    fireEvent.click(selectRouteBtn);

    expect(screen.getByTestId('calculator-tab-content')).toBeInTheDocument();
    expect(screen.getAllByText(/Şəki/i).length).toBeGreaterThan(0);
  });

  it('interacts with calculator and proceeds to seats tab', () => {
    render(<IntercityBusModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-calculator'));
    expect(screen.getByTestId('proceed-to-seats-btn')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('proceed-to-seats-btn'));
    expect(screen.getByTestId('seats-tab-content')).toBeInTheDocument();
  });

  it('selects a seat, fills passenger details, and issues a new ticket', () => {
    render(<IntercityBusModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-seats'));

    // Choose seat button if available
    const seatBtn = screen.getByTestId('seat-btn-1');
    fireEvent.click(seatBtn);

    // Update passenger fields
    const nameInput = screen.getByTestId('passenger-name-input');
    fireEvent.change(nameInput, { target: { value: 'Nicat Babayev' } });

    const finInput = screen.getByTestId('passenger-fin-input');
    fireEvent.change(finInput, { target: { value: '9K4T2P1' } });

    const issueBtn = screen.getByTestId('issue-ticket-btn');
    fireEvent.click(issueBtn);

    // Should transition to ticket tab
    expect(screen.getByTestId('ticket-tab-content')).toBeInTheDocument();
    expect(screen.getByText('Nicat Babayev')).toBeInTheDocument();
    expect(screen.getByText('9K4T2P1')).toBeInTheDocument();
  });

  it('handles copy and print ticket actions in ticket tab', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<IntercityBusModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-ticket'));

    const printBtn = screen.getByTestId('print-ticket-btn');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    const copyBtn = screen.getByTestId('copy-ticket-btn');
    fireEvent.click(copyBtn);
    expect(screen.getByText(/Kopyalandı/i)).toBeInTheDocument();

    printSpy.mockRestore();
  });

  it('searches and filters tickets in the unified registry tab', () => {
    render(<IntercityBusModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByTestId('registry-tab-content')).toBeInTheDocument();

    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: 'Nigar' } });

    expect(screen.getByText(/Nigar Rüstəmova/i)).toBeInTheDocument();
    expect(screen.queryByText(/Rauf Həsənov/i)).not.toBeInTheDocument();
  });
});
