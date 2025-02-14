import { useState, useEffect, useCallback } from 'react';
import { FormConfig } from '@/app/utils/formUtils';

interface SyncOptions<T> {
  key: string;
  storage?: Storage;
  debounceMs?: number;
  onSync?: (values: T) => void;
  syncFields?: (keyof T)[];
  excludeFields?: (keyof T)[];
}

export function useFormSync<T extends Record<string, any>>(
  initialValues: T,
  options: SyncOptions<T>
) {
  const {
    key,
    storage = localStorage,
    debounceMs = 1000,
    onSync,
    syncFields,
    excludeFields = [],
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [lastSync, setLastSync] = useState<number>(Date.now());

  // Load initial state from storage
  useEffect(() => {
    const stored = storage.getItem(key);
    if (stored) {
      try {
        const { values: storedValues, timestamp } = JSON.parse(stored);
        if (timestamp > lastSync) {
          setValues(storedValues);
          setLastSync(timestamp);
          onSync?.(storedValues);
        }
      } catch (error) {
        console.error('Error loading synced form state:', error);
      }
    }
  }, [key, storage, lastSync, onSync]);

  // Handle storage events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const { values: newValues, timestamp } = JSON.parse(e.newValue);
          if (timestamp > lastSync) {
            setValues(newValues);
            setLastSync(timestamp);
            onSync?.(newValues);
          }
        } catch (error) {
          console.error('Error handling storage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, lastSync, onSync]);

  // Debounced sync function
  const syncToStorage = useCallback(
    debounce((newValues: T) => {
      const timestamp = Date.now();
      const syncedValues = { values: newValues, timestamp };
      storage.setItem(key, JSON.stringify(syncedValues));
      setLastSync(timestamp);
    }, debounceMs),
    [key, storage, debounceMs]
  );

  // Handle value updates
  const setFormValues = useCallback(
    (newValues: T | ((prev: T) => T)) => {
      const nextValues = typeof newValues === 'function' ? newValues(values) : newValues;
      setValues(nextValues);

      // Filter values based on syncFields and excludeFields
      const filteredValues = Object.entries(nextValues).reduce((acc, [key, value]) => {
        const fieldKey = key as keyof T;
        if (
          (!syncFields || syncFields.includes(fieldKey)) &&
          !excludeFields.includes(fieldKey)
        ) {
          acc[fieldKey] = value;
        } else {
          // Keep existing value for excluded fields
          acc[fieldKey] = values[fieldKey];
        }
        return acc;
      }, {} as T);

      syncToStorage(filteredValues);
    },
    [values, syncFields, excludeFields, syncToStorage]
  );

  // Clear synced state
  const clearSync = useCallback(() => {
    storage.removeItem(key);
  }, [key, storage]);

  return {
    values,
    setValues: setFormValues,
    clearSync,
    lastSync,
  };
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Broadcast channel for cross-tab communication
export class FormSyncChannel<T> {
  private channel: BroadcastChannel;

  constructor(name: string) {
    this.channel = new BroadcastChannel(`form_sync_${name}`);
  }

  subscribe(callback: (values: T) => void) {
    const handler = (event: MessageEvent) => callback(event.data);
    this.channel.addEventListener('message', handler);
    return () => this.channel.removeEventListener('message', handler);
  }

  publish(values: T) {
    this.channel.postMessage(values);
  }

  close() {
    this.channel.close();
  }
}

// Example usage:
// const ExampleForm = () => {
//   const { values, setValues, clearSync } = useFormSync(
//     {
//       email: '',
//       password: '',
//       rememberMe: false,
//     },
//     {
//       key: 'example_form',
//       debounceMs: 500,
//       excludeFields: ['password'],
//       onSync: (values) => {
//         console.log('Form synced:', values);
//       },
//     }
//   );
//
//   // Optional: Use BroadcastChannel for immediate cross-tab sync
//   const syncChannel = useMemo(
//     () => new FormSyncChannel<typeof values>('example_form'),
//     []
//   );
//
//   useEffect(() => {
//     const unsubscribe = syncChannel.subscribe(setValues);
//     return () => {
//       unsubscribe();
//       syncChannel.close();
//     };
//   }, [syncChannel]);
//
//   const handleChange = (field: string, value: any) => {
//     setValues((prev) => {
//       const updated = { ...prev, [field]: value };
//       syncChannel.publish(updated);
//       return updated;
//     });
//   };
//
//   return (
//     <form>
//       <input
//         value={values.email}
//         onChange={(e) => handleChange('email', e.target.value)}
//       />
//       {/* Other form fields */}
//     </form>
//   );
// };