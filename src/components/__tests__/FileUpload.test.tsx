import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FileUpload } from '../FileUpload';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('FileUpload Component', () => {
  it('renders correctly', () => {
    const handleFileSelect = vi.fn();
    render(<FileUpload onFileSelect={handleFileSelect} />);
    
    expect(screen.getByText(/Click to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/or drag and drop/i)).toBeInTheDocument();
  });

  it('handles click to upload', async () => {
    const handleFileSelect = vi.fn();
    render(<FileUpload onFileSelect={handleFileSelect} multiple />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');

    await userEvent.upload(input, file);

    expect(handleFileSelect).toHaveBeenCalledTimes(1);
    expect(handleFileSelect).toHaveBeenCalledWith([file]);
    expect(screen.getByText('hello.png')).toBeInTheDocument();
  });

  it('shows error for file exceeding max size', async () => {
    const handleFileSelect = vi.fn();
    render(<FileUpload onFileSelect={handleFileSelect} maxSize={1024} />); // 1KB

    const file = new File([new ArrayBuffer(2048)], 'large.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');

    await userEvent.upload(input, file);

    expect(handleFileSelect).not.toHaveBeenCalled();
    expect(screen.getByTestId('upload-error')).toBeInTheDocument();
    expect(screen.getByTestId('upload-error')).toHaveTextContent(/is too large/i);
  });

  it('removes selected file', async () => {
    const handleFileSelect = vi.fn();
    render(<FileUpload onFileSelect={handleFileSelect} multiple />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');

    await userEvent.upload(input, file);
    expect(screen.getByText('hello.png')).toBeInTheDocument();

    const removeBtn = screen.getByLabelText(/Remove hello.png/i);
    fireEvent.click(removeBtn);

    expect(screen.queryByText('hello.png')).not.toBeInTheDocument();
  });
});
