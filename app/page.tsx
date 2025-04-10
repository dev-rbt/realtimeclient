'use client';

import Dashboard from '@/components/Dashboard';
import { useSystemMetrics } from '@/hooks/use-signalr';
import { useEffect, useState, useRef } from 'react';
import useApi from '@/hooks/use-api';
import { SystemLog } from '@/lib/types';

// Response type for the logs endpoint
interface LogsResponse {
  logs: string[];
}

export default function Home() {
  const { metrics: systemMetrics, error: systemError } = useSystemMetrics();
  const [logs, setLogs] = useState<SystemLog[] | null>(null);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const api = useApi();

  // Function to parse log level from log message
  const parseLogLevel = (logMessage: string): string => {
    // Extract log level from format like "[INF]", "[ERR]", etc.
    const match = logMessage.match(/\[(INF|ERR|WRN|DBG|FTL)\]/i);
    if (match) {
      const level = match[1].toLowerCase();
      switch (level) {
        case 'inf': return 'info';
        case 'err': return 'error';
        case 'wrn': return 'warning';
        case 'dbg': return 'debug';
        case 'ftl': return 'fatal';
        default: return 'info';
      }
    }
    return 'info'; // Default to info if no level found
  };

  // Function to parse timestamp from log message
  const parseTimestamp = (logMessage: string): Date => {
    // Extract timestamp from format like "2025-03-26 13:32:08.186 +03:00"
    const match = logMessage.match(/^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3}\s[+-]\d{2}:\d{2})/);
    if (match) {
      try {
        return new Date(match[1]);
      } catch (e) {
        console.error('Error parsing timestamp:', e);
      }
    }
    return new Date(); // Default to current time if parsing fails
  };

  // Function to fetch logs
  const fetchLogs = async () => {
    try {
      console.log('Fetching logs from /logs/errors');
      const response = await api.get<LogsResponse>('/logs/errors');
      
      if (!response.data || !response.data.logs) {
        setLogsError('Invalid log data format received');
        return;
      }
      
      // Transform string logs into SystemLog objects
      const formattedLogs: SystemLog[] = response.data.logs
        .filter(log => log) // Filter out any null/undefined logs
        .map((logMessage, index) => {
          const timestamp = parseTimestamp(logMessage);
          const level = parseLogLevel(logMessage);
          
          return {
            id: `log-${index}-${Date.now()}`, // Create a unique ID
            message: logMessage, // Keep the full message
            timestamp: timestamp,
            level: level,
          };
        });
      
      setLogs(formattedLogs);
      setLogsError(null);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogsError('Failed to fetch system logs');
      setLogs([]); // Set empty array instead of null to avoid UI errors
    }
  };

  // Set up polling effect
  useEffect(() => {
    // Initial fetch
    fetchLogs();
    
    // Set up polling interval only if enabled
    if (isPollingEnabled) {
      console.log('Setting up log polling interval (35 seconds)');
      intervalIdRef.current = setInterval(fetchLogs, 35000);
    }
    
    // Clean up on unmount
    return () => {
      if (intervalIdRef.current) {
        console.log('Clearing log polling interval');
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [isPollingEnabled]); // Only re-run if polling state changes

  return (
    <>
      <Dashboard 
        metrics={systemMetrics} 
        error={systemError} 
        logs={logs} 
        logsError={logsError} 
      />
    </>
  );
}