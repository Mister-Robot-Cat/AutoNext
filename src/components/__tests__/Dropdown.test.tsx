import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dropdown } from '../Dropdown';
import { Settings, Trash2 } from 'lucide-react';

describe('Dropdown Component', () => {
  const mockItems = [
    { key: 'edit', label: 'Edit Profile', onClick: vi.fn() },
    { key: 'settings', label: 'Settings', icon: <Settings size={16} />, onClick: vi.fn() },
    { key: 'delete', label: 'Delete Account', variant: 'danger' as const, icon: <Trash2 size={16} />, onClick: vi.fn() },
    { key: 'disabled', label: 'Disabled Option', disabled: true, onClick: vi.fn() },
  ];

  const triggerText = 'Open Menu';
  const triggerElement = <button>{triggerText}</button>;

  it('renders the trigger correctly', () => {
    render(<Dropdown trigger={triggerElement} items={mockItems} />);
    expect(screen.getByText(triggerText)).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the dropdown when trigger is clicked', () => {
    render(<Dropdown trigger={triggerElement} items={mockItems} />);
    
    fireEvent.click(screen.getByText(triggerText));
    
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Delete Account')).toBeInTheDocument();
    expect(screen.getByText('Disabled Option')).toBeInTheDocument();
  });

  it('closes the dropdown when an item is clicked', () => {
    render(<Dropdown trigger={triggerElement} items={mockItems} />);
    
    fireEvent.click(screen.getByText(triggerText));
    fireEvent.click(screen.getByText('Edit Profile'));
    
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(mockItems[0].onClick).toHaveBeenCalled();
  });

  it('does not close or trigger onClick for disabled items', () => {
    render(<Dropdown trigger={triggerElement} items={mockItems} />);
    
    fireEvent.click(screen.getByText(triggerText));
    fireEvent.click(screen.getByText('Disabled Option'));
    
    expect(screen.getByRole('menu')).toBeInTheDocument(); // still open
    expect(mockItems[3].onClick).not.toHaveBeenCalled();
  });

  it('renders icons correctly', () => {
    render(<Dropdown trigger={triggerElement} items={mockItems} />);
    
    fireEvent.click(screen.getByText(triggerText));
    
    expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
    expect(screen.getByTestId('icon-delete')).toBeInTheDocument();
  });

  it('applies danger styling for variant="danger"', () => {
    render(<Dropdown trigger={triggerElement} items={mockItems} />);
    
    fireEvent.click(screen.getByText(triggerText));
    
    const deleteButton = screen.getByText('Delete Account').closest('button');
    expect(deleteButton).toHaveClass('text-red-400');
  });

  it('closes on Escape key press', () => {
    render(<Dropdown trigger={triggerElement} items={mockItems} />);
    
    fireEvent.click(screen.getByText(triggerText));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    fireEvent.keyDown(screen.getByRole('menu').parentElement!, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
