import { useEffect, useRef } from 'react';

/**
 * Custom hook to dynamically update the document title.
 * Useful for updating the page title when a component mounts, such as a detail page.
 *
 * @param title The string to set as the document title.
 * @param restoreOnUnmount If true, the title will be reverted to its original value when the component unmounts. Default is false.
 */
export function useDocumentTitle(title: string, restoreOnUnmount: boolean = false): void {
  const defaultTitle = useRef(typeof document !== 'undefined' ? document.title : '');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = title;
    }
  }, [title]);

  useEffect(() => {
    const originalTitle = defaultTitle.current;
    return () => {
      if (restoreOnUnmount && typeof document !== 'undefined') {
        document.title = originalTitle;
      }
    };
  }, [restoreOnUnmount]);
}
