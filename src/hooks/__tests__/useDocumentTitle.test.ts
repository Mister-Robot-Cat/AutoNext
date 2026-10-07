import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDocumentTitle } from '../useDocumentTitle';

describe('useDocumentTitle', () => {
  const initialTitle = 'AutoNext Original Title';

  beforeEach(() => {
    document.title = initialTitle;
  });

  afterEach(() => {
    document.title = initialTitle;
  });

  it('should update the document title upon mounting', () => {
    const { unmount } = renderHook(() => useDocumentTitle('New Page Title'));
    
    expect(document.title).toBe('New Page Title');
    
    // Should not restore by default when unmounted
    unmount();
    expect(document.title).toBe('New Page Title');
  });

  it('should dynamically update the document title when the title prop changes', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'First Title' },
    });
    
    expect(document.title).toBe('First Title');
    
    rerender({ title: 'Second Title' });
    expect(document.title).toBe('Second Title');
  });

  it('should restore the original document title on unmount if restoreOnUnmount is set to true', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Temporary Detail View', true));
    
    expect(document.title).toBe('Temporary Detail View');
    
    unmount();
    
    expect(document.title).toBe(initialTitle);
  });
});
