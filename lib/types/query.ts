export interface QueryAttribute {
  tableName: string;
  query: string;
  id?: string;
}

export interface QueryGroup {
  id: string;
  name: string;
  type: string;
  primaryKey: string;
  includeBranchId: boolean;
  queries: QueryAttribute[];
  createdAt: string;
  lastUpdatedAt: string;
}

export interface QueryTemplate {
  id: string;
  templateName: string;
  queries: QueryGroup[];
  tenantId: string;
  isDefault: boolean;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface QueryTargetSettings {
  id: string | null;
  isMomentary: boolean;
}

export interface CreateQueryRequest {
  name: string;
  key: string;
  query: string;
  intervalMs: number;
  collectionId: string;
  tenantId: string; // Firma kısa kodu
}

export interface UpdateQueryRequest {
  query: string;
  key: string;
  name: string;
  intervalMs: number;
  targetSettings: {
    isMomentary: boolean;
  };
  tenantId: string; // Firma kısa kodu
}

export interface CreateTemplateRequest {
  templateName: string;
  tenants: string[];
  isDefault: boolean;
}

export interface UpdateTemplateRequest {
  templateName: string;
  tenants: string[];
  isDefault: boolean;
}

export interface CreateQueryGroupRequest {
  templateId: string;
  name: string;
  type: string;
  primaryKey: string;
  includeBranchId: boolean;
  queries: QueryAttribute[];
}

export interface UpdateQueryGroupRequest {
  templateId: string;
  name: string;
  type: string;
  primaryKey: string;
  includeBranchId: boolean;
  queries: QueryAttribute[];
}
