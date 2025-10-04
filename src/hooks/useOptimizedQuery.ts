/**
 * Hook otimizado para queries Supabase com cache e debounce - ETAPA 2
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

interface QueryOptions<T> {
  cacheKey: string;
  cacheTTL?: number; // em ms
  debounceMs?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// Cache simples em memória (ETAPA 2 - depois migrar para Redis)
const queryCache = new Map<string, { data: any; timestamp: number }>();

export function useOptimizedQuery<T>(
  queryFn: () => Promise<T>,
  options: QueryOptions<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const {
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutos default
    debounceMs = 0,
    onSuccess,
    onError
  } = options;

  const executeQuery = useCallback(async () => {
    // Verificar cache primeiro
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      logger.debug('Query cache hit', 'useOptimizedQuery', { cacheKey });
      setData(cached.data);
      setLoading(false);
      onSuccess?.(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      const result = await queryFn();
      
      if (!mountedRef.current) return;

      const duration = Date.now() - startTime;
      
      // Log performance
      logger.info('Query executed', 'useOptimizedQuery', {
        cacheKey,
        duration: `${duration}ms`,
        cached: false
      });

      // Salvar no cache
      queryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      setData(result);
      setLoading(false);
      onSuccess?.(result);
    } catch (err) {
      if (!mountedRef.current) return;

      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Query failed', 'useOptimizedQuery', {
        cacheKey,
        error: error.message
      });

      setError(error);
      setLoading(false);
      onError?.(error);
    }
  }, [queryFn, cacheKey, cacheTTL, onSuccess, onError]);

  useEffect(() => {
    mountedRef.current = true;

    if (debounceMs > 0) {
      timeoutRef.current = setTimeout(executeQuery, debounceMs);
    } else {
      executeQuery();
    }

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [executeQuery, debounceMs]);

  const refetch = useCallback(() => {
    // Invalidar cache e refazer query
    queryCache.delete(cacheKey);
    executeQuery();
  }, [cacheKey, executeQuery]);

  return {
    data,
    loading,
    error,
    refetch
  };
}

/**
 * Limpar cache manualmente
 */
export function clearQueryCache(cacheKey?: string) {
  if (cacheKey) {
    queryCache.delete(cacheKey);
    logger.debug('Cache cleared', 'clearQueryCache', { cacheKey });
  } else {
    queryCache.clear();
    logger.debug('All cache cleared', 'clearQueryCache');
  }
}
