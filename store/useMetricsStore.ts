import { create } from 'zustand';
import { DocumentMetricsResponse } from '@/lib/types';
import useApi from '@/hooks/use-api';

interface MetricsState {
  metrics: DocumentMetricsResponse | null;
  lastUpdated: string | null;
  error: string | null;
  fetchMetrics: () => Promise<void>;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  metrics: null,
  lastUpdated: null,
  error: null,
  fetchMetrics: async () => {
    const api = useApi();
    try {
      const response = await api.get<DocumentMetricsResponse>('/system/tenant/metrics');
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      set({ metrics: response.data, lastUpdated: formattedDate, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch metrics' });
    }
  },
}));
