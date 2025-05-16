
/**
 * Type utility helpers for Supabase queries
 */

import { PostgrestError, PostgrestResponse } from '@supabase/supabase-js';
import logger from '@/utils/logger';

/**
 * Type guard to check if a response has data (not an error)
 */
export function hasData<T>(response: { data: T | null, error: PostgrestError | null }): 
  response is { data: T, error: null } {
  return response.data !== null && response.error === null;
}

/**
 * Type guard to check if a response has an error
 */
export function hasError<T>(response: { data: T | null, error: PostgrestError | null }): 
  response is { data: null, error: PostgrestError } {
  return response.error !== null;
}

/**
 * Helper function to safely access data from Supabase response
 * Returns the data if available or null if there's an error
 */
export function safeData<T>(
  response: { data: T | null, error: PostgrestError | null }, 
  errorMessage: string = 'Database query failed'
): T | null {
  if (hasError(response)) {
    logger.error({ message: errorMessage, error: response.error });
    return null;
  }
  return response.data;
}

/**
 * Type-safe check for whether a value exists in an object
 */
export function hasProperty<T, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return obj !== null && obj !== undefined && Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Safely extract a value from a response that might be an error or valid data
 * This is useful for handling cases where TypeScript doesn't know which type it is
 */
export function safeExtract<T, K extends string>(
  result: PostgrestResponse<any> | { [key in K]: T } | any,
  property: K,
  defaultValue: T | null = null
): T | null {
  // If it's undefined or null
  if (!result) return defaultValue;
  
  // If it has an error property, it's likely a PostgrestResponse with an error
  if (hasProperty(result, 'error') && result.error !== null) {
    return defaultValue;
  }
  
  // If it has the specified property
  if (hasProperty(result, property)) {
    return result[property] as T;
  }
  
  // If it has a data property that might contain our property
  if (hasProperty(result, 'data') && result.data) {
    const data = result.data;
    if (typeof data === 'object' && hasProperty(data, property)) {
      return data[property] as T;
    }
  }
  
  return defaultValue;
}
