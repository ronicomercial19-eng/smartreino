/**
 * Hook para monitoramento de performance - ETAPA 2
 * Rastreia tempos de carregamento e renderização
 */

import { useEffect, useRef } from 'react';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
}

export function usePerformanceMonitor(componentName: string) {
  const mountTimeRef = useRef<number>(Date.now());
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    const mountDuration = Date.now() - mountTimeRef.current;
    
    logger.debug('Component mounted', `Performance/${componentName}`, {
      mountTime: `${mountDuration}ms`,
      renderCount: renderCountRef.current
    });

    return () => {
      logger.debug('Component unmounted', `Performance/${componentName}`, {
        totalRenders: renderCountRef.current
      });
    };
  }, [componentName]);

  // Rastrear cada render
  useEffect(() => {
    renderCountRef.current += 1;
    
    if (renderCountRef.current > 10) {
      logger.warn('Excessive re-renders detected', `Performance/${componentName}`, {
        count: renderCountRef.current
      });
    }
  });

  return {
    renderCount: renderCountRef.current
  };
}

/**
 * Métricas simples de performance
 */
export function measurePerformance(label: string, fn: () => void) {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  
  logger.debug('Performance measurement', `Performance/${label}`, {
    duration: `${duration.toFixed(2)}ms`
  });
  
  return duration;
}
