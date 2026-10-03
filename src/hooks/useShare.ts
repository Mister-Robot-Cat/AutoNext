import { useState, useCallback } from 'react';

export function useShare() {
  const [isShared, setIsShared] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const share = useCallback(async (title: string, text: string, url: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });
        setIsShared(true);
      } else {
        // Fallback for browsers that do not support navigator.share
        await navigator.clipboard.writeText(`${title} - ${text}\n${url}`);
        setIsShared(true);
      }
      setTimeout(() => setIsShared(false), 2000);
    } catch (err) {
      if (err instanceof Error) {
        // Ignore user cancellation errors
        if (err.name !== 'AbortError') {
          setError(err);
        }
      } else {
        setError(new Error('Unknown share error'));
      }
    }
  }, []);

  return { share, isShared, error };
}
