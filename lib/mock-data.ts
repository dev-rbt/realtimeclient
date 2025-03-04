import { Restaurant, SyncData, SystemMetrics, DatabaseConnection, AuditLog } from './types';

const syncTypes = ['tam', 'delta', 'anlık'] as const;
const dbTypes = ['sqlserver', 'mongodb'] as const;
const locations = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana', 'Konya', 'Trabzon'];

export function generateDatabaseConnections(): DatabaseConnection[] {
  return [
    {
      id: 'sql_main',
      name: 'Ana SQL Server',
      type: 'sqlserver',
      host: 'sql.robotpos.com',
      database: 'RobotPOS_Main',
      status: 'active',
      lastCheck: new Date(),
      performance: {
        connections: Math.floor(Math.random() * 1000),
        activeQueries: Math.floor(Math.random() * 500),
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
      },
    },
    {
      id: 'sql_backup',
      name: 'Yedek SQL Server',
      type: 'sqlserver',
      host: 'sql-backup.robotpos.com',
      database: 'RobotPOS_Backup',
      status: 'active',
      lastCheck: new Date(),
      performance: {
        connections: Math.floor(Math.random() * 1000),
        activeQueries: Math.floor(Math.random() * 500),
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
      },
    },
    {
      id: 'mongo_main',
      name: 'Ana MongoDB',
      type: 'mongodb',
      host: 'mongo.robotpos.com',
      database: 'RobotPOS',
      status: 'active',
      lastCheck: new Date(),
      performance: {
        connections: Math.floor(Math.random() * 1000),
        activeQueries: Math.floor(Math.random() * 500),
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
      },
    },
  ];
}

export function generateAuditLogs(count: number): AuditLog[] {
  const actions = ['sync', 'error', 'config_change', 'connection', 'system'] as const;
  const statuses = ['success', 'error', 'warning'] as const;

  return Array.from({ length: count }, (_, i) => ({
    id: `log_${i}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000),
    action: actions[Math.floor(Math.random() * actions.length)],
    description: `Örnek log kaydı ${i + 1}`,
    source: Math.random() > 0.5 ? 'MongoDB' : 'SQL Server',
    destination: Math.random() > 0.5 ? 'MongoDB' : 'SQL Server',
    status: statuses[Math.floor(Math.random() * statuses.length)],
    details: {
      affectedRecords: Math.floor(Math.random() * 1000),
      duration: Math.floor(Math.random() * 5000),
    },
  }));
}

export function generateSyncData(restaurantId: string): SyncData {
  const source = Math.random() > 0.5 ? 'mongodb' : 'sqlserver';
  return {
    restaurantId,
    timestamp: new Date(),
    documentsProcessed: Math.floor(Math.random() * 1000),
    batchSize: Math.floor(Math.random() * 500),
    syncDuration: Math.random() * 5000,
    syncType: syncTypes[Math.floor(Math.random() * syncTypes.length)],
    source,
    destination: source === 'mongodb' ? 'sqlserver' : 'mongodb',
    status: Math.random() > 0.1 ? 'success' : Math.random() > 0.5 ? 'error' : 'processing',
  };
}

export function generateRestaurants(count: number): Restaurant[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `rest_${i + 1}`,
    name: `Restoran ${i + 1}`,
    location: locations[Math.floor(Math.random() * locations.length)],
    lastSync: new Date(),
    status: Math.random() > 0.1 ? 'active' : Math.random() > 0.5 ? 'error' : 'idle',
    totalDocuments: Math.floor(Math.random() * 50000),
    dataTransferred: Math.random() * 1024,
    syncFrequency: Math.floor(Math.random() * 60),
    lastBatchSize: Math.floor(Math.random() * 1000),
    sqlServerStatus: Math.random() > 0.1 ? 'connected' : 'error',
    mongoDbStatus: Math.random() > 0.1 ? 'connected' : 'error',
  }));
}

export function generateSystemMetrics(): SystemMetrics {
  return {
    activeConnections: Math.floor(Math.random() * 500),
    processedDocuments: Math.floor(Math.random() * 1000000),
    failedSync: Math.floor(Math.random() * 100),
    averageResponseTime: Math.random() * 100,
    lastUpdated: new Date(),
    cpuUsage: Math.random() * 100,
    memoryUsage: Math.random() * 100,
    networkLatency: Math.random() * 200,
    syncQueueLength: Math.floor(Math.random() * 1000),
    mongoDbStatus: {
      connections: Math.floor(Math.random() * 1000),
      activeQueries: Math.floor(Math.random() * 500),
      writeOps: Math.floor(Math.random() * 10000),
      readOps: Math.floor(Math.random() * 20000),
      avgQueryTime: Math.random() * 50,
      diskUsage: Math.random() * 80,
    },
    sqlServerStatus: {
      connections: Math.floor(Math.random() * 1000),
      activeQueries: Math.floor(Math.random() * 500),
      writeOps: Math.floor(Math.random() * 10000),
      readOps: Math.floor(Math.random() * 20000),
      avgQueryTime: Math.random() * 50,
      diskUsage: Math.random() * 80,
      deadlocks: Math.floor(Math.random() * 10),
      cacheMissRate: Math.random() * 10,
    },
  };
}