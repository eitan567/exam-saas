import { FormSnapshot, SnapshotFormConfig } from './formSnapshot';

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

export type SnapshotComparison<T> = {
  added: Partial<T>;
  removed: Partial<T>;
  modified: StateChanges<T>;
  unchanged: Array<keyof T>;
};