'use client';

import { useMemo } from 'react';
import { ProcessedSnapshot, FilterSuggestion, FilterCriteria } from '@/app/types/formFilter';

export function useFilterSuggestions(snapshots: ProcessedSnapshot[]): FilterSuggestion[] {
  return useMemo(() => {
    const suggestions: FilterSuggestion[] = [
      {
        id: 'last-24h',
        label: 'Last 24 Hours',
        description: 'Show snapshots from the last 24 hours',
        count: snapshots.filter(s => {
          const date = new Date(s.timestamp);
          const now = new Date();
          const diff = now.getTime() - date.getTime();
          return diff <= 24 * 60 * 60 * 1000;
        }).length,
        filter: {
          field: 'timestamp',
          operator: 'gte',
          value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        id: 'has-changes',
        label: 'With Changes',
        description: 'Show snapshots with recorded changes',
        count: snapshots.filter(s => s.metadata.hasChanges).length,
        filter: {
          field: 'metadata.hasChanges',
          operator: 'eq',
          value: true
        }
      }
    ];

    return suggestions;
  }, [snapshots]);
}