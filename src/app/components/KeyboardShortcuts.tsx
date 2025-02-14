import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';

interface ShortcutKey {
  key: string;
  description: string;
  group?: string;
}

interface KeyboardShortcutsProps {
  shortcuts: ShortcutKey[];
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function KeyboardShortcuts({
  shortcuts,
  isOpen = false,
  onClose,
  className = '',
}: KeyboardShortcutsProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce<Record<string, ShortcutKey[]>>(
    (groups, shortcut) => {
      const group = shortcut.group || 'General';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(shortcut);
      return groups;
    },
    {}
  );

  if (!isVisible) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className={className}
        onClick={() => setIsVisible(true)}
      >
        <span className="sr-only">Show keyboard shortcuts</span>
        <kbd className="px-2 py-1 text-sm font-semibold bg-gray-100 dark:bg-gray-800 rounded">
          ?
        </kbd>
      </Button>
    );
  }

  return (
    <Card className={`${className} max-w-lg`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            aria-label="Close keyboard shortcuts"
          >
            ×
          </Button>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([group, groupShortcuts]) => (
            <div key={group}>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {group}
              </h3>
              <div className="space-y-2">
                {groupShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 text-sm font-mono bg-gray-100 dark:bg-gray-800 rounded">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">?</kbd>{' '}
          anywhere to show/hide shortcuts
        </div>
      </div>
    </Card>
  );
}

export const defaultShortcuts: ShortcutKey[] = [
  { key: '↑', description: 'Move to previous suggestion', group: 'Navigation' },
  { key: '↓', description: 'Move to next suggestion', group: 'Navigation' },
  { key: 'Enter', description: 'Apply selected suggestion', group: 'Actions' },
  { key: 'Esc', description: 'Clear selection', group: 'Actions' },
  { key: '?', description: 'Show/hide keyboard shortcuts', group: 'Help' },
];

export default KeyboardShortcuts;