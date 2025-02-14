import { FormSnapshot, StateChanges } from './formSnapshot';
import { SnapshotFormConfig } from './formSnapshot';

export interface SnapshotDiff<T> {
  added: Partial<T>;
  removed: Partial<T>;
  modified: StateChanges<T>;
  unchanged: Array<keyof T>;
}

export interface SnapshotValidationError {
  field?: string;
  message: string;
  code: string;
}

export interface SnapshotValidationResult {
  isValid: boolean;
  errors: SnapshotValidationError[];
}

export function compareSnapshots<T extends Record<string, any>>(
  snapshot1: FormSnapshot<T>,
  snapshot2: FormSnapshot<T>
): SnapshotDiff<T> {
  const keys1 = new Set(Object.keys(snapshot1.state));
  const keys2 = new Set(Object.keys(snapshot2.state));

  const added: Partial<T> = {};
  const removed: Partial<T> = {};
  const modified: StateChanges<T> = {};
  const unchanged: Array<keyof T> = [];

  // Find added fields
  for (const key of keys2) {
    if (!keys1.has(key)) {
      added[key as keyof T] = snapshot2.state[key];
    }
  }

  // Find removed and modified fields
  for (const key of keys1) {
    const typedKey = key as keyof T;
    if (!keys2.has(key)) {
      removed[typedKey] = snapshot1.state[typedKey];
    } else if (JSON.stringify(snapshot1.state[typedKey]) !== JSON.stringify(snapshot2.state[typedKey])) {
      modified[typedKey] = {
        from: snapshot1.state[typedKey],
        to: snapshot2.state[typedKey],
      };
    } else {
      unchanged.push(typedKey);
    }
  }

  return { added, removed, modified, unchanged };
}

export function validateSnapshot<T extends Record<string, any>>(
  snapshot: FormSnapshot<T>,
  config: SnapshotFormConfig<T>
): SnapshotValidationResult {
  const errors: SnapshotValidationError[] = [];

  // Validate state structure
  if (!snapshot.state || typeof snapshot.state !== 'object') {
    errors.push({
      message: 'Invalid snapshot state structure',
      code: 'INVALID_STATE',
    });
    return { isValid: false, errors };
  }

  // Validate required fields from config
  Object.entries(config).forEach(([field, fieldConfig]) => {
    const value = snapshot.state[field];

    if (fieldConfig.required && (value === undefined || value === null)) {
      errors.push({
        field,
        message: `Required field "${field}" is missing`,
        code: 'REQUIRED_FIELD',
      });
    }

    // Type validation
    if (value !== undefined && value !== null) {
      switch (fieldConfig.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push({
              field,
              message: `Field "${field}" must be a string`,
              code: 'INVALID_TYPE',
            });
          }
          break;
        case 'number':
          if (typeof value !== 'number') {
            errors.push({
              field,
              message: `Field "${field}" must be a number`,
              code: 'INVALID_TYPE',
            });
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push({
              field,
              message: `Field "${field}" must be a boolean`,
              code: 'INVALID_TYPE',
            });
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            errors.push({
              field,
              message: `Field "${field}" must be an array`,
              code: 'INVALID_TYPE',
            });
          }
          break;
      }
    }
  });

  // Validate metadata
  if (snapshot.metadata && typeof snapshot.metadata !== 'object') {
    errors.push({
      message: 'Invalid metadata structure',
      code: 'INVALID_METADATA',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function findSnapshotDifferences<T extends Record<string, any>>(
  snapshots: FormSnapshot<T>[],
  field: keyof T
): Array<{ timestamp: number; value: T[keyof T] }> {
  const changes: Array<{ timestamp: number; value: T[keyof T] }> = [];
  let lastValue: T[keyof T] | undefined;

  snapshots
    .sort((a, b) => a.timestamp - b.timestamp)
    .forEach((snapshot) => {
      const currentValue = snapshot.state[field];
      if (lastValue === undefined || JSON.stringify(lastValue) !== JSON.stringify(currentValue)) {
        changes.push({
          timestamp: snapshot.timestamp,
          value: currentValue,
        });
        lastValue = currentValue;
      }
    });

  return changes;
}

export function createSnapshotSummary<T extends Record<string, any>>(
  snapshot: FormSnapshot<T>,
  config: SnapshotFormConfig<T>
): string {
  const lines: string[] = [
    `Snapshot ID: ${snapshot.id}`,
    `Timestamp: ${new Date(snapshot.timestamp).toLocaleString()}`,
    `Version: ${snapshot.version}`,
    '\nFields:',
  ];

  Object.entries(snapshot.state).forEach(([field, value]) => {
    const fieldConfig = config[field];
    const important = fieldConfig?.important ? ' (Important)' : '';
    lines.push(`  ${field}${important}: ${JSON.stringify(value)}`);
  });

  if (snapshot.metadata) {
    lines.push('\nMetadata:');
    Object.entries(snapshot.metadata).forEach(([key, value]) => {
      lines.push(`  ${key}: ${JSON.stringify(value)}`);
    });
  }

  return lines.join('\n');
}

// Example usage:
// const snapshot1: FormSnapshot<FormData> = {
//   id: '1',
//   timestamp: Date.now() - 1000,
//   state: { email: 'old@example.com', name: 'John' },
//   version: '1.0',
// };
//
// const snapshot2: FormSnapshot<FormData> = {
//   id: '2',
//   timestamp: Date.now(),
//   state: { email: 'new@example.com', name: 'John', age: 25 },
//   version: '1.0',
// };
//
// const diff = compareSnapshots(snapshot1, snapshot2);
// console.log('Changes:', diff);
//
// const validation = validateSnapshot(snapshot2, formConfig);
// console.log('Validation:', validation);
//
// const fieldChanges = findSnapshotDifferences([snapshot1, snapshot2], 'email');
// console.log('Email changes:', fieldChanges);
//
// const summary = createSnapshotSummary(snapshot2, formConfig);
// console.log('Summary:', summary);