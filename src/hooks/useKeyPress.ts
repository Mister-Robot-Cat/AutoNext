import { useEffect } from 'react';

/**
 * Custom hook to listen for specific global key presses.
 * 
 * @param targetKey The key to listen for (e.g., 'Escape', 'Enter')
 * @param handler The callback function to execute when the key is pressed
 */
export const useKeyPress = (targetKey: string, handler: (event: KeyboardEvent) => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [targetKey, handler]);
};
