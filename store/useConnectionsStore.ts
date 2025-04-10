import { create } from 'zustand';
import useApi from '@/hooks/use-api';
import { ConnectionWithSettings, TenantSettings } from '@/components/dashboard/settings/types';

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
  useNewComboMenu?: boolean;
  useCouponService?: boolean;
  workerIsEnabled?: boolean;
  cpmNotAllowGetData?: boolean;
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
      const response = await api.get<ConnectionWithSettings[]>('/connectionWithSettings');
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      // Merge connection and settings data
      const mergedConnections = response.data.map(item => {
        return {
          ...item.connection,
          useNewComboMenu: item.tenantSettings?.useNewComboMenu,
          useCouponService: item.tenantSettings?.useCouponService,
          workerIsEnabled: item.tenantSettings?.workerIsEnabled,
          cpmNotAllowGetData: item.tenantSettings?.cpmNotAllowGetData
        };
      });
      
      set({ 
        connections: mergedConnections, 
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
