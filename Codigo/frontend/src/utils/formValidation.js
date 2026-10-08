export const getMissingRequiredFields = (fields) => Object.entries(fields)
  .filter(([, value]) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    return typeof value === 'number' && Number.isNaN(value);
  })
  .map(([label]) => label);
