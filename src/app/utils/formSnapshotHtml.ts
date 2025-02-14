import { SnapshotReport, ProcessedSnapshot } from './formSnapshotReport';
import { StateChanges } from './formTypes';

const css = `
<style>
  :root {
    --primary: #3b82f6;
    --success: #22c55e;
    --warning: #eab308;
    --danger: #ef4444;
    --gray: #6b7280;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    color: #1f2937;
  }
  
  @media (prefers-color-scheme: dark) {
    body {
      background-color: #111827;
      color: #f9fafb;
    }
  }
  
  h1, h2, h3, h4 { margin-top: 2rem; }
  
  .card {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 1.5rem;
    margin: 1rem 0;
  }
  
  @media (prefers-color-scheme: dark) {
    .card {
      background: #1f2937;
    }
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }
  
  .table th,
  .table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }
  
  @media (prefers-color-scheme: dark) {
    .table th,
    .table td {
      border-color: #374151;
    }
  }
  
  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .badge-high { background: #fee2e2; color: #dc2626; }
  .badge-medium { background: #fef3c7; color: #d97706; }
  .badge-low { background: #ecfdf5; color: #059669; }
  
  @media (prefers-color-scheme: dark) {
    .badge-high { background: #7f1d1d; color: #fca5a5; }
    .badge-medium { background: #78350f; color: #fcd34d; }
    .badge-low { background: #064e3b; color: #6ee7b7; }
  }
  
  .changes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.375rem;
    margin: 0.5rem 0;
  }
  
  @media (prefers-color-scheme: dark) {
    .changes {
      background: #374151;
    }
  }
  
  .changed-value {
    color: var(--primary);
    font-weight: 500;
  }
  
  details summary {
    cursor: pointer;
    padding: 1rem;
    background: #f3f4f6;
    border-radius: 0.375rem;
  }
  
  @media (prefers-color-scheme: dark) {
    details summary {
      background: #1f2937;
    }
  }
</style>`;

function htmlEscape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatChangesTable<T extends Record<string, any>>(
  changes: StateChanges<T>
): string {
  const rows = Object.entries(changes)
    .filter((entry): entry is [string, NonNullable<StateChanges<T>[keyof T]>] => 
      entry[1] !== undefined
    )
    .map(([field, change]) => `
      <tr>
        <td>${htmlEscape(field)}</td>
        <td><pre>${htmlEscape(JSON.stringify(change.from, null, 2))}</pre></td>
        <td><pre>${htmlEscape(JSON.stringify(change.to, null, 2))}</pre></td>
      </tr>
    `).join('');

  return `
    <table class="table">
      <thead>
        <tr>
          <th>Field</th>
          <th>Previous Value</th>
          <th>New Value</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function formatSnapshotSection<T extends Record<string, any>>(
  processedSnapshot: ProcessedSnapshot<T>
): string {
  const { snapshot, changes, importance } = processedSnapshot;

  const importanceColors = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
  };

  return `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0;">
          Version ${htmlEscape(snapshot.version)}
          <span class="badge badge-${importance}">
            ${importance.charAt(0).toUpperCase() + importance.slice(1)}
          </span>
        </h3>
        <time datetime="${new Date(snapshot.timestamp).toISOString()}">
          ${new Date(snapshot.timestamp).toLocaleString()}
        </time>
      </div>
      
      ${changes && Object.keys(changes).length > 0 ? `
        <div style="margin-top: 1rem;">
          <h4>Changes</h4>
          ${formatChangesTable(changes)}
        </div>
      ` : ''}
      
      ${snapshot.metadata ? `
        <div style="margin-top: 1rem;">
          <h4>Metadata</h4>
          <pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.375rem;">
${htmlEscape(JSON.stringify(snapshot.metadata, null, 2))}
          </pre>
        </div>
      ` : ''}
    </div>
  `;
}

export function formatHtmlReport<T extends Record<string, any>>(
  report: SnapshotReport<T>
): string {
  const importanceGroups = {
    high: report.snapshots.filter(s => s.importance === 'high'),
    medium: report.snapshots.filter(s => s.importance === 'medium'),
    low: report.snapshots.filter(s => s.importance === 'low'),
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form Snapshot Report</title>
  ${css}
</head>
<body>
  <h1>Form Snapshot Report</h1>
  
  <div class="card">
    <h2>Summary</h2>
    <table class="table">
      <tbody>
        <tr>
          <th>Total Snapshots</th>
          <td>${report.summary.totalSnapshots}</td>
        </tr>
        <tr>
          <th>Date Range</th>
          <td>
            ${report.summary.dateRange.from.toLocaleDateString()} - 
            ${report.summary.dateRange.to.toLocaleDateString()}
          </td>
        </tr>
        <tr>
          <th>Versions</th>
          <td>${report.summary.versions.join(', ')}</td>
        </tr>
        <tr>
          <th>Total Changes</th>
          <td>${report.summary.totalChanges}</td>
        </tr>
        <tr>
          <th>Important Changes</th>
          <td>${report.summary.importantChanges}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>Snapshots</h2>
  
  ${importanceGroups.high.length > 0 ? `
    <h3>🔴 High Importance Changes</h3>
    ${importanceGroups.high.map(formatSnapshotSection).join('\n')}
  ` : ''}
  
  ${importanceGroups.medium.length > 0 ? `
    <h3>🟡 Medium Importance Changes</h3>
    ${importanceGroups.medium.map(formatSnapshotSection).join('\n')}
  ` : ''}
  
  ${importanceGroups.low.length > 0 ? `
    <h3>🟢 Low Importance Changes</h3>
    <details>
      <summary>Show low importance changes</summary>
      ${importanceGroups.low.map(formatSnapshotSection).join('\n')}
    </details>
  ` : ''}
</body>
</html>`;
}