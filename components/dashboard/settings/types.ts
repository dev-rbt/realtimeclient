export interface SqlConnection {
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
}

export interface TestResult {
  success: boolean;
  message: string;
}
