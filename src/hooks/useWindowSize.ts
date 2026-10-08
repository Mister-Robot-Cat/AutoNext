import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * A custom hook that tracks the window's dimensions.
 * Useful for responsive canvas/SVG elements or programmatic layout adjustments.
 * @returns {WindowSize} The current window width and height.
 */
export function useWindowSize(): WindowSize {
  // Initialize state with undefined width/height so server and client renders match
  // if we were to use SSR, but here we just initialize with current window size.
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}
