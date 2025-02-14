'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/app/components/Modal';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';
import { ProcessedSnapshot } from '@/app/types/formFilter';

interface FormSnapshotCompareProps {
  snapshots: {
    left: ProcessedSnapshot;
    right: ProcessedSnapshot;
  };
  isOpen: boolean;
  onClose: () => void;
}

interface DiffResult {
  type: 'added' | 'removed' | 'changed';
  path: string;
  leftValue?: any;
  rightValue?: any;
}

const FormSnapshotCompare: React.FC<FormSnapshotCompareProps> = ({
  snapshots,
  isOpen,
  onClose
}) => {
  const [differences, setDifferences] = useState<DiffResult[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const findDifferences = () => {
      const diffs: DiffResult[] = [];
      const { left, right } = snapshots;

      // Compare data objects
      const compareObjects = (leftObj: any, rightObj: any, path: string = '') => {
        const allKeys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)]);

        allKeys.forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          const leftValue = leftObj[key];
          const rightValue = rightObj[key];

          if (!(key in rightObj)) {
            diffs.push({
              type: 'removed',
              path: currentPath,
              leftValue,
            });
          } else if (!(key in leftObj)) {
            diffs.push({
              type: 'added',
              path: currentPath,
              rightValue,
            });
          } else if (typeof leftValue !== typeof rightValue) {
            diffs.push({
              type: 'changed',
              path: currentPath,
              leftValue,
              rightValue,
            });
          } else if (typeof leftValue === 'object' && leftValue !== null) {
            compareObjects(leftValue, rightValue, currentPath);
          } else if (leftValue !== rightValue) {
            diffs.push({
              type: 'changed',
              path: currentPath,
              leftValue,
              rightValue,
            });
          }
        });
      };

      compareObjects(left.data, right.data);
      setDifferences(diffs);
    };

    findDifferences();
  }, [isOpen, snapshots]);

  const getDiffColor = (type: DiffResult['type']) => {
    switch (type) {
      case 'added':
        return 'text-green-600';
      case 'removed':
        return 'text-red-600';
      case 'changed':
        return 'text-yellow-600';
      default:
        return '';
    }
  };

  const formatValue = (value: any): string => {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card className="max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Compare Snapshots</h3>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="space-y-4">
            {differences.length === 0 ? (
              <p className="text-gray-500">No differences found.</p>
            ) : (
              differences.map((diff, index) => (
                <div key={index} className={`py-2 ${getDiffColor(diff.type)}`}>
                  <p className="font-medium">{diff.path}</p>
                  {diff.type === 'changed' && (
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <div>
                        <p className="text-sm text-gray-500">Old value:</p>
                        <pre className="mt-1 text-sm bg-gray-50 p-2 rounded">
                          {formatValue(diff.leftValue)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">New value:</p>
                        <pre className="mt-1 text-sm bg-gray-50 p-2 rounded">
                          {formatValue(diff.rightValue)}
                        </pre>
                      </div>
                    </div>
                  )}
                  {diff.type === 'added' && (
                    <div className="mt-1">
                      <p className="text-sm text-gray-500">Added value:</p>
                      <pre className="mt-1 text-sm bg-gray-50 p-2 rounded">
                        {formatValue(diff.rightValue)}
                      </pre>
                    </div>
                  )}
                  {diff.type === 'removed' && (
                    <div className="mt-1">
                      <p className="text-sm text-gray-500">Removed value:</p>
                      <pre className="mt-1 text-sm bg-gray-50 p-2 rounded">
                        {formatValue(diff.leftValue)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </Modal>
  );
};

export default FormSnapshotCompare;