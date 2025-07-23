/**
 * Custom hook for debouncing actions to prevent rapid successive calls
 */

import { useState, useCallback } from 'react';

interface DebouncedActionOptions {
  delay?: number; // Delay in milliseconds
  showToast?: boolean; // Whether to show feedback toast
}

/**
 * Hook for debouncing action execution to prevent duplicate actions
 * @param action - The action function to debounce
 * @param options - Configuration options
 * @returns Object with execute function and loading state
 */
export const useDebouncedAction = <T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  options: DebouncedActionOptions = {}
) => {
  const { delay = 1000, showToast = false } = options;
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (...args: T): Promise<R | null> => {
    if (isLoading) {
      if (showToast) {
        // Optional: show toast that action is already in progress
        console.warn('Action already in progress');
      }
      return null;
    }

    setIsLoading(true);
    try {
      const result = await action(...args);
      return result;
    } catch (error) {
      throw error;
    } finally {
      // Reset loading state after delay
      setTimeout(() => {
        setIsLoading(false);
      }, delay);
    }
  }, [action, isLoading, delay, showToast]);

  return {
    execute,
    isLoading
  };
};

/**
 * Simple function-based debouncing utility for one-off use
 */
export const createDebouncedFunction = <T extends unknown[]>(
  fn: (...args: T) => void | Promise<void>,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
};
