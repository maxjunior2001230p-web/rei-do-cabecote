import { useCallback, useState } from 'react';

const compareValues = (left, right) => {
  if (left == null && right == null) return 0;
  if (left == null) return -1;
  if (right == null) return 1;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  if (left instanceof Date && right instanceof Date) return left.getTime() - right.getTime();
  const leftDate = Date.parse(left);
  const rightDate = Date.parse(right);
  if (Number.isFinite(leftDate) && Number.isFinite(rightDate) && typeof left === 'string' && typeof right === 'string') {
    return leftDate - rightDate;
  }
  return String(left).localeCompare(String(right), 'pt-BR', { numeric: true, sensitivity: 'base' });
};

const getValue = (item, path) => path.split('.').reduce((value, key) => value?.[key], item);

const useManagementSort = (initialField, sortOptions) => {
  const [sortField, setSortField] = useState(initialField);
  const [sortOrder, setSortOrder] = useState(1);
  const sortItems = useCallback((items) => [...items].sort((left, right) => (
    compareValues(getValue(left, sortField), getValue(right, sortField)) * sortOrder
  )), [sortField, sortOrder]);

  return { sortField, sortOrder, setSortField, setSortOrder, sortOptions, sortItems };
};

export default useManagementSort;
