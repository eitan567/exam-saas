import { FormSnapshot, SnapshotFormConfig } from './formSnapshot';
import { Migration, SnapshotMigrationManager } from './formSnapshotMigration';
import { validateSnapshot } from './formSnapshotTools';

export interface SnapshotTestCase<T extends Record<string, any>> {
  name: string;
  snapshot: FormSnapshot<T>;
  config: SnapshotFormConfig<T>;
  expectedErrors?: string[];
}

export interface MigrationTestCase<T extends Record<string, any>, U extends Record<string, any>> {
  name: string;
  fromVersion: string;
  toVersion: string;
  initialState: T;
  expectedState: U;
  config: SnapshotFormConfig<T>;
}

export class SnapshotTestRunner {
  async runTests<T extends Record<string, any>>(
    testCases: SnapshotTestCase<T>[]
  ): Promise<Array<{ testCase: SnapshotTestCase<T>; passed: boolean; errors: string[] }>> {
    return Promise.all(
      testCases.map(async (testCase) => {
        try {
          const result = validateSnapshot(testCase.snapshot, testCase.config);
          const errors = result.errors.map((e) => e.message);

          if (testCase.expectedErrors) {
            const passed = this.compareErrors(errors, testCase.expectedErrors);
            return { testCase, passed, errors };
          }

          return { testCase, passed: errors.length === 0, errors };
        } catch (error) {
          return {
            testCase,
            passed: false,
            errors: [(error as Error).message],
          };
        }
      })
    );
  }

  private compareErrors(actual: string[], expected: string[]): boolean {
    if (actual.length !== expected.length) return false;
    return expected.every((error) =>
      actual.some((actualError) => actualError.includes(error))
    );
  }
}

export class MigrationTestRunner {
  async runTests<T extends Record<string, any>, U extends Record<string, any>>(
    testCases: MigrationTestCase<T, U>[],
    migrations: Migration<T, U>[]
  ): Promise<Array<{ testCase: MigrationTestCase<T, U>; passed: boolean; errors: string[] }>> {
    const results = [];

    for (const testCase of testCases) {
      const manager = new SnapshotMigrationManager<T>();
      migrations.forEach((migration) => manager.addMigration(migration));

      try {
        const initialSnapshot: FormSnapshot<T> = {
          id: 'test',
          timestamp: Date.now(),
          version: testCase.fromVersion,
          state: testCase.initialState,
        };

        const migratedSnapshot = await manager.migrateToVersion<U>(
          initialSnapshot,
          testCase.toVersion
        );

        const passed = this.compareStates(
          migratedSnapshot.state,
          testCase.expectedState
        );

        results.push({
          testCase,
          passed,
          errors: passed ? [] : ['State mismatch after migration'],
        });
      } catch (error) {
        results.push({
          testCase,
          passed: false,
          errors: [(error as Error).message],
        });
      }
    }

    return results;
  }

  private compareStates<T extends Record<string, any>>(
    actual: T,
    expected: T
  ): boolean {
    return JSON.stringify(actual) === JSON.stringify(expected);
  }
}

export function createSnapshotTest<T extends Record<string, any>>(
  name: string,
  snapshot: FormSnapshot<T>,
  config: SnapshotFormConfig<T>,
  expectedErrors?: string[]
): SnapshotTestCase<T> {
  return { name, snapshot, config, expectedErrors };
}

export function createMigrationTest<T extends Record<string, any>, U extends Record<string, any>>(
  name: string,
  fromVersion: string,
  toVersion: string,
  initialState: T,
  expectedState: U,
  config: SnapshotFormConfig<T>
): MigrationTestCase<T, U> {
  return {
    name,
    fromVersion,
    toVersion,
    initialState,
    expectedState,
    config,
  };
}

// Example usage:
// interface OldFormData {
//   name: string;
//   age: number;
// }
//
// interface NewFormData {
//   firstName: string;
//   lastName: string;
//   age: number;
// }
//
// const snapshotTests = [
//   createSnapshotTest(
//     'Valid snapshot test',
//     {
//       id: '1',
//       timestamp: Date.now(),
//       version: '1.0.0',
//       state: { name: 'John Doe', age: 25 },
//     },
//     {
//       name: { type: 'string', required: true },
//       age: { type: 'number', required: true },
//     }
//   ),
//   createSnapshotTest(
//     'Invalid snapshot test',
//     {
//       id: '2',
//       timestamp: Date.now(),
//       version: '1.0.0',
//       state: { name: '', age: -1 },
//     },
//     {
//       name: { type: 'string', required: true },
//       age: { type: 'number', required: true },
//     },
//     ['Required field "name" is missing', 'Invalid age value']
//   ),
// ];
//
// const migrationTests = [
//   createMigrationTest<OldFormData, NewFormData>(
//     'Split name migration test',
//     '1.0.0',
//     '2.0.0',
//     { name: 'John Doe', age: 25 },
//     { firstName: 'John', lastName: 'Doe', age: 25 },
//     {
//       name: { type: 'string', required: true },
//       age: { type: 'number', required: true },
//     }
//   ),
// ];
//
// async function runTests() {
//   const snapshotRunner = new SnapshotTestRunner();
//   const snapshotResults = await snapshotRunner.runTests(snapshotTests);
//   console.log('Snapshot Test Results:', snapshotResults);
//
//   const migrationRunner = new MigrationTestRunner();
//   const migrationResults = await migrationRunner.runTests(migrationTests, migrations);
//   console.log('Migration Test Results:', migrationResults);
// }