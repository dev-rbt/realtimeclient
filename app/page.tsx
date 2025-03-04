'use client';

import Dashboard from '@/components/Dashboard';
import { useSystemMetrics } from '@/hooks/use-signalr';
import { useDocumentMetrics } from '@/hooks/useDocumentMetrics';

export default function Home() {

  const { metrics, error } = useDocumentMetrics();
  const { metrics: systemMetrics, error: systemError } = useSystemMetrics();
  
  return <Dashboard metrics={systemMetrics} error={systemError} />;
}