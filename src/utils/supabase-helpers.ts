
import { supabase } from '@/integrations/supabase/client';
import { 
  SafeInsertType, 
  SafeUpdateType, 
  SafeRowType,
  LeaderboardEntryArray,
  UserRankResult,
  LeaderboardCountResult 
} from '@/types/supabase-extensions';
import logger from '@/utils/logger';
import { PostgrestFilterBuilder } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Type-safe query helper functions
export async function safeSelect<T extends keyof Database['public']['Tables']>(
  table: T,
  queryBuilder: (query: PostgrestFilterBuilder<Database['public']['Tables'][T]>) => any,
  errorMessage = 'Database query failed'
): Promise<SafeRowType<T>[] | null> {
  try {
    const query = supabase.from(table);
    const { data, error } = await queryBuilder(query as any);
    
    if (error) {
      logger.error({ message: errorMessage, error });
      return null;
    }
    
    return data as SafeRowType<T>[];
  } catch (err) {
    logger.error({ message: errorMessage, error: err });
    return null;
  }
}

export async function safeSingle<T extends keyof Database['public']['Tables']>(
  table: T,
  queryBuilder: (query: PostgrestFilterBuilder<Database['public']['Tables'][T]>) => any,
  errorMessage = 'Database query failed'
): Promise<SafeRowType<T> | null> {
  try {
    const query = supabase.from(table);
    const { data, error } = await queryBuilder(query as any).single();
    
    if (error) {
      logger.error({ message: errorMessage, error });
      return null;
    }
    
    return data as SafeRowType<T>;
  } catch (err) {
    logger.error({ message: errorMessage, error: err });
    return null;
  }
}

export async function safeMaybeSingle<T extends keyof Database['public']['Tables']>(
  table: T,
  queryBuilder: (query: PostgrestFilterBuilder<Database['public']['Tables'][T]>) => any,
  errorMessage = 'Database query failed'
): Promise<SafeRowType<T> | null> {
  try {
    const query = supabase.from(table);
    const { data, error } = await queryBuilder(query as any).maybeSingle();
    
    if (error) {
      logger.error({ message: errorMessage, error });
      return null;
    }
    
    return data as SafeRowType<T>;
  } catch (err) {
    logger.error({ message: errorMessage, error: err });
    return null;
  }
}

export async function safeInsert<T extends keyof Database['public']['Tables']>(
  table: T,
  data: SafeInsertType<T>,
  errorMessage = 'Insert failed'
): Promise<SafeRowType<T> | null> {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data as any)
      .select()
      .single();
    
    if (error) {
      logger.error({ message: errorMessage, error });
      return null;
    }
    
    return result as SafeRowType<T>;
  } catch (err) {
    logger.error({ message: errorMessage, error: err });
    return null;
  }
}

export async function safeUpdate<T extends keyof Database['public']['Tables']>(
  table: T,
  data: SafeUpdateType<T>,
  column: keyof SafeRowType<T>,
  value: any,
  errorMessage = 'Update failed'
): Promise<SafeRowType<T> | null> {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data as any)
      .eq(column as string, value)
      .select()
      .single();
    
    if (error) {
      logger.error({ message: errorMessage, error });
      return null;
    }
    
    return result as SafeRowType<T>;
  } catch (err) {
    logger.error({ message: errorMessage, error: err });
    return null;
  }
}

// New helper function to safely check if a response has data
export function isValidResponse<T>(response: { data: T | null, error: any }): response is { data: T, error: null } {
  return response.data !== null && response.error === null;
}

// New helper function to extract data safely from any Supabase response
export function extractData<T>(response: { data: T | null, error: any }, defaultValue: T | null = null): T | null {
  if (isValidResponse(response)) {
    return response.data;
  }
  if (response.error) {
    logger.error({ message: 'Error in database response', error: response.error });
  }
  return defaultValue;
}

// Helper functions for RPC calls
export async function safeRPCGetLeaderboard(
  params: {
    p_operation?: string;
    p_min1?: number;
    p_max1?: number;
    p_min2?: number;
    p_max2?: number;
    p_grade?: string | null;
    p_page?: number;
    p_page_size?: number;
  }
): Promise<LeaderboardEntryArray | null> {
  try {
    const { data, error } = await supabase.rpc('get_leaderboard', params);
    
    if (error) {
      logger.error({ message: 'Failed to get leaderboard', error });
      return null;
    }
    
    return Array.isArray(data) ? data as LeaderboardEntryArray : [];
  } catch (err) {
    logger.error({ message: 'Error in leaderboard RPC call', error: err });
    return null;
  }
}

export async function safeRPCGetLeaderboardCount(
  params: {
    p_operation?: string;
    p_min1?: number;
    p_max1?: number;
    p_min2?: number;
    p_max2?: number;
    p_grade?: string | null;
  }
): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_leaderboard_count', params);
    
    if (error) {
      logger.error({ message: 'Failed to get leaderboard count', error });
      return 0;
    }
    
    return typeof data === 'number' ? data : 0;
  } catch (err) {
    logger.error({ message: 'Error in leaderboard count RPC call', error: err });
    return 0;
  }
}

export async function safeRPCGetUserRank(
  params: {
    p_profile_id: string;
    p_operation?: string;
    p_min1?: number;
    p_max1?: number;
    p_min2?: number;
    p_max2?: number;
    p_grade?: string | null;
  }
): Promise<number | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_rank', params);
    
    if (error) {
      logger.error({ message: 'Failed to get user rank', error });
      return null;
    }
    
    return typeof data === 'number' ? data : null;
  } catch (err) {
    logger.error({ message: 'Error in user rank RPC call', error: err });
    return null;
  }
}
