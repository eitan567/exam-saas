import { useCallback, useEffect, useRef, useState } from 'react';

interface KeyboardNavigationOptions<T> {
  items: T[];
  onSelect?: (item: T) => void;
  onHighlight?: (item: T | null) => void;
  enabled?: boolean;
  typeaheadTimeout?: number;
  initialIndex?: number;
  wrap?: boolean;
  shortcuts?: {
    select?: string[];
    previous?: string[];
    next?: string[];
    first?: string[];
    last?: string[];
    clear?: string[];
  };
}

interface KeyboardNavigationState<T> {
  highlightedIndex: number;
  selectedItem: T | null;
  typeaheadQuery: string;
  lastTypeaheadTime: number;
}

export function useKeyboardNavigation<T extends { label?: string }>({
  items,
  onSelect,
  onHighlight,
  enabled = true,
  typeaheadTimeout = 1000,
  initialIndex = -1,
  wrap = true,
  shortcuts = {
    select: ['Enter', ' '],
    previous: ['ArrowUp'],
    next: ['ArrowDown'],
    first: ['Home'],
    last: ['End'],
    clear: ['Escape'],
  },
}: KeyboardNavigationOptions<T>) {
  const [state, setState] = useState<KeyboardNavigationState<T>>({
    highlightedIndex: initialIndex,
    selectedItem: null,
    typeaheadQuery: '',
    lastTypeaheadTime: 0,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const resetTypeahead = useCallback(() => {
    setState(prev => ({
      ...prev,
      typeaheadQuery: '',
      lastTypeaheadTime: 0,
    }));
  }, []);

  const handleTypeahead = useCallback(
    (char: string) => {
      const now = Date.now();
      const prevState = stateRef.current;

      // Reset if timeout has elapsed
      const newQuery =
        now - prevState.lastTypeaheadTime > typeaheadTimeout
          ? char
          : prevState.typeaheadQuery + char;

      // Find matching item
      const matchIndex = items.findIndex(item =>
        item.label?.toLowerCase().startsWith(newQuery.toLowerCase())
      );

      if (matchIndex !== -1) {
        setState(prev => ({
          ...prev,
          highlightedIndex: matchIndex,
          typeaheadQuery: newQuery,
          lastTypeaheadTime: now,
        }));

        onHighlight?.(items[matchIndex]);
      }
    },
    [items, typeaheadTimeout, onHighlight]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const { highlightedIndex } = stateRef.current;
      let newIndex = highlightedIndex;
      let handled = true;

      // Handle navigation keys
      if (shortcuts.previous?.includes(event.key)) {
        newIndex = wrap
          ? (highlightedIndex - 1 + items.length) % items.length
          : Math.max(0, highlightedIndex - 1);
      } else if (shortcuts.next?.includes(event.key)) {
        newIndex = wrap
          ? (highlightedIndex + 1) % items.length
          : Math.min(items.length - 1, highlightedIndex + 1);
      } else if (shortcuts.first?.includes(event.key)) {
        newIndex = 0;
      } else if (shortcuts.last?.includes(event.key)) {
        newIndex = items.length - 1;
      } else if (shortcuts.select?.includes(event.key) && highlightedIndex !== -1) {
        const selectedItem = items[highlightedIndex];
        setState(prev => ({ ...prev, selectedItem }));
        onSelect?.(selectedItem);
      } else if (shortcuts.clear?.includes(event.key)) {
        newIndex = -1;
        setState(prev => ({ ...prev, selectedItem: null }));
        onHighlight?.(null);
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        handleTypeahead(event.key);
        handled = false; // Don't prevent default for typeahead
      } else {
        handled = false;
      }

      if (newIndex !== highlightedIndex) {
        setState(prev => ({ ...prev, highlightedIndex: newIndex }));
        onHighlight?.(newIndex === -1 ? null : items[newIndex]);
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [enabled, items, wrap, shortcuts, onSelect, onHighlight, handleTypeahead]
  );

  // Add/remove keyboard event listeners
  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  // Reset typeahead after timeout
  useEffect(() => {
    if (state.typeaheadQuery) {
      const timeoutId = setTimeout(resetTypeahead, typeaheadTimeout);
      return () => clearTimeout(timeoutId);
    }
  }, [state.typeaheadQuery, typeaheadTimeout, resetTypeahead]);

  return {
    highlightedIndex: state.highlightedIndex,
    selectedItem: state.selectedItem,
    setHighlightedIndex: (index: number) => {
      setState(prev => ({ ...prev, highlightedIndex: index }));
      onHighlight?.(index === -1 ? null : items[index]);
    },
    reset: () => {
      setState({
        highlightedIndex: initialIndex,
        selectedItem: null,
        typeaheadQuery: '',
        lastTypeaheadTime: 0,
      });
      onHighlight?.(null);
    },
  };
}

// Example usage:
// const MyList = () => {
//   const items = [{ label: 'Item 1' }, { label: 'Item 2' }];
//   const {
//     highlightedIndex,
//     selectedItem,
//     setHighlightedIndex,
//   } = useKeyboardNavigation({
//     items,
//     onSelect: (item) => console.log('Selected:', item),
//     onHighlight: (item) => console.log('Highlighted:', item),
//   });
//
//   return (
//     <div>
//       {items.map((item, index) => (
//         <div
//           key={index}
//           onMouseEnter={() => setHighlightedIndex(index)}
//           style={{
//             backgroundColor: index === highlightedIndex ? 'blue' : 'white',
//           }}
//         >
//           {item.label}
//         </div>
//       ))}
//     </div>
//   );
// };