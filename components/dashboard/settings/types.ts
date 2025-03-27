import { SqlConnection as StoreSqlConnection } from '@/store/useConnectionsStore';

// Extend the SqlConnection type from the store to include targetConnection
export interface SqlConnection extends StoreSqlConnection {
  targetConnection?: TargetConnections;
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
  targetConnection?: TargetConnections;
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
  targetConnection?: TargetConnections;
}
