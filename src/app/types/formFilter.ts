export type FilterOperator = 
  | 'eq' 
  | 'neq' 
  | 'gt' 
  | 'gte' 
  | 'lt' 
  | 'lte' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith';

export interface FilterCriteria {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface ProcessedSnapshot {
  id: string;
  timestamp: string;
  data: Record<string, any>;
  metadata: {
    type: string;
    version: string;
    hasChanges?: boolean;
    [key: string]: any;
  };
}

export interface FilterSuggestion {
  id: string;
  label: string;
  description?: string;
  filter: FilterCriteria;
  count: number;
}

export const FILTER_OPERATORS: { [key in FilterOperator]: string } = {
  eq: 'Equals',
  neq: 'Not equals',
  gt: 'Greater than',
  gte: 'Greater than or equal',
  lt: 'Less than',
  lte: 'Less than or equal',
  contains: 'Contains',
  startsWith: 'Starts with',
  endsWith: 'Ends with'
};