import { useCallback, useEffect } from 'react';

interface AnnouncerOptions {
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
}

export function useAnnouncer() {
  useEffect(() => {
    // Create the live region if it doesn't exist
    let liveRegion = document.getElementById('live-announcer');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'live-announcer';
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveRegion);
    }

    // Cleanup
    return () => {
      if (document.getElementById('live-announcer')) {
        document.getElementById('live-announcer')?.remove();
      }
    };
  }, []);

  const announce = useCallback((message: string, options: AnnouncerOptions = {}) => {
    const { politeness = 'polite', clearAfter = 3000 } = options;
    const liveRegion = document.getElementById('live-announcer');
    
    if (liveRegion) {
      liveRegion.textContent = '';
      liveRegion.setAttribute('aria-live', politeness);
      
      // Use setTimeout to ensure the change is announced
      setTimeout(() => {
        liveRegion.textContent = message;
      }, 100);

      // Clear the announcement after delay
      if (clearAfter > 0) {
        setTimeout(() => {
          if (liveRegion.textContent === message) {
            liveRegion.textContent = '';
          }
        }, clearAfter);
      }
    }
  }, []);

  return announce;
}
