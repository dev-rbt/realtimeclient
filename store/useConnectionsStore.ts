import { create } from 'zustand';
import useApi from '@/hooks/use-api';

export interface SqlConnection {
  id: string;
  name: string;
  host: string;
  port: string;
  dbName: string;
  userName: string;
  password: string;
  trustServerCertificate: boolean;
  encrypt: boolean;
  connectTimeout: number;
  tenantId: string;
  sameSourceAndTarget: boolean;
}

interface ConnectionsState {
  connections: SqlConnection[];
  lastUpdated: string | null;
  error: string | null;
  isLoading: boolean;
  fetchConnections: () => Promise<void>;
}

export const useConnectionsStore = create<ConnectionsState>((set) => ({
  connections: [],
  lastUpdated: null,
  error: null,
  isLoading: false,
  
  fetchConnections: async () => {
    const api = useApi();
    set({ isLoading: true });
    
    try {
      const response = await api.get<SqlConnection[]>('/connection');
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      set({ 
        connections: response.data, 
        lastUpdated: formattedDate, 
        error: null,
        isLoading: false
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Bağlantılar yüklenirken bir hata oluştu.', 
        isLoading: false 
      });
    }
  }
}));
