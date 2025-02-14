import { FormConfig } from './formUtils';

// Extend the base field config with snapshot-specific options
export interface SnapshotFieldConfig {
  type?: string;
  label?: string;
  important?: boolean;
  [key: string]: any;
}

export type SnapshotFormConfig<T> = {
  [K in keyof T]: SnapshotFieldConfig;
};

export interface FormSnapshot<T extends Record<string, any>> {
  id: string;
  timestamp: number;
  state: T;
  version: string;
  metadata?: Record<string, any>;
}

export interface SnapshotOptions {
  storage?: Storage;
  maxSnapshots?: number;
  autoCleanup?: boolean;
  compressionEnabled?: boolean;
  namespace?: string;
}

export type FieldChange<T> = {
  from: T;
  to: T;
};

export type StateChanges<T> = {
  [K in keyof T]?: FieldChange<T[K]>;
};

export interface SnapshotMetadata<T> {
  auto?: boolean;
  changes?: StateChanges<T>;
  [key: string]: any;
}

export class FormSnapshotManager<T extends Record<string, any>> {
  private storage: Storage;
  private maxSnapshots: number;
  private autoCleanup: boolean;
  private compressionEnabled: boolean;
  private namespace: string;
  private snapshotKey: string;

  constructor(formId: string, options: SnapshotOptions = {}) {
    this.storage = options.storage || localStorage;
    this.maxSnapshots = options.maxSnapshots || 10;
    this.autoCleanup = options.autoCleanup ?? true;
    this.compressionEnabled = options.compressionEnabled ?? false;
    this.namespace = options.namespace || 'form_snapshots';
    this.snapshotKey = `${this.namespace}_${formId}`;
  }

  private compress(data: string): string {
    if (!this.compressionEnabled) return data;
    // Simple compression for demo - in production use a proper compression library
    return btoa(encodeURIComponent(data));
  }

  private decompress(data: string): string {
    if (!this.compressionEnabled) return data;
    return decodeURIComponent(atob(data));
  }

  private getSnapshots(): FormSnapshot<T>[] {
    try {
      const data = this.storage.getItem(this.snapshotKey);
      if (!data) return [];
      return JSON.parse(this.decompress(data));
    } catch (error) {
      console.error('Error loading snapshots:', error);
      return [];
    }
  }

  private saveSnapshots(snapshots: FormSnapshot<T>[]): void {
    const data = this.compress(JSON.stringify(snapshots));
    this.storage.setItem(this.snapshotKey, data);
  }

  createSnapshot(
    state: T,
    metadata?: SnapshotMetadata<T>
  ): FormSnapshot<T> {
    const snapshots = this.getSnapshots();
    const snapshot: FormSnapshot<T> = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      state,
      version: '1.0',
      metadata,
    };

    snapshots.push(snapshot);

    if (this.autoCleanup && snapshots.length > this.maxSnapshots) {
      snapshots.shift(); // Remove oldest snapshot
    }

    this.saveSnapshots(snapshots);
    return snapshot;
  }

  getSnapshot(id: string): FormSnapshot<T> | null {
    const snapshots = this.getSnapshots();
    return snapshots.find(s => s.id === id) || null;
  }

  getAllSnapshots(): FormSnapshot<T>[] {
    return this.getSnapshots();
  }

  restoreSnapshot(id: string): T | null {
    const snapshot = this.getSnapshot(id);
    return snapshot?.state || null;
  }

  deleteSnapshot(id: string): boolean {
    const snapshots = this.getSnapshots();
    const index = snapshots.findIndex(s => s.id === id);
    
    if (index === -1) return false;
    
    snapshots.splice(index, 1);
    this.saveSnapshots(snapshots);
    return true;
  }

  clearSnapshots(): void {
    this.storage.removeItem(this.snapshotKey);
  }

  createAutoSnapshot(
    formConfig: SnapshotFormConfig<T>,
    currentState: T,
    prevState: T
  ): FormSnapshot<T> | null {
    // Only create snapshot if important fields have changed
    const hasImportantChanges = Object.entries(formConfig).some(
      ([key, config]) => {
        const field = key as keyof T;
        return (
          config.important &&
          currentState[field] !== prevState[field]
        );
      }
    );

    if (hasImportantChanges) {
      const changes: StateChanges<T> = {};
      
      Object.keys(formConfig).forEach((key) => {
        const field = key as keyof T;
        if (currentState[field] !== prevState[field]) {
          changes[field] = {
            from: prevState[field],
            to: currentState[field],
          };
        }
      });

      return this.createSnapshot(currentState, {
        auto: true,
        changes,
      });
    }

    return null;
  }
}

export function useFormSnapshots<T extends Record<string, any>>(
  formId: string,
  options?: SnapshotOptions
) {
  const manager = new FormSnapshotManager<T>(formId, options);

  const createSnapshot = (
    state: T,
    metadata?: SnapshotMetadata<T>
  ) => {
    return manager.createSnapshot(state, metadata);
  };

  const restoreSnapshot = (id: string) => {
    return manager.restoreSnapshot(id);
  };

  const getSnapshots = () => {
    return manager.getAllSnapshots();
  };

  return {
    createSnapshot,
    restoreSnapshot,
    getSnapshots,
    deleteSnapshot: (id: string) => manager.deleteSnapshot(id),
    clearSnapshots: () => manager.clearSnapshots(),
  };
}

// Example usage:
// interface FormData {
//   email: string;
//   password: string;
//   preferences: Record<string, boolean>;
// }
//
// const formConfig: SnapshotFormConfig<FormData> = {
//   email: { type: 'email', important: true },
//   password: { type: 'password' },
//   preferences: { type: 'object' },
// };