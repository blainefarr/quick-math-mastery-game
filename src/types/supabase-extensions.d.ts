
// Type declarations to extend and fix Supabase types
import { Database } from '@/integrations/supabase/types';
import { PostgrestError } from '@supabase/supabase-js';

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
    debug(message: string | object, ...args: any[]): void;
    info(message: string | object, ...args: any[]): void;
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

// Add extra type safety for Supabase responses
export type PostgrestSingleResultChecked<T> = { 
  data: T; 
  error: null;
} | {
  data: null;
  error: PostgrestError;
};

export type PostgrestMaybeResultChecked<T> = { 
  data: T | null; 
  error: null;
} | {
  data: null;
  error: PostgrestError;
};

// Type-safe wrapper around Supabase responses
export function ensureData<T>(response: { data: T | null, error: PostgrestError | null }): T | null {
  if (response.error) {
    return null;
  }
  return response.data;
}

// New function types to ensure type safety
export type SafeSelectFn = <T extends keyof Database['public']['Tables']>(
  table: T,
  queryBuilder: (query: any) => any,
  errorMessage?: string
) => Promise<SafeRowType<T>[] | null>;

export type SafeSingleFn = <T extends keyof Database['public']['Tables']>(
  table: T,
  queryBuilder: (query: any) => any,
  errorMessage?: string
) => Promise<SafeRowType<T> | null>;

// Special types for RPC function returns
export type LeaderboardEntry = {
  rank: number;
  user_id: string;
  profile_id: string;
  name: string;
  grade: string | null;
  best_score: number;
  operation: string;
  min1: number;
  max1: number;
  min2: number;
  max2: number;
};

export type LeaderboardEntryArray = LeaderboardEntry[];

export type UserRankResult = number;
export type LeaderboardCountResult = number;

// RPC function interface for TypeScript reflection
export interface SupabaseCustomFunctions {
  submit_score(args: {
    p_profile_id: string;
    p_score: number;
    p_operation: string;
    p_min1: number;
    p_max1: number;
    p_min2: number;
    p_max2: number;
    p_duration: number;
    p_focus_number: number | null;
    p_allow_negatives: boolean;
    p_typing_speed: number | null;
    p_total_speed: number | null;
    p_adjusted_math_speed: number | null;
  }): Promise<{ data: string; error: null } | { data: null; error: any }>;
}
