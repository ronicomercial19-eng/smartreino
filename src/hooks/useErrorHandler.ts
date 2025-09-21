/**
 * Hook para tratamento padronizado de erros
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorState {
  error: Error | null;
  isError: boolean;
}

export function useErrorHandler() {
  const { toast } = useToast();
  const [errorState, setErrorState] = useState<ErrorState>({ 
    error: null, 
    isError: false 
  });

  const handleError = useCallback((error: Error | unknown, context?: string) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    setErrorState({ error: errorObj, isError: true });
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'ErrorHandler'}]:`, errorObj);
    }
    
    // Show user-friendly toast
    toast({
      variant: "destructive",
      title: "Erro",
      description: context 
        ? `${context}: ${errorObj.message}`
        : errorObj.message
    });
  }, [toast]);

  const clearError = useCallback(() => {
    setErrorState({ error: null, isError: false });
  }, []);

  const asyncHandler = useCallback(
    <T extends unknown[]>(
      fn: (...args: T) => Promise<any>,
      context?: string
    ) => {
      return async (...args: T) => {
        try {
          clearError();
          return await fn(...args);
        } catch (error) {
          handleError(error, context);
          throw error;
        }
      };
    },
    [handleError, clearError]
  );

  return {
    ...errorState,
    handleError,
    clearError,
    asyncHandler
  };
}

export default useErrorHandler;