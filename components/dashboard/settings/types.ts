import { SqlConnection as StoreSqlConnection } from '@/store/useConnectionsStore';

// Extend the SqlConnection type from the store to include targetModel
export interface SqlConnection extends StoreSqlConnection {
  targetModel?: TargetConnections;
}

export interface TestResult {
  success: boolean;
  message: string;
}

export interface ConnectionTestResult {
  source: TestResult;
  target?: TestResult;
}

export interface TargetConnections {
  name: string;
  host: string;
  port: string;
  dbName: string;
  userName: string;
  password: string;
  trustServerCertificate: boolean;
  encrypt: boolean;
  connectTimeout: number;
}

export interface CreateConnectionModel {
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
  targetModel?: TargetConnections;
}

export interface UpdateConnectionModel {
  id: string;
  name: string;
  host: string;
  port: string;
  dbName: string;
  userName: string;
  password: string;
  trustServerCertificate: boolean;
  sameSourceAndTarget: boolean;
  encrypt: boolean;
  connectTimeout: number;
  tenantId: string;
  targetModel?: TargetConnections;
}
