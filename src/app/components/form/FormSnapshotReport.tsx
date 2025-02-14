'use client';

import React, { useState, useMemo } from 'react';
import { ProcessedSnapshot, FilterCriteria } from '@/app/types/formFilter';
import { FormSnapshotSearch } from './FormSnapshotSearch';
import Card from '../Card';
import Button from '../Button';

interface SnapshotReport {
  snapshots: ProcessedSnapshot[];
  metadata: {
    totalCount: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

interface FormSnapshotReportProps {
  report: SnapshotReport;
}

type FieldValue = string | number | boolean | null | undefined;

const getFieldValue = (obj: any, path: string[]): FieldValue => {
  let value: any = obj;
  for (const key of path) {
    if (value === null || value === undefined) return undefined;
    value = value[key];
  }
  return value;
};

const compareValues = (value: FieldValue, filterValue: string, operator: FilterCriteria['operator']): boolean => {
  if (value === null || value === undefined) return false;
  
  const stringValue = String(value).toLowerCase();
  const filterStringValue = String(filterValue).toLowerCase();

  switch (operator) {
    case 'eq':
      return stringValue === filterStringValue;
    case 'neq':
      return stringValue !== filterStringValue;
    case 'gt':
      return Number(value) > Number(filterValue);
    case 'gte':
      return Number(value) >= Number(filterValue);
    case 'lt':
      return Number(value) < Number(filterValue);
    case 'lte':
      return Number(value) <= Number(filterValue);
    case 'contains':
      return stringValue.includes(filterStringValue);
    case 'startsWith':
      return stringValue.startsWith(filterStringValue);
    case 'endsWith':
      return stringValue.endsWith(filterStringValue);
    default:
      return false;
  }
};

const FormSnapshotReport: React.FC<FormSnapshotReportProps> = ({ report }) => {
  const [filteredSnapshots, setFilteredSnapshots] = useState<ProcessedSnapshot[]>(report.snapshots);

  const handleFiltersChange = (filter: FilterCriteria) => {
    if (!filter.field || !filter.value) {
      setFilteredSnapshots(report.snapshots);
      return;
    }

    const filtered = report.snapshots.filter(snapshot => {
      const path = filter.field.split('.');
      const value = getFieldValue(snapshot, path);
      return compareValues(value, filter.value, filter.operator);
    });

    setFilteredSnapshots(filtered);
  };

  const statistics = useMemo(() => {
    return {
      total: report.metadata.totalCount,
      filtered: filteredSnapshots.length,
      dateRange: report.metadata.dateRange,
    };
  }, [report.metadata, filteredSnapshots.length]);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Total Snapshots</h4>
            <p className="mt-1 text-2xl font-semibold">{statistics.total}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Filtered Snapshots</h4>
            <p className="mt-1 text-2xl font-semibold">{statistics.filtered}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Date Range</h4>
            <p className="mt-1 text-sm">
              {new Date(statistics.dateRange.start).toLocaleDateString()} - 
              {new Date(statistics.dateRange.end).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <FormSnapshotSearch
        snapshots={report.snapshots}
        onApplyFilter={handleFiltersChange}
      />

      {/* Snapshots List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Snapshots</h3>
        <div className="space-y-2">
          {filteredSnapshots.map(snapshot => (
            <Card key={snapshot.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">
                    {new Date(snapshot.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">ID: {snapshot.id}</p>
                </div>
                <Button variant="secondary" size="sm">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormSnapshotReport;