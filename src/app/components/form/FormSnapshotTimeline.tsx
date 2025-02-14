import React, { useMemo } from 'react';
import { FormSnapshot, SnapshotFormConfig } from '@/app/utils/formSnapshot';
import { StateChanges } from '@/app/utils/formTypes';
import Card from '../Card';

interface FormSnapshotTimelineProps<T extends Record<string, any>> {
  snapshots: FormSnapshot<T>[];
  config?: SnapshotFormConfig<T>;
  className?: string;
  onSnapshotSelect?: (snapshot: FormSnapshot<T>) => void;
  selectedSnapshotId?: string;
}

interface TimelineItemProps<T extends Record<string, any>> {
  snapshot: FormSnapshot<T>;
  previousSnapshot?: FormSnapshot<T>;
  config?: SnapshotFormConfig<T>;
  isSelected?: boolean;
  onClick?: () => void;
}

const TimelineItem = <T extends Record<string, any>>({
  snapshot,
  previousSnapshot,
  config,
  isSelected,
  onClick,
}: TimelineItemProps<T>) => {
  const changes = useMemo(() => {
    if (!previousSnapshot) return undefined;

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
  }, [snapshot, previousSnapshot]);

  const importantChanges = useMemo(() => {
    if (!changes || !config) return [];
    return Object.entries(changes)
      .filter(([field]) => config[field]?.important)
      .map(([field]) => field);
  }, [changes, config]);

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-lg transition-all
        ${
          isSelected
            ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Version {snapshot.version}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(snapshot.timestamp).toLocaleString()}
          </p>
        </div>
        {snapshot.metadata?.auto && (
          <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
            Auto
          </span>
        )}
      </div>

      {changes && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Changed fields: {Object.keys(changes).length}
          </div>
          {importantChanges.length > 0 && (
            <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Important changes: {importantChanges.join(', ')}
            </div>
          )}
        </div>
      )}
    </button>
  );
};

function FormSnapshotTimeline<T extends Record<string, any>>({
  snapshots,
  config,
  className = '',
  onSnapshotSelect,
  selectedSnapshotId,
}: FormSnapshotTimelineProps<T>) {
  const sortedSnapshots = useMemo(
    () => [...snapshots].sort((a, b) => b.timestamp - a.timestamp),
    [snapshots]
  );

  return (
    <Card className={className}>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Snapshot History
        </h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Timeline items */}
          <div className="space-y-4">
            {sortedSnapshots.map((snapshot, index) => (
              <div key={snapshot.id} className="relative pl-8">
                {/* Timeline dot */}
                <div
                  className={`
                    absolute left-0 top-4 w-8 h-8 rounded-full flex items-center justify-center
                    ${
                      index === 0
                        ? 'bg-green-100 dark:bg-green-900/20'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }
                  `}
                >
                  <div
                    className={`
                      w-3 h-3 rounded-full
                      ${
                        index === 0
                          ? 'bg-green-500'
                          : 'bg-gray-400 dark:bg-gray-500'
                      }
                    `}
                  />
                </div>

                <TimelineItem
                  snapshot={snapshot}
                  previousSnapshot={sortedSnapshots[index + 1]}
                  config={config}
                  isSelected={snapshot.id === selectedSnapshotId}
                  onClick={() => onSnapshotSelect?.(snapshot)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default FormSnapshotTimeline;

// Example usage:
// const ExampleTimeline = () => {
//   const [selectedSnapshot, setSelectedSnapshot] = useState<string>();
//
//   return (
//     <div className="grid grid-cols-2 gap-4">
//       <FormSnapshotTimeline
//         snapshots={snapshots}
//         config={formConfig}
//         selectedSnapshotId={selectedSnapshot}
//         onSnapshotSelect={(snapshot) => setSelectedSnapshot(snapshot.id)}
//       />
//       {selectedSnapshot && (
//         <FormSnapshotViewer
//           snapshot={snapshots.find(s => s.id === selectedSnapshot)!}
//           config={formConfig}
//           previousSnapshot={snapshots.find(
//             s => s.timestamp < selectedSnapshot.timestamp
//           )}
//         />
//       )}
//     </div>
//   );
// };