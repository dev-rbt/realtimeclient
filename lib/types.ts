export interface Restaurant {
  id: string;
  name: string;
  location: string;
  lastSync: Date;
  status: 'active' | 'error' | 'idle';
  totalDocuments: number;
  dataTransferred: number;
  syncFrequency: number;
  lastBatchSize: number;
  sqlServerStatus: 'connected' | 'disconnected' | 'error';
  mongoDbStatus: 'connected' | 'disconnected' | 'error';
}

export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'sqlserver' | 'mongodb';
  host: string;
  database: string;
  status: 'active' | 'error' | 'maintenance';
  lastCheck: Date;
  performance: {
    connections: number;
    activeQueries: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
}

export interface SyncData {
  restaurantId: string;
  timestamp: Date;
  documentsProcessed: number;
  batchSize: number;
  syncDuration: number;
  syncType: 'tam' | 'delta' | 'anlık';
  source: 'mongodb' | 'sqlserver';
  destination: 'mongodb' | 'sqlserver';
  status: 'success' | 'error' | 'processing';
}

export interface SystemMetrics {
  cpuUsage: number;
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  diskUsage: number;
  networkReceived: number;
  networkSent: number;
}

interface TotalCount {
  count: number;
  size: number;
}

interface ReportData {
  reportName: string;
  totalSuccess: TotalCount;
  totalProcessing: TotalCount;
  totalError: TotalCount;
  totalIgnore: TotalCount;
}

interface BranchData {
  branchId: number;
  isActive: boolean;
  reports: ReportData[];
  totalSuccess: TotalCount;
  totalProcessing: TotalCount;
  totalError: TotalCount;
  totalIgnore: TotalCount;
}

interface TenantData {
  activeBranches: number;
  passiveBranches: number;
  databaseConnection: boolean;
  totalSuccess: TotalCount;
  totalProcessing: TotalCount;
  totalError: TotalCount;
  totalIgnore: TotalCount;
  branches: BranchData[];
}

export interface DocumentMetricsResponse {
  tenants: {
    [key: string]: TenantData;
  };
}

export interface CompanyMetrics {
  companyCode: string;
  branches: {
    active: number;
    passive: number;
  };
  transactions: {
    successful: number;
    failed: number;
    processing: number;
  };
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: 'sync' | 'error' | 'config_change' | 'connection' | 'system';
  description: string;
  source: string;
  destination?: string;
  status: 'success' | 'error' | 'warning';
  details: Record<string, any>;
}