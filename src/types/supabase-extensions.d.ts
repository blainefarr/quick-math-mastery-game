
// Type declarations to extend and fix Supabase types
import { Database } from '@/integrations/supabase/types';
import { PostgrestError, PostgrestSingleResponse, PostgrestMaybeSingleResponse } from '@supabase/supabase-js';

// Helper type to safely access Supabase query responses
export type SafeResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

// Type guard functions for Supabase responses
export function isError<T>(response: SafeResponse<T>): response is { data: null; error: PostgrestError } {
  return response.error !== null;
}

export function hasData<T>(response: SafeResponse<T>): response is { data: T; error: null } {
  return response.data !== null && response.error === null;
}

// Extended logger interface to add missing methods
declare module '@/utils/logger' {
  interface Logger {
    warn(message: string | object, ...args: any[]): void;
    error(message: string | object, ...args: any[]): void;
  }

  const logger: Logger;
  export default logger;
}

// Utility types for safer database access
export type SafeInsertType<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

export type SafeUpdateType<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

export type SafeRowType<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];
