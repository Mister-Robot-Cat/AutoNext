import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is idle.
 * Tracks mouse, keyboard, and touch events to determine activity.
 * 
 * @param timeoutMs The time in milliseconds before the user is considered idle.
 * @returns A boolean indicating if the user is idle.
 */
export function useIdle(timeoutMs: number = 3000): boolean {
  const [isIdle, setIsIdle] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsIdle(true), timeoutMs);
    };

    // Initialize the timeout
    timeoutId = setTimeout(() => setIsIdle(true), timeoutMs);

    const events = [
      'mousemove',
      'mousedown',
      'resize',
      'keydown',
      'touchstart',
      'wheel',
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [timeoutMs]);

  return isIdle;
}
