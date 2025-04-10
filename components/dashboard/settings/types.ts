import { SqlConnection as StoreSqlConnection } from '@/store/useConnectionsStore';

// Extend the SqlConnection type from the store to include targetConnection
export interface SqlConnection extends StoreSqlConnection {
  targetConnection?: TargetConnections;
  useNewComboMenu?: boolean;
  useCouponService?: boolean;
  workerIsEnabled?: boolean;
  cpmNotAllowGetData?: boolean;
}

export interface TenantSettings {
  id?: string;
  tenantId: string;
  useNewComboMenu: boolean;
  useCouponService: boolean;
  workerIsEnabled: boolean;
  cpmNotAllowGetData: boolean;
}

export interface ConnectionWithSettings {
  connection: SqlConnection;
  tenantSettings: TenantSettings;
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
  tenantId?: string;
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
  useNewComboMenu?: boolean;
  useCouponService?: boolean;
  workerIsEnabled?: boolean;
  cpmNotAllowGetData?: boolean;
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
  encrypt: boolean;
  connectTimeout: number;
  tenantId: string;
  sameSourceAndTarget: boolean;
  targetConnection?: TargetConnections;
  useNewComboMenu?: boolean;
  useCouponService?: boolean;
  workerIsEnabled?: boolean;
  cpmNotAllowGetData?: boolean;
}
