'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProcessedSnapshot, FilterCriteria, FilterSuggestion } from '@/app/types/formFilter';
import { useFilterSuggestions } from '@/app/hooks/useFilterSuggestions';

interface FormSnapshotFilterSuggestionsProps {
  snapshots: ProcessedSnapshot[];
  onApplyFilter: (filter: FilterCriteria) => void;
}

const FormSnapshotFilterSuggestions: React.FC<FormSnapshotFilterSuggestionsProps> = ({
  snapshots,
  onApplyFilter
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<FilterSuggestion | null>(null);
  const suggestions: FilterSuggestion[] = useFilterSuggestions(snapshots);

  const handleSuggestionClick = (suggestion: FilterSuggestion): void => {
    setSelectedSuggestion(suggestion);
    onApplyFilter(suggestion.filter);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Suggested Filters</h3>
      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence>
          {suggestions.map((suggestion: FilterSuggestion) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`
                p-3 rounded-lg cursor-pointer transition-colors
                ${selectedSuggestion?.id === suggestion.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white hover:bg-gray-50 border-gray-200'
                }
                border
              `}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {suggestion.label}
                </span>
                {suggestion.count > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {suggestion.count}
                  </span>
                )}
              </div>
              {suggestion.description && (
                <p className="mt-1 text-xs text-gray-500">
                  {suggestion.description}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FormSnapshotFilterSuggestions;