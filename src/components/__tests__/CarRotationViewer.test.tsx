import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { CarRotationViewer } from '../CarRotationViewer';
import { Vehicle } from '../../types/vehicle';

const mockVehicle = {
  id: '1',
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  priceAzn: 50000,
  images: [
    'img1.jpg',
    'img2.jpg',
    'img3.jpg',
    'img4.jpg',
    'img5.jpg',
    'img6.jpg',
    'img7.jpg',
    'img8.jpg',
  ]
} as unknown as Vehicle;

describe('CarRotationViewer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders the viewer with initial state correctly', () => {
    render(<CarRotationViewer vehicle={mockVehicle} />);

    // Initial angle is 0
    expect(screen.getByText('0°')).toBeInTheDocument();
    
    // Check if Play button is rendered
    expect(screen.getByText('Avto Fırlat')).toBeInTheDocument();
    
    // Check if initial image is rendered
    const img = screen.getByAltText(/360 view angle 0°/i);
    expect(img).toHaveAttribute('src', 'img1.jpg');
    
    // Check frame counter
    expect(screen.getByText('1 / 8 bucaq')).toBeInTheDocument();
  });

  it('toggles playback and changes frames over time', () => {
    render(<CarRotationViewer vehicle={mockVehicle} />);

    const playBtn = screen.getByText('Avto Fırlat');
    fireEvent.click(playBtn);

    // After click, it should show Pause
    expect(screen.getByText('Dayandır')).toBeInTheDocument();

    // Fast-forward 400ms (interval duration)
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Angle should change to 45° for 8 frames
    expect(screen.getByText('45°')).toBeInTheDocument();
    
    // Fast-forward another 400ms
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByText('90°')).toBeInTheDocument();

    // Pause
    const pauseBtn = screen.getByText('Dayandır');
    fireEvent.click(pauseBtn);

    // Fast-forward again, frame should not change
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByText('90°')).toBeInTheDocument();
  });

  it('updates frame when slider is changed', () => {
    render(<CarRotationViewer vehicle={mockVehicle} />);

    const slider = screen.getByRole('slider');
    
    // Change slider to frame 4
    fireEvent.change(slider, { target: { value: '4' } });

    // 4 / 8 frames -> 180°
    expect(screen.getByText('180°')).toBeInTheDocument();
    expect(screen.getByText('5 / 8 bucaq')).toBeInTheDocument();
  });

  it('renders hotspots and shows popup when clicked', () => {
    const { container } = render(<CarRotationViewer vehicle={mockVehicle} />);

    // In default mock, frame 0 has a hotspot
    // At index 0, there is a hotspot button with Sparkles icon
    // Using simple approach to click the first button within the absolute positioned hotspot wrapper
    
    const hotspotBtn = container.querySelector('.absolute.z-10 button');
    if (hotspotBtn) {
      fireEvent.click(hotspotBtn);
    }

    // Check if popup shows up
    expect(screen.getByText('İntellektual LED Fənərlər')).toBeInTheDocument();
    expect(screen.getByText('Avtomatik uzaqvuran işıqlar və adaptiv döngə işıqlandırması.')).toBeInTheDocument();

    // Click close button in popup
    const closeBtn = screen.getByText('✕');
    fireEvent.click(closeBtn);

    // Popup should be closed
    expect(screen.queryByText('İntellektual LED Fənərlər')).not.toBeInTheDocument();
  });
});
