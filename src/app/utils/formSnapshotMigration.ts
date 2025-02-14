import { FormSnapshot, SnapshotFormConfig } from './formSnapshot';

export interface MigrationOptions {
  strict?: boolean;
  logger?: (message: string, data?: any) => void;
}

export interface Migration<TOld extends Record<string, any>, TNew extends Record<string, any>> {
  version: string;
  description: string;
  up: (state: TOld) => TNew | Promise<TNew>;
  down: (state: TNew) => TOld | Promise<TOld>;
}

export class SnapshotMigrationError extends Error {
  constructor(
    message: string,
    public version: string,
    public snapshot: any
  ) {
    super(message);
    this.name = 'SnapshotMigrationError';
  }
}

export class SnapshotMigrationManager<T extends Record<string, any>> {
  private migrations: Migration<any, any>[] = [];
  private options: Required<MigrationOptions>;

  constructor(options: MigrationOptions = {}) {
    this.options = {
      strict: true,
      logger: console.log,
      ...options,
    };
  }

  addMigration<U extends Record<string, any>>(migration: Migration<T, U>): this {
    this.migrations.push(migration);
    // Sort migrations by version
    this.migrations.sort((a, b) => this.compareVersions(a.version, b.version));
    return this;
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      if (part1 !== part2) return part1 - part2;
    }
    
    return 0;
  }

  private async executeMigration<U extends Record<string, any>>(
    snapshot: FormSnapshot<T>,
    migration: Migration<T, U>,
    direction: 'up' | 'down'
  ): Promise<FormSnapshot<U>> {
    try {
      const migrateFn = direction === 'up' ? migration.up : migration.down as any;
      const newState = await Promise.resolve(migrateFn(snapshot.state));

      return {
        ...snapshot,
        state: newState,
        version: migration.version,
        metadata: {
          ...snapshot.metadata,
          migrations: [
            ...(snapshot.metadata?.migrations || []),
            {
              version: migration.version,
              direction,
              timestamp: Date.now(),
              description: migration.description,
            },
          ],
        },
      };
    } catch (error) {
      throw new SnapshotMigrationError(
        `Migration ${direction} to version ${migration.version} failed: ${error}`,
        migration.version,
        snapshot
      );
    }
  }

  async migrateToVersion<U extends Record<string, any>>(
    snapshot: FormSnapshot<T>,
    targetVersion: string
  ): Promise<FormSnapshot<U>> {
    const currentVersion = snapshot.version;
    let currentSnapshot: FormSnapshot<any> = snapshot;

    this.options.logger(`Migrating from version ${currentVersion} to ${targetVersion}`);

    if (this.compareVersions(currentVersion, targetVersion) === 0) {
      return currentSnapshot as FormSnapshot<U>;
    }

    const isUpgrade = this.compareVersions(targetVersion, currentVersion) > 0;
    const relevantMigrations = this.migrations
      .filter(m => {
        if (isUpgrade) {
          return this.compareVersions(m.version, currentVersion) > 0 &&
                 this.compareVersions(m.version, targetVersion) <= 0;
        }
        return this.compareVersions(m.version, currentVersion) <= 0 &&
               this.compareVersions(m.version, targetVersion) > 0;
      })
      .sort((a, b) => 
        isUpgrade
          ? this.compareVersions(a.version, b.version)
          : this.compareVersions(b.version, a.version)
      );

    for (const migration of relevantMigrations) {
      this.options.logger(
        `Executing ${isUpgrade ? 'up' : 'down'} migration to version ${migration.version}`,
        { description: migration.description }
      );

      currentSnapshot = await this.executeMigration(
        currentSnapshot,
        migration,
        isUpgrade ? 'up' : 'down'
      );
    }

    return currentSnapshot as FormSnapshot<U>;
  }

  async migrateToLatest<U extends Record<string, any>>(
    snapshot: FormSnapshot<T>
  ): Promise<FormSnapshot<U>> {
    const latestVersion = this.migrations[this.migrations.length - 1]?.version;
    if (!latestVersion) {
      return snapshot as unknown as FormSnapshot<U>;
    }
    return this.migrateToVersion<U>(snapshot, latestVersion);
  }

  validateMigrations(config: SnapshotFormConfig<T>): void {
    if (!this.options.strict) return;

    const errors: string[] = [];

    // Check for version continuity
    this.migrations.reduce((prevVersion, migration) => {
      if (prevVersion && this.compareVersions(migration.version, prevVersion) <= 0) {
        errors.push(`Invalid version order: ${prevVersion} -> ${migration.version}`);
      }
      return migration.version;
    }, '0.0.0');

    // Check for migration reversibility
    this.migrations.forEach(migration => {
      try {
        const testState = {} as T;
        const upResult = migration.up(testState);
        const downResult = migration.down(upResult as any);
        
        if (JSON.stringify(testState) !== JSON.stringify(downResult)) {
          errors.push(`Migration ${migration.version} is not reversible`);
        }
      } catch (error) {
        errors.push(`Migration ${migration.version} validation failed: ${error}`);
      }
    });

    if (errors.length > 0) {
      throw new Error(`Migration validation failed:\n${errors.join('\n')}`);
    }
  }
}

// Example usage:
// interface OldFormData {
//   name: string;
//   email: string;
// }
//
// interface NewFormData {
//   firstName: string;
//   lastName: string;
//   email: string;
// }
//
// const migrations = new SnapshotMigrationManager<OldFormData>();
//
// migrations.addMigration<NewFormData>({
//   version: '1.1.0',
//   description: 'Split name into firstName and lastName',
//   up: (state) => {
//     const [firstName = '', lastName = ''] = state.name.split(' ');
//     return {
//       firstName,
//       lastName,
//       email: state.email,
//     };
//   },
//   down: (state) => ({
//     name: `${state.firstName} ${state.lastName}`.trim(),
//     email: state.email,
//   }),
// });