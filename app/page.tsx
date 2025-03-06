'use client';

import Dashboard from '@/components/Dashboard';
import { useLogs, useSystemMetrics } from '@/hooks/use-signalr';
import { useDocumentMetrics } from '@/hooks/useDocumentMetrics';

export default function Home() {

  const { metrics, error } = useDocumentMetrics();
  const { metrics: systemMetrics, error: systemError } = useSystemMetrics();
  const { logs, error: logsError } = useLogs();
  
  return <Dashboard metrics={systemMetrics} error={systemError} logs={logs} logsError={logsError} />;
}