'use client';

import React, { useState, useMemo } from 'react';
import { ProcessedSnapshot, FilterCriteria, FilterOperator, FILTER_OPERATORS } from '@/app/types/formFilter';
import Card from '../Card';
import Button from '../Button';

interface FormSnapshotSearchProps {
  snapshots: ProcessedSnapshot[];
  onApplyFilter: (filter: FilterCriteria) => void;
}

const EMPTY_FILTER: FilterCriteria = {
  field: '',
  operator: 'eq',
  value: ''
};

export const FormSnapshotSearch: React.FC<FormSnapshotSearchProps> = ({
  snapshots,
  onApplyFilter
}) => {
  const [filter, setFilter] = useState<FilterCriteria>(EMPTY_FILTER);

  const fields = useMemo(() => {
    const fieldSet = new Set<string>();
    snapshots.forEach(snapshot => {
      const addFields = (obj: any, prefix = '') => {
        Object.keys(obj).forEach(key => {
          const fullPath = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            addFields(obj[key], fullPath);
          } else {
            fieldSet.add(fullPath);
          }
        });
      };
      addFields(snapshot.data);
      addFields(snapshot.metadata, 'metadata');
    });
    return Array.from(fieldSet).sort();
  }, [snapshots]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilter(filter);
  };

  const handleReset = () => {
    setFilter(EMPTY_FILTER);
    onApplyFilter(EMPTY_FILTER);
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Field</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filter.field}
              onChange={e => setFilter(prev => ({ ...prev, field: e.target.value }))}
            >
              <option value="">Select a field</option>
              {fields.map(field => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Operator</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filter.operator}
              onChange={e => setFilter(prev => ({ ...prev, operator: e.target.value as FilterOperator }))}
            >
              {Object.entries(FILTER_OPERATORS).map(([op, label]) => (
                <option key={op} value={op}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Value</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filter.value}
              onChange={e => setFilter(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Enter filter value"
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" variant="primary" className="flex-1">
              Apply Filter
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default FormSnapshotSearch;