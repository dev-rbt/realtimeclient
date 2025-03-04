import { useEffect } from 'react';
import { useMetricsStore } from '@/store/useMetricsStore';

export const useDocumentMetrics = () => {
  const { metrics, error, fetchMetrics } = useMetricsStore();

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return { metrics, error };
};
