
import { supabase } from '@/integrations/supabase/client';
import { SafeInsertType, SafeUpdateType, SafeRowType } from '@/types/supabase-extensions';
import logger from '@/utils/logger';
import { hasData } from './supabase-type-helpers';

// Type-safe query helper functions
export async function safeSelect<T extends keyof Database['public']['Tables']>(
  table: T,
  queryBuilder: (query: any) => any,
  errorMessage = 'Database query failed'
): Promise<SafeRowType<T>[] | null> {
  try {
    const query = supabase.from(table);
    const response = await queryBuilder(query);
    
    if (!hasData(response)) {
      logger.error({ message: errorMessage, error: response.error });
      return null;
    }
    
    return response.data as SafeRowType<T>[];
  } catch (err) {
    logger.error({ message: errorMessage, error: err });
    return null;
  }
}

export async function safeSingle<T extends keyof Database['public']['Tables']>(
  table: T,
  queryBuilder: (query: any) => any,
  errorMessage = 'Database query failed'
): Promise<SafeRowType<T> | null> {
  try {
    const query = supabase.from(table);
    const response = await queryBuilder(query).single();
    
    if (!hasData(response)) {
      logger.error({ message: errorMessage, error: response.error });
      return null;
    }
    
    return response.data as SafeRowType<T>;
  } catch (err) {
    logger.error({ message: errorMessage, error: err });
    return null;
  }
}

export async function safeMaybeSingle<T extends keyof Database['public']['Tables']>(
  table: T,
  queryBuilder: (query: any) => any,
  errorMessage = 'Database query failed'
): Promise<SafeRowType<T> | null> {
  try {
    const query = supabase.from(table);
    const response = await queryBuilder(query).maybeSingle();
    
    if (!hasData(response)) {
      logger.error({ message: errorMessage, error: response.error });
      return null;
    }
    
    return response.data as SafeRowType<T>;
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
    const response = await supabase
      .from(table)
      .insert(data as any)
      .select()
      .single();
    
    if (!hasData(response)) {
      logger.error({ message: errorMessage, error: response.error });
      return null;
    }
    
    return response.data as SafeRowType<T>;
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
    const response = await supabase
      .from(table)
      .update(data as any)
      .eq(column as string, value)
      .select()
      .single();
    
    if (!hasData(response)) {
      logger.error({ message: errorMessage, error: response.error });
      return null;
    }
    
    return response.data as SafeRowType<T>;
  } catch (err) {
    logger.error({ message: errorMessage, error: err });
    return null;
  }
}
