import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to throttle a value.
 * The value will only update at most once every `delay` milliseconds.
 * 
 * @param value The value to throttle
 * @param delay The throttle delay in milliseconds
 * @returns The throttled value
 */
export function useThrottle<T>(value: T, delay: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const timeSinceLastExecution = Date.now() - lastExecuted.current;
    
    if (timeSinceLastExecution >= delay) {
      setThrottledValue(value);
      lastExecuted.current = Date.now();
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastExecuted.current = Date.now();
      }, delay - timeSinceLastExecution);
      
      return () => clearTimeout(timeoutId);
    }
  }, [value, delay]);

  return throttledValue;
}
