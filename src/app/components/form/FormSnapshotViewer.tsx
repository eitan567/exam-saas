import React, { useMemo } from 'react';
import { FormSnapshot, SnapshotFormConfig } from '@/app/utils/formSnapshot';
import { StateChanges } from '@/app/utils/formTypes';
import Card from '../Card';

interface FormSnapshotViewerProps<T extends Record<string, any>> {
  snapshot: FormSnapshot<T>;
  config?: SnapshotFormConfig<T>;
  previousSnapshot?: FormSnapshot<T>;
  className?: string;
  highlightChanges?: boolean;
  expandedByDefault?: boolean;
  onRestore?: (snapshot: FormSnapshot<T>) => void;
}

interface FieldViewerProps {
  name: string;
  value: any;
  previousValue?: any;
  type?: string;
  highlightChanges?: boolean;
  isImportant?: boolean;
}

const FieldViewer: React.FC<FieldViewerProps> = ({
  name,
  value,
  previousValue,
  type = 'text',
  highlightChanges = false,
  isImportant = false,
}) => {
  const hasChanged = highlightChanges && JSON.stringify(value) !== JSON.stringify(previousValue);

  const formattedValue = useMemo(() => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }, [value]);

  return (
    <div
      className={`
        p-2 rounded-md
        ${hasChanged ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}
        ${isImportant ? 'border-l-4 border-blue-500 pl-3' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {name}
          {isImportant && (
            <span className="ml-2 text-xs text-blue-500">(Important)</span>
          )}
        </label>
        {hasChanged && (
          <span className="text-xs text-yellow-600 dark:text-yellow-400">
            Changed
          </span>
        )}
      </div>
      <div className="mt-1">
        {hasChanged ? (
          <div className="space-y-1">
            <div className="text-sm line-through text-gray-500 dark:text-gray-400">
              {JSON.stringify(previousValue)}
            </div>
            <div className="text-sm font-medium">{formattedValue}</div>
          </div>
        ) : (
          <div className="text-sm">{formattedValue}</div>
        )}
      </div>
    </div>
  );
};

function FormSnapshotViewer<T extends Record<string, any>>({
  snapshot,
  config,
  previousSnapshot,
  className = '',
  highlightChanges = true,
  expandedByDefault = true,
  onRestore,
}: FormSnapshotViewerProps<T>) {
  const [isExpanded, setIsExpanded] = React.useState(expandedByDefault);

  const changes: StateChanges<T> | undefined = useMemo(() => {
    if (!previousSnapshot || !highlightChanges) return undefined;

    const changes: StateChanges<T> = {};
    Object.keys(snapshot.state).forEach((key) => {
      const field = key as keyof T;
      if (
        JSON.stringify(snapshot.state[field]) !==
        JSON.stringify(previousSnapshot.state[field])
      ) {
        changes[field] = {
          from: previousSnapshot.state[field],
          to: snapshot.state[field],
        };
      }
    });
    return changes;
  }, [snapshot, previousSnapshot, highlightChanges]);

  return (
    <Card className={className}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Snapshot {snapshot.version}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {new Date(snapshot.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {onRestore && (
              <button
                type="button"
                onClick={() => onRestore(snapshot)}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Restore
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg
                className={`h-5 w-5 transform transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="space-y-4">
            {/* State */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                State
              </h4>
              <div className="space-y-2">
                {Object.entries(snapshot.state).map(([key, value]) => (
                  <FieldViewer
                    key={key}
                    name={key}
                    value={value}
                    previousValue={previousSnapshot?.state[key]}
                    type={config?.[key]?.type}
                    highlightChanges={highlightChanges && !!changes?.[key]}
                    isImportant={config?.[key]?.important}
                  />
                ))}
              </div>
            </div>

            {/* Metadata */}
            {snapshot.metadata && Object.keys(snapshot.metadata).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Metadata
                </h4>
                <pre className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                  {JSON.stringify(snapshot.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default FormSnapshotViewer;