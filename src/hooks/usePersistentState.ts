import { useState, useEffect } from 'react';

export function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(`humm_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "humm_${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`humm_${key}`, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error writing localStorage key "humm_${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}
