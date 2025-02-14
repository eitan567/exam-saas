import { SnapshotReport, ProcessedSnapshot } from './formSnapshotReport';
import { StateChanges, FieldChange } from './formTypes';

function mdEscape(text: string): string {
  return text.replace(/[*_`[\]]/g, '\\$&');
}

function mdTable(headers: string[], rows: string[][]): string {
  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataRows = rows.map(row => `| ${row.join(' | ')} |`);

  return [headerRow, separatorRow, ...dataRows].join('\n');
}

function mdDetails(summary: string, content: string): string {
  return `<details>
<summary>${summary}</summary>

${content}
</details>`;
}

function mdCodeBlock(content: string, language = ''): string {
  return `\`\`\`${language}
${content}
\`\`\``;
}

function formatChangesAsTable<T extends Record<string, any>>(
  changes: StateChanges<T>
): string {
  const headers = ['Field', 'Previous Value', 'New Value'];
  const rows = Object.entries(changes)
    .filter((entry): entry is [string, FieldChange<T[keyof T]>] => 
      entry[1] !== undefined
    )
    .map(([field, change]) => [
      mdEscape(field),
      mdEscape(JSON.stringify(change.from)),
      mdEscape(JSON.stringify(change.to)),
    ]);

  return mdTable(headers, rows);
}

export function formatMarkdownReport<T extends Record<string, any>>(
  report: SnapshotReport<T>
): string {
  const lines: string[] = [
    '# Form Snapshot Report',
    '',
    '## Summary',
    '',
    mdTable(
      ['Metric', 'Value'],
      [
        ['Total Snapshots', report.summary.totalSnapshots.toString()],
        ['Date Range', `${report.summary.dateRange.from.toLocaleDateString()} - ${report.summary.dateRange.to.toLocaleDateString()}`],
        ['Versions', report.summary.versions.join(', ')],
        ['Total Changes', report.summary.totalChanges.toString()],
        ['Important Changes', report.summary.importantChanges.toString()],
      ]
    ),
    '',
    '## Snapshots',
    '',
  ];

  // Group snapshots by importance
  const importanceGroups = {
    high: report.snapshots.filter(s => s.importance === 'high'),
    medium: report.snapshots.filter(s => s.importance === 'medium'),
    low: report.snapshots.filter(s => s.importance === 'low'),
  };

  // Add high importance snapshots
  if (importanceGroups.high.length > 0) {
    lines.push('### 🔴 High Importance Changes', '');
    importanceGroups.high.forEach(s => addSnapshotSection(s, lines));
  }

  // Add medium importance snapshots
  if (importanceGroups.medium.length > 0) {
    lines.push('### 🟡 Medium Importance Changes', '');
    importanceGroups.medium.forEach(s => addSnapshotSection(s, lines));
  }

  // Add low importance snapshots in a collapsible section
  if (importanceGroups.low.length > 0) {
    lines.push('### 🟢 Low Importance Changes', '');
    const lowImportanceLines: string[] = [];
    importanceGroups.low.forEach(s => addSnapshotSection(s, lowImportanceLines));
    lines.push(mdDetails('Show low importance changes', lowImportanceLines.join('\n')));
  }

  return lines.join('\n');
}

function addSnapshotSection<T extends Record<string, any>>(
  processedSnapshot: ProcessedSnapshot<T>,
  lines: string[]
): void {
  const { snapshot, changes } = processedSnapshot;

  lines.push(
    `#### Version ${mdEscape(snapshot.version)}`,
    '',
    `*${new Date(snapshot.timestamp).toLocaleString()}*`,
    ''
  );

  if (changes && Object.keys(changes).length > 0) {
    lines.push(
      'Changes:',
      '',
      formatChangesAsTable(changes),
      ''
    );
  }

  if (snapshot.metadata) {
    lines.push(
      'Metadata:',
      '',
      mdCodeBlock(JSON.stringify(snapshot.metadata, null, 2), 'json'),
      ''
    );
  }

  lines.push('---', '');
}

// Example usage:
// interface FormData {
//   name: string;
//   email: string;
//   settings: Record<string, boolean>;
// }
//
// const report = generateReport<FormData>(snapshots, config);
// const markdown = formatMarkdownReport(report);
//
// // Save as .md file
// const blob = new Blob([markdown], { type: 'text/markdown' });
// const url = URL.createObjectURL(blob);
// const a = document.createElement('a');
// a.href = url;
// a.download = 'snapshot-report.md';
// a.click();