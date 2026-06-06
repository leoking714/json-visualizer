/**
 * Updates a value in a nested object based on a path string (e.g., 'root.user.name').
 */
export const setValueByPath = (obj: any, path: string, value: any): any => {
  if (path === 'root') return value;

  const parts = path.split('.');
  // Remove 'root'
  parts.shift();

  const newObj = JSON.parse(JSON.stringify(obj));
  let current = newObj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    // Handle array indices
    if (Array.isArray(current)) {
      current = current[parseInt(part)];
    } else {
      current = current[part];
    }
  }

  const lastPart = parts[parts.length - 1];
  if (Array.isArray(current)) {
    current[parseInt(lastPart)] = value;
  } else {
    current[lastPart] = value;
  }

  return newObj;
};

/**
 * Recursively sorts all keys in an object alphabetically.
 */
export const sortObjectKeys = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  const sortedKeys = Object.keys(obj).sort();
  const sortedObj: any = {};

  sortedKeys.forEach((key) => {
    sortedObj[key] = sortObjectKeys(obj[key]);
  });

  return sortedObj;
};
