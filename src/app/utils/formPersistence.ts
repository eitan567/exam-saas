import { FormConfig } from './formUtils';

export interface PersistenceOptions {
  key: string;
  storage?: Storage;
  encrypt?: boolean;
  expireIn?: number; // milliseconds
  exclude?: string[];
}

export interface PersistedFormState<T> {
  values: Partial<T>;
  timestamp: number;
  version?: string;
}

class FormPersistence<T extends Record<string, any>> {
  private options: Required<PersistenceOptions>;
  private formConfig: FormConfig<T>;

  constructor(formConfig: FormConfig<T>, options: PersistenceOptions) {
    this.formConfig = formConfig;
    this.options = {
      storage: window.localStorage,
      encrypt: false,
      expireIn: 24 * 60 * 60 * 1000, // 24 hours
      exclude: [],
      ...options,
    };
  }

  private encrypt(data: string): string {
    if (!this.options.encrypt) return data;
    // Simple encryption for demo purposes
    // In production, use a proper encryption library
    return btoa(encodeURIComponent(data));
  }

  private decrypt(data: string): string {
    if (!this.options.encrypt) return data;
    // Simple decryption for demo purposes
    return decodeURIComponent(atob(data));
  }

  private getStorageKey(): string {
    return `form_state_${this.options.key}`;
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.options.expireIn;
  }

  private filterExcludedFields(values: Partial<T>): Partial<T> {
    if (!this.options.exclude.length) return values;
    
    return Object.entries(values).reduce((acc, [key, value]) => {
      if (!this.options.exclude.includes(key)) {
        acc[key as keyof T] = value;
      }
      return acc;
    }, {} as Partial<T>);
  }

  save(values: Partial<T>, version?: string): void {
    try {
      const filteredValues = this.filterExcludedFields(values);
      const state: PersistedFormState<T> = {
        values: filteredValues,
        timestamp: Date.now(),
        version,
      };

      const serialized = this.encrypt(JSON.stringify(state));
      this.options.storage.setItem(this.getStorageKey(), serialized);
    } catch (error) {
      console.error('Error saving form state:', error);
    }
  }

  load(version?: string): Partial<T> | null {
    try {
      const serialized = this.options.storage.getItem(this.getStorageKey());
      if (!serialized) return null;

      const state: PersistedFormState<T> = JSON.parse(this.decrypt(serialized));

      // Check version mismatch
      if (version && state.version !== version) {
        this.clear();
        return null;
      }

      // Check expiration
      if (this.isExpired(state.timestamp)) {
        this.clear();
        return null;
      }

      return state.values;
    } catch (error) {
      console.error('Error loading form state:', error);
      return null;
    }
  }

  clear(): void {
    try {
      this.options.storage.removeItem(this.getStorageKey());
    } catch (error) {
      console.error('Error clearing form state:', error);
    }
  }

  autoSave(values: Partial<T>, debounceMs = 1000): void {
    if (typeof window === 'undefined') return;

    const debouncedSave = this.debounce(() => {
      this.save(values);
    }, debounceMs);

    debouncedSave();
  }

  private debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
}

// Helper function to create form persistence instance
export function createFormPersistence<T extends Record<string, any>>(
  formConfig: FormConfig<T>,
  options: PersistenceOptions
): FormPersistence<T> {
  return new FormPersistence(formConfig, options);
}

// Example usage:
// interface LoginForm {
//   email: string;
//   password: string;
//   rememberMe: boolean;
// }
//
// const formConfig: FormConfig<LoginForm> = {
//   email: { type: 'email', label: 'Email' },
//   password: { type: 'password', label: 'Password' },
//   rememberMe: { type: 'checkbox', label: 'Remember me' },
// };
//
// const persistence = createFormPersistence(formConfig, {
//   key: 'login_form',
//   encrypt: true,
//   exclude: ['password'],
//   expireIn: 7 * 24 * 60 * 60 * 1000, // 7 days
// });
//
// // Save form state
// persistence.save({
//   email: 'user@example.com',
//   rememberMe: true,
// });
//
// // Load form state
// const savedState = persistence.load();
//
// // Auto-save with debounce
// persistence.autoSave({
//   email: 'user@example.com',
//   rememberMe: true,
// });
//
// // Clear form state
// persistence.clear();