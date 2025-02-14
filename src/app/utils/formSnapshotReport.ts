import { FormSnapshot, SnapshotFormConfig } from './formSnapshot';
import { StateChanges, FieldChange } from './formTypes';

export interface ReportOptions {
  includeMetadata?: boolean;
  includeTimestamps?: boolean;
  format?: 'text' | 'markdown' | 'html' | 'json';
  filters?: {
    fromDate?: Date;
    toDate?: Date;
    versions?: string[];
    fields?: string[];
    onlyImportant?: boolean;
  };
}

export interface ProcessedSnapshot<T extends Record<string, any>> {
  snapshot: FormSnapshot<T>;
  changes?: StateChanges<T>;
  importance: 'high' | 'medium' | 'low';
}

export interface SnapshotReport<T extends Record<string, any>> {
  summary: {
    totalSnapshots: number;
    dateRange: { from: Date; to: Date };
    versions: string[];
    totalChanges: number;
    importantChanges: number;
  };
  snapshots: ProcessedSnapshot<T>[];
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    if (part1 !== part2) return part1 - part2;
  }
  
  return 0;
}

export function generateReport<T extends Record<string, any>>(
  snapshots: FormSnapshot<T>[],
  config: SnapshotFormConfig<T>,
  options: ReportOptions = {}
): SnapshotReport<T> {
  const {
    includeMetadata = true,
    includeTimestamps = true,
    filters = {},
  } = options;

  // Filter snapshots
  let filteredSnapshots = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);

  if (filters.fromDate) {
    filteredSnapshots = filteredSnapshots.filter(
      (s) => s.timestamp >= filters.fromDate!.getTime()
    );
  }

  if (filters.toDate) {
    filteredSnapshots = filteredSnapshots.filter(
      (s) => s.timestamp <= filters.toDate!.getTime()
    );
  }

  if (filters.versions?.length) {
    filteredSnapshots = filteredSnapshots.filter((s) =>
      filters.versions!.includes(s.version)
    );
  }

  // Calculate changes and importance for each snapshot
  const processedSnapshots = filteredSnapshots.map((snapshot, index) => {
    const previousSnapshot = index > 0 ? filteredSnapshots[index - 1] : undefined;
    const changes: StateChanges<T> = {};
    let importantChangeCount = 0;

    if (previousSnapshot) {
      Object.keys(snapshot.state).forEach((key) => {
        const field = key as keyof T;
        if (
          (!filters.fields || filters.fields.includes(String(field))) &&
          JSON.stringify(snapshot.state[field]) !==
          JSON.stringify(previousSnapshot.state[field])
        ) {
          changes[field] = {
            from: previousSnapshot.state[field],
            to: snapshot.state[field],
          };

          if (config[field]?.important) {
            importantChangeCount++;
          }
        }
      });
    }

    // Determine importance level
    let importance: 'high' | 'medium' | 'low' = 'low';
    if (importantChangeCount > 0) {
      importance = 'high';
    } else if (Object.keys(changes).length > 3) {
      importance = 'medium';
    }

    return {
      snapshot,
      changes: Object.keys(changes).length > 0 ? changes : undefined,
      importance,
    };
  });

  // Filter by importance if needed
  const finalSnapshots = filters.onlyImportant
    ? processedSnapshots.filter((s) => s.importance === 'high')
    : processedSnapshots;

  // Generate summary
  const summary = {
    totalSnapshots: finalSnapshots.length,
    dateRange: {
      from: new Date(finalSnapshots[0]?.snapshot.timestamp || Date.now()),
      to: new Date(
        finalSnapshots[finalSnapshots.length - 1]?.snapshot.timestamp || Date.now()
      ),
    },
    versions: Array.from(
      new Set(finalSnapshots.map((s) => s.snapshot.version))
    ).sort(compareVersions),
    totalChanges: finalSnapshots.filter((s) => s.changes).length,
    importantChanges: finalSnapshots.filter((s) => s.importance === 'high').length,
  };

  return { summary, snapshots: finalSnapshots };
}

export function formatReport<T extends Record<string, any>>(
  report: SnapshotReport<T>,
  format: ReportOptions['format'] = 'text'
): string {
  switch (format) {
    case 'markdown':
      return formatMarkdownReport(report);
    case 'html':
      return formatHtmlReport(report);
    case 'json':
      return JSON.stringify(report, null, 2);
    default:
      return formatTextReport(report);
  }
}

function formatTextReport<T extends Record<string, any>>(
  report: SnapshotReport<T>
): string {
  const lines: string[] = [
    'Form Snapshot Report',
    '===================',
    '',
    'Summary:',
    `Total Snapshots: ${report.summary.totalSnapshots}`,
    `Date Range: ${report.summary.dateRange.from.toLocaleDateString()} - ${report.summary.dateRange.to.toLocaleDateString()}`,
    `Versions: ${report.summary.versions.join(', ')}`,
    `Total Changes: ${report.summary.totalChanges}`,
    `Important Changes: ${report.summary.importantChanges}`,
    '',
    'Snapshots:',
    '',
  ];

  report.snapshots.forEach(({ snapshot, changes, importance }) => {
    lines.push(
      `Version ${snapshot.version} (${new Date(
        snapshot.timestamp
      ).toLocaleString()})`,
      `Importance: ${importance}`,
      ''
    );

    if (changes) {
      lines.push('Changes:');
      Object.entries(changes).forEach(([field, change]) => {
        const fieldChange = change as FieldChange<any>;
        lines.push(
          `  ${field}:`,
          `    From: ${JSON.stringify(fieldChange.from)}`,
          `    To:   ${JSON.stringify(fieldChange.to)}`
        );
      });
    }
    lines.push('');
  });

  return lines.join('\n');
}

function formatMarkdownReport<T extends Record<string, any>>(
  report: SnapshotReport<T>
): string {
  // Implementation similar to text report but with Markdown syntax
  // Add this based on your needs
  return '';
}

function formatHtmlReport<T extends Record<string, any>>(
  report: SnapshotReport<T>
): string {
  // Implementation for HTML report format
  // Add this based on your needs
  return '';
}

// Example usage:
// interface FormData {
//   name: string;
//   email: string;
//   settings: Record<string, boolean>;
// }
//
// const snapshots: FormSnapshot<FormData>[] = [...];
// const config: SnapshotFormConfig<FormData> = {
//   name: { type: 'text', important: true },
//   email: { type: 'email' },
//   settings: { type: 'object' },
// };
//
// const report = generateReport(snapshots, config, {
//   filters: {
//     fromDate: new Date('2025-01-01'),
//     onlyImportant: true,
//   },
// });
//
// const textReport = formatReport(report, 'text');