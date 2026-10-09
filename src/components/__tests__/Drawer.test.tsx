import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Drawer } from '../Drawer';

describe('Drawer', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <Drawer isOpen={false} onClose={() => {}}>
        <div>Drawer Content</div>
      </Drawer>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders content when isOpen is true', () => {
    render(
      <Drawer isOpen={true} onClose={() => {}}>
        <div>Drawer Content</div>
      </Drawer>
    );
    expect(screen.getByText('Drawer Content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Drawer isOpen={true} onClose={() => {}} title="Test Title">
        <div>Drawer Content</div>
      </Drawer>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Drawer isOpen={true} onClose={handleClose} title="Test">
        <div>Content</div>
      </Drawer>
    );
    
    const closeBtn = screen.getByLabelText('Close drawer');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('applies position classes correctly', () => {
    render(
      <Drawer isOpen={true} onClose={() => {}} position="left">
        <div>Left Content</div>
      </Drawer>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('left-0');
  });

  it('applies size classes correctly', () => {
    render(
      <Drawer isOpen={true} onClose={() => {}} position="right" size="lg">
        <div>Large Content</div>
      </Drawer>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('w-96');
  });
});
