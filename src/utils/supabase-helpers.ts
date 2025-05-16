
import { supabase } from '@/integrations/supabase/client';
import { SafeInsertType, SafeUpdateType, SafeRowType } from '@/types/supabase-extensions';
import logger from '@/utils/logger';

// Type-safe query helper functions
export async function safeSelect<T extends keyof Database['public']['Tables']>(
  table: T,
  queryBuilder: (query: any) => any,
  errorMessage = 'Database query failed'
): Promise<SafeRowType<T>[] | null> {
  try {
    const query = supabase.from(table);
    const { data, error } = await queryBuilder(query);
    
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
  queryBuilder: (query: any) => any,
  errorMessage = 'Database query failed'
): Promise<SafeRowType<T> | null> {
  try {
    const query = supabase.from(table);
    const { data, error } = await queryBuilder(query).single();
    
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
  queryBuilder: (query: any) => any,
  errorMessage = 'Database query failed'
): Promise<SafeRowType<T> | null> {
  try {
    const query = supabase.from(table);
    const { data, error } = await queryBuilder(query).maybeSingle();
    
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
