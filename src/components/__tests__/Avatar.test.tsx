import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders an image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User Avatar" />);
    const image = screen.getByTestId('avatar-image');
    expect(image).toBeDefined();
    expect(image.getAttribute('src')).toBe('https://example.com/avatar.jpg');
    expect(image.getAttribute('alt')).toBe('User Avatar');
  });

  it('renders initials when src is not provided but initials are', () => {
    render(<Avatar initials="JD" />);
    const initials = screen.getByTestId('avatar-initials');
    expect(initials.textContent).toBe('JD');
  });

  it('renders an icon when neither src nor initials are provided', () => {
    render(<Avatar />);
    const icon = screen.getByTestId('avatar-icon');
    expect(icon).toBeDefined();
  });

  it('falls back to initials on image error', () => {
    render(<Avatar src="https://example.com/broken.jpg" initials="AB" />);
    const image = screen.getByTestId('avatar-image');
    
    fireEvent.error(image);
    
    expect(screen.queryByTestId('avatar-image')).toBeNull();
    const initials = screen.getByTestId('avatar-initials');
    expect(initials.textContent).toBe('AB');
  });

  it('falls back to icon on image error when no initials provided', () => {
    render(<Avatar src="https://example.com/broken.jpg" />);
    const image = screen.getByTestId('avatar-image');
    
    fireEvent.error(image);
    
    expect(screen.queryByTestId('avatar-image')).toBeNull();
    const icon = screen.getByTestId('avatar-icon');
    expect(icon).toBeDefined();
  });

  it('applies custom size classes correctly', () => {
    render(<Avatar size="lg" />);
    const container = screen.getByTestId('avatar-container');
    expect(container.className).toContain('w-12');
    expect(container.className).toContain('h-12');
  });
});
