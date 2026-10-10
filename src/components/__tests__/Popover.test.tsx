import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Popover } from '../Popover';

describe('Popover Component', () => {
  it('does not render content initially', () => {
    render(
      <Popover 
        trigger={<button>Click me</button>} 
        content={<div>Popover content</div>} 
      />
    );
    expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
  });

  it('renders content when trigger is clicked', () => {
    render(
      <Popover 
        trigger={<button>Click me</button>} 
        content={<div>Popover content</div>} 
      />
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('closes when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <Popover 
          trigger={<button>Click me</button>} 
          content={<div>Popover content</div>} 
        />
      </div>
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
  });

  it('applies position classes correctly', () => {
    render(
      <Popover 
        trigger={<button>Click me</button>} 
        content={<div>Popover content</div>} 
        position="top"
      />
    );
    
    fireEvent.click(screen.getByText('Click me'));
    const content = screen.getByTestId('popover-content');
    expect(content.className).toContain('bottom-full');
  });
});
