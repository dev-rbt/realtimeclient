import { useEffect } from 'react';
import { useConnectionsStore } from '@/store/useConnectionsStore';

export const useConnections = () => {
  const { connections, error, isLoading, fetchConnections } = useConnectionsStore();

  useEffect(() => {
    fetchConnections();
    const interval = setInterval(fetchConnections, 60000); // 60 seconds (1 minute)

    return () => clearInterval(interval);
  }, [fetchConnections]);

  return { connections, error, isLoading };
};
