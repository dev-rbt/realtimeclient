export enum DocumentStatus {
  Created = 'Created',
  Processing = 'Processing',
  Completed = 'Completed',
  Error = 'Error',
  Ignore = 'Ignore'
}

export interface WorkFlow {
  status: DocumentStatus;
  timestamp: Date;
  message?: string;
  // Add alternative field names that might be in the API response
  documentStatus?: DocumentStatus;
  createdAt?: Date;
  description?: string;
}

export enum DateRangeOption {
  Today = 'Today',
  Yesterday = 'Yesterday',
  ThisWeek = 'ThisWeek',
  LastWeek = 'LastWeek',
  All = 'All'
}

export interface DateRangeOptionType {
  value: DateRangeOption;
  label: string;
}

export interface Document {
  id: string;
  referenceCode: string;
  branchId: number;
  tenantId: string;
  lastDocumentStatus: DocumentStatus;
  errorCount: number;
  workFlow?: WorkFlow[];
  data: Record<string, any>;
  createdAt: Date;
  expiresAt: Date;
}

export interface DocumentFilter {
  tenantId?: string;
  dataType?: string;
  status?: DocumentStatus;
  dateRange?: DateRangeOption;
  primaryKey?: string;
  primaryKeyValue?: string;
}

export interface TenantOption {
  value: string;
  label: string;
}

export interface DataTypeOption {
  value: string;
  primaryKey: string;
  label: string;
}

export interface StatusOption {
  value: DocumentStatus | 'all';
  label: string;
}

// Types for tenant queries response
export interface QueryAttr {
  id: string;
  name: string;
  query: string;
}

export interface TenantTemplate {
  queries: QueryAttr[];
  type: string;
  name: string;
  primaryKey: string;
  includeBranchId: boolean;
}

export interface TemplateProperties {
  lastUpdatedAt: string;
}

export interface TenantQueriesResponse {
  template: TenantTemplate[];
  properties: TemplateProperties;
}
