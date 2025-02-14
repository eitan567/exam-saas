import { useEffect, useRef, useCallback } from 'react';

interface FocusTrapOptions {
  enabled?: boolean;
  onEscape?: () => void;
  returnFocusOnDeactivate?: boolean;
}

export function useFocusTrap(options: FocusTrapOptions = {}) {
  const {
    enabled = true,
    onEscape,
    returnFocusOnDeactivate = true,
  } = options;

  const rootRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!rootRef.current) return [];

    return Array.from(
      rootRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled'));
  }, []);

  // Save previous focus and set initial focus
  useEffect(() => {
    if (!enabled) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    const focusableElements = getFocusableElements();
    if (focusableElements.length) {
      focusableElements[0].focus();
    }

    return () => {
      if (returnFocusOnDeactivate && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [enabled, getFocusableElements, returnFocusOnDeactivate]);

  // Handle tab key navigation
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      // Handle shift + tab
      if (event.shiftKey) {
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      }
      // Handle tab
      else {
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        const focusableElements = getFocusableElements();
        if (focusableElements.length) {
          event.preventDefault();
          focusableElements[0].focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [enabled, getFocusableElements, onEscape]);

  return {
    rootRef,
    getFocusableElements,
  };
}

// Example usage:
// const MyComponent = () => {
//   const { rootRef } = useFocusTrap({
//     enabled: true,
//     onEscape: () => setIsOpen(false),
//     returnFocusOnDeactivate: true,
//   });
//
//   return (
//     <div ref={rootRef}>
//       <button>First focusable</button>
//       <input type="text" />
//       <button>Last focusable</button>
//     </div>
//   );
// };