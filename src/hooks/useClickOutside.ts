import { useEffect, useRef } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

/**
 * Hook that handles outside click events for a given ref.
 * Useful for closing modals, dropdowns, or tooltips when clicking outside of them.
 * 
 * @param handler - The callback function to be executed on outside click
 * @param active - Optional boolean to enable/disable the event listeners (defaults to true)
 * @returns A ref object to attach to the target element
 */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  handler: Handler,
  active: boolean = true
) {
  const ref = useRef<T>(null);
  const handlerRef = useRef(handler);

  // Update handler ref on every render so the event listener always
  // calls the latest handler without needing to re-bind it.
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!active) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handlerRef.current(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [active]);

  return ref;
}
