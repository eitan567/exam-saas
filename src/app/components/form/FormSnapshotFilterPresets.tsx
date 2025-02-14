'use client';

import React, { useState } from 'react';
import { ProcessedSnapshot, FilterCriteria } from '@/app/types/formFilter';
import Button from '../Button';
import Card from '../Card';

interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  criteria: FilterCriteria;
}

interface FormSnapshotFilterPresetsProps {
  snapshots: ProcessedSnapshot[];
  onApplyFilter: (filter: FilterCriteria) => void;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'recent',
    name: 'Recent Changes',
    description: 'Show snapshots from the last 24 hours',
    criteria: {
      field: 'timestamp',
      operator: 'gte',
      value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    }
  },
  {
    id: 'withChanges',
    name: 'With Changes',
    description: 'Show snapshots with recorded changes',
    criteria: {
      field: 'metadata.hasChanges',
      operator: 'eq',
      value: true,
    }
  }
];

const EMPTY_FILTER: FilterCriteria = {
  field: '',
  operator: 'eq',
  value: null
};

export const FormSnapshotFilterPresets: React.FC<FormSnapshotFilterPresetsProps> = ({
  snapshots,
  onApplyFilter
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presets] = useState<FilterPreset[]>(DEFAULT_PRESETS);

  const handlePresetClick = (preset: FilterPreset) => {
    const isSelected = selectedPreset === preset.id;
    setSelectedPreset(isSelected ? null : preset.id);
    onApplyFilter(isSelected ? EMPTY_FILTER : preset.criteria);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Filter Presets</h3>
      <div className="grid grid-cols-1 gap-2">
        {presets.map((preset) => (
          <Card 
            key={preset.id}
            className={`
              cursor-pointer transition-colors
              ${selectedPreset === preset.id
                ? 'bg-blue-50 border-blue-200'
                : 'hover:bg-gray-50'
              }
            `}
            onClick={() => handlePresetClick(preset)}
          >
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900">{preset.name}</h4>
              {preset.description && (
                <p className="mt-1 text-xs text-gray-500">{preset.description}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FormSnapshotFilterPresets;