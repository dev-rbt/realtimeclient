export interface QueryTemplate {
  id: string;
  templateName: string;
  queries: QueryGroup[];
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface QueryGroup {
  id: string;
  queries: SubQuery[];
  type: string;
  name: string;
  primaryKey: string;
  includeBranchId: boolean;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface SubQuery {
  id: string;
  tableName: string;
  query: string;
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

export interface UpdateTemplateRequest {
  templateName: string;
  tenantId: string;
  isActive: boolean;
}
