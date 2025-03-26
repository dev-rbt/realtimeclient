'use client';

import Dashboard from '@/components/Dashboard';
import { useSystemMetrics } from '@/hooks/use-signalr';
import { useEffect, useState } from 'react';
import useApi from '@/hooks/use-api';
import { SystemLog } from '@/lib/types';

// Response type for the logs endpoint
interface LogsResponse {
  Logs: string[];
}

export default function Home() {
  const { metrics: systemMetrics, error: systemError } = useSystemMetrics();
  const [logs, setLogs] = useState<SystemLog[] | null>(null);
  const [logsError, setLogsError] = useState<string | null>(null);
  const api = useApi();

  // Fetch logs from the API endpoint every 35 seconds
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get<LogsResponse>('/logs/errors');
        
        if (!response.data || !response.data.Logs) {
          setLogsError('Invalid log data format received');
          return;
        }
        
        // Transform string logs into SystemLog objects
        const formattedLogs: SystemLog[] = response.data.Logs
          .filter(log => log) // Filter out any null/undefined logs
          .map((logMessage, index) => ({
            id: `error-log-${index}-${Date.now()}`, // Create a unique ID
            message: logMessage, // Keep the message as a string
            timestamp: new Date(), // Use current time as a Date object
            level: 'error', // All logs from /logs/errors are error level
          }));
        
        setLogs(formattedLogs);
        setLogsError(null);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setLogsError('Failed to fetch system logs');
        setLogs([]); // Set empty array instead of null to avoid UI errors
      }
    };

    // Initial fetch
    fetchLogs();

    // Set up polling interval (35 seconds)
    const intervalId = setInterval(fetchLogs, 35000);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [api]);

  return <Dashboard metrics={systemMetrics} error={systemError} logs={logs} logsError={logsError} />;
}