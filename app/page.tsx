'use client';

import Dashboard from '@/components/Dashboard';
import { useLogs, useSystemMetrics } from '@/hooks/use-signalr';
import { useDocumentMetrics } from '@/hooks/useDocumentMetrics';
import { useMetricsStore } from '@/store/useMetricsStore';
import { useEffect } from 'react';

export default function Home() {

  const { fetchMetrics } = useMetricsStore();

  useEffect(() => {
    fetchMetrics();
  }, []);
  const { metrics: systemMetrics, error: systemError } = useSystemMetrics();
  const { logs, error: logsError } = useLogs();
  

  return <Dashboard metrics={systemMetrics} error={systemError} logs={logs} logsError={logsError} />;
}