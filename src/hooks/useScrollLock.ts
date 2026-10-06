import { useEffect } from 'react';

/**
 * Custom hook to prevent body scrolling when a modal or overlay is open.
 * 
 * @param isLocked Whether the scroll should be locked
 */
export const useScrollLock = (isLocked: boolean = true) => {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLocked]);
};
