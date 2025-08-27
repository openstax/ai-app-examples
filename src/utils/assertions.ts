

export const assertString = (value: unknown, error: Error): string => {
  if (typeof value !== 'string') throw error;
  return value;
}

export const assertNumber = (value: unknown, error: Error): number => {
  if (typeof value !== 'number') throw error;
  return value;
}

export const coerceNumber = (value: unknown, error: Error): number => {
  const num = Number(value);
  if (isNaN(num)) throw error;
  return num;
}
