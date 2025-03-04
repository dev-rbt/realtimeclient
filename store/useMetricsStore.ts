import { create } from 'zustand';
import { DocumentMetricsResponse } from '@/lib/types';
import useApi from '@/hooks/use-api';

interface MetricsState {
  metrics: DocumentMetricsResponse | null;
  error: string | null;
  fetchMetrics: () => Promise<void>;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  metrics: null,
  error: null,
  fetchMetrics: async () => {
    const api = useApi();
    try {
      const response = await api.get<DocumentMetricsResponse>('/system/tenant/metrics');
      set({ metrics: response.data, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch metrics' });
    }
  },
}));
