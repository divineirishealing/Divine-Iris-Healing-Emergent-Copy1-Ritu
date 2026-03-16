export const safeArray = (value) => (Array.isArray(value) ? value : []);

export const safeObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export const safeString = (value) =>
  typeof value === 'string' ? value : value == null ? '' : String(value);

export const safeNumber = (value, fallback = 0) =>
  typeof value === 'number' && !Number.isNaN(value) ? value : fallback;

export const normalizeListResponse = (data, keys = []) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};
