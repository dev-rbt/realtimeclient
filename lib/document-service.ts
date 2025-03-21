import { Document, DocumentFilter, DocumentStatus, DateRangeOption, TenantQueriesResponse, TenantTemplate } from './document-types';
import useApi from '@/hooks/use-api';
import { useQueryStore } from '@/stores/useQueryStore';

// Get documents from API
export const getDocuments = async (filter: DocumentFilter): Promise<Document[]> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filter.tenantId) params.append('tenantId', filter.tenantId);
    if (filter.dataType) params.append('dataType', filter.dataType);
    if (filter.status) params.append('status', filter.status);
    if (filter.dateRange) params.append('dateRange', filter.dateRange);
    if (filter.primaryKey) params.append('primaryKey', filter.primaryKey);
    if (filter.primaryKeyValue) params.append('primaryKeyValue', filter.primaryKeyValue);
    
    // Make API call
    const api = useApi();
    const response = await api.get<Document[]>(`/system/analyse?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    
    // For development fallback to mock data
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock data for development');
      return generateMockDocuments(20);
    }
    
    throw error;
  }
};

// Mock data for development purposes (keeping this for fallback)
export const generateMockDocuments = (count: number): Document[] => {
  const statuses = ['Created', 'Processing', 'Completed', 'Error', 'Ignore'];
  const tenants = ['ABC', 'XYZ', 'DEF', 'GHI', 'JKL'];
  const dataTypes = ['Sales', 'Inventory', 'Customer', 'Payment', 'Order'];
  
  return Array.from({ length: count }, (_, i) => {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
    
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + 90); // 90 days retention
    
    return {
      id: `doc_${i}_${Date.now()}`,
      referenceCode: `REF-${Math.floor(Math.random() * 1000000)}`,
      branchId: Math.floor(Math.random() * 100) + 1,
      tenantId: tenants[Math.floor(Math.random() * tenants.length)],
      lastDocumentStatus: statuses[Math.floor(Math.random() * statuses.length)] as any,
      errorCount: Math.floor(Math.random() * 3),
      workFlow: [
        {
          status: 'Created' as any,
          timestamp: new Date(createdAt),
          message: 'Document created'
        }
      ],
      data: {
        type: dataTypes[Math.floor(Math.random() * dataTypes.length)],
        content: { 
          id: Math.floor(Math.random() * 1000),
          name: `Sample ${dataTypes[Math.floor(Math.random() * dataTypes.length)]} Data`,
          amount: Math.floor(Math.random() * 10000) / 100,
          items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
            id: j,
            name: `Item ${j}`,
            quantity: Math.floor(Math.random() * 10) + 1,
            price: Math.floor(Math.random() * 1000) / 100
          }))
        }
      },
      createdAt,
      expiresAt
    };
  });
};

// Function to filter documents based on filter criteria
const filterDocuments = (documents: Document[], filter: DocumentFilter): Document[] => {
  return documents.filter(doc => {
    if (filter.tenantId && doc.tenantId !== filter.tenantId) return false;
    if (filter.dataType && doc.data.type !== filter.dataType) return false;
    if (filter.status && doc.lastDocumentStatus !== filter.status) return false;
    
    if (filter.dateRange) {
      const docDate = new Date(doc.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      switch (filter.dateRange) {
        case DateRangeOption.Today:
          if (docDate < today) return false;
          break;
        case DateRangeOption.Yesterday:
          if (docDate < yesterday || docDate >= today) return false;
          break;
        case DateRangeOption.LastWeek:
          if (docDate < lastWeek) return false;
          break;
        case DateRangeOption.All:
          // No filtering
          break;
      }
    }
    
    return true;
  });
};

// Get data type options from API
export const getDataTypeOptions = async (tenantId?: string): Promise<{ value: string; label: string; primaryKey: string }[]> => {
  if (!tenantId) {
    return []; // Return empty array if no tenant is selected
  }
  
  const api = useApi();
  
  try {
    // Make API call to get tenant templates
    const response = await api.get<TenantQueriesResponse>(`/queries/tenant/${tenantId}`);
    
    // Extract template names from the response
    const templates = response.data.template;
    
    // Convert to the format expected by the dropdown
    return templates.map(template => ({
      value: template.type,
      primaryKey: template.primaryKey,
      label: template.name
    }));
  } catch (error) {
    console.error('Error fetching tenant templates:', error);
    return []; // Return empty array in case of error
  }
};

// Get status options for dropdown
export const getStatusOptions = async (): Promise<{ value: string; label: string }[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return [
    { value: 'all', label: 'Tümü' },
    { value: DocumentStatus.Created, label: 'Oluşturuldu' },
    { value: DocumentStatus.Processing, label: 'İşleniyor' },
    { value: DocumentStatus.Completed, label: 'Tamamlandı' },
    { value: DocumentStatus.Error, label: 'Hata' },
    { value: DocumentStatus.Ignore, label: 'Yok Sayıldı' }
  ];
};

// Get date range options for dropdown
export const getDateRangeOptions = async (): Promise<{ value: string; label: string }[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return [
    { value: DateRangeOption.Today, label: 'Bugün' },
    { value: DateRangeOption.Yesterday, label: 'Dün' },
    { value: DateRangeOption.ThisWeek, label: 'Bu Hafta' },
    { value: DateRangeOption.LastWeek, label: 'Geçen Hafta' },
    { value: DateRangeOption.All, label: 'Tümü' }
  ];
};
