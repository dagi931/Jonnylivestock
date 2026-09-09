import { useState, useEffect } from 'react';

/**
 * Custom hook to prevent premature loading flashes.
 * Returns true ONLY if isLoading remains continuously true for longer than delayMs (default 3000ms).
 * If loading completes before delayMs, returns false and the user never sees a loading indicator.
 */
export function useDelayedLoading(isLoading: boolean, delayMs = 3000): boolean {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timer: any = null;

    if (isLoading) {
      timer = setTimeout(() => {
        setShowLoading(true);
      }, delayMs);
    } else {
      setShowLoading(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, delayMs]);

  return showLoading;
}
